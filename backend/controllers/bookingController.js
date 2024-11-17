const bookingModel = require("../models/bookingModel");
const paypalClient = require("../config/paypal");
const paypal = require("@paypal/checkout-server-sdk");

const pendingBookings = new Map();

const getBookings = async (req, res) => {
  try {
    const bookings = await bookingModel.getBookings();
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

const getBookingsByUser = async (req, res) => {
  const { userId } = req.query;
  try {
    const bookings = await bookingModel.getBookingsByUser(userId);
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

const getBookingsByProducer = async (req, res) => {
  const { producerId } = req.query;
  try {
    const bookings = await bookingModel.getBookingsByProducer(producerId);
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

const createBooking = async (req, res) => {
  const origin = req.headers.origin || req.headers.referer;
  console.log("Origin:", origin);

  if (origin !== process.env.FRONTEND_URL) {
    return res.status(403).json({ message: "Acceso prohibido" });
  }
  const { userId, producerId, serviceId, booking_date, payment_method } =
    req.body;

  if (
    !userId ||
    !producerId ||
    !serviceId ||
    !booking_date ||
    !payment_method
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const bookingDate = new Date(booking_date);
    if (isNaN(bookingDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }
    console.log("Booking date:", bookingDate);

    const hours = bookingDate.getHours();
    
    console.log("Hours:", hours);
    if (hours < 9 || hours > 19 || hours % 2 === 0) {
      return res.status(400).json({ error: "Invalid hour" });
    }
    const newBooking = await bookingModel.createBooking(
      userId,
      serviceId,
      producerId,
      payment_method,
      bookingDate
    );
    res.status(201).json(newBooking);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

const updateBooking = async (req, res) => {
  const { bookingID } = req.params;
  const { status } = req.body;
  try {
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }
    if (status === "accepted") {
      try {
        const acceptedBooking = await bookingModel.acceptBooking(bookingID);
        res.json(acceptedBooking);
      } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
      }
    }

    if (status === "canceled") {
      const { reason } = req.body;
      if (!reason) {
        return res.status(400).json({ error: "Reason is required" });
      }
      console.log("Reason:", reason);
      try {
        const canceledBooking = await bookingModel.cancelBooking(
          bookingID,
          reason
        );
        res.json(canceledBooking);
      } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

const getBookingHoursByDate = async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Date is required" });
  }

  try {
    const bookings = await bookingModel.getBookingHoursByDate(date);
    const occupiedHours = bookings
      .filter(booking => booking.status !== 'canceled')
      .map((booking) => parseInt(booking.hour));

    const allRanges = [];
    for (let i = 9; i < 21; i += 2) {
      allRanges.push(i);
    }
    const freeRanges = allRanges.filter(
      (range) => !occupiedHours.includes(range)
    );

    res.json({ freeRanges });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const createPayPalOrder = async (req, res) => {
  try {
    const { userId, producerId, serviceId, bookingDate, serviceName, amount } =
      req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      order_id: "default",
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: "default",
          description: `Reserva en NAV3 STUDIOS - ${serviceName}`,
          amount: {
            currency_code: "EUR",
            value: amount.toString(),
            breakdown: {
              item_total: {
                currency_code: "EUR",
                value: amount.toString(),
              },
            },
          },
          items: [
            {
              name: serviceName || "Servicio NAV3 STUDIOS",
              quantity: "1",
              unit_amount: {
                currency_code: "EUR",
                value: amount.toString(),
              },
              category: "DIGITAL_GOODS",
            },
          ],
        },
      ],
      application_context: {
        brand_name: "NAV3 STUDIOS",
        locale: "es-ES",
        landing_page: "LOGIN",
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
        return_url: `${process.env.FRONTEND_URL}/success`,
        cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      },
    });

    const order = await paypalClient.execute(request);

    pendingBookings.set(order.result.id, {
      userId,
      producerId,
      serviceId,
      bookingDate,
      payment_method: 2,
    });

    res.json({ orderId: order.result.id });
  } catch (error) {
    console.error("Error creating PayPal order:", error);
    res.status(500).json({ error: "Error creating payment" });
  }
};

const capturePayPalOrder = async (req, res) => {
  try {
    const { orderID } = req.params;
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    const capture = await paypalClient.execute(request);

    if (capture.result.status === "COMPLETED") {
      const bookingDetails = pendingBookings.get(orderID);
      if (!bookingDetails) throw new Error("Booking details not found");

      const booking = await bookingModel.createBooking(
        bookingDetails.userId,
        bookingDetails.serviceId,
        bookingDetails.producerId,
        bookingDetails.payment_method,
        new Date(bookingDetails.bookingDate)
      );

      pendingBookings.delete(orderID);
      res.json({ status: "COMPLETED", bookingId: booking.id });
    } else {
      res.status(400).json({ error: "Payment not completed" });
    }
  } catch (error) {
    console.error("Error capturing PayPal order:", error);
    res.status(500).json({ error: "Error processing payment" });
  }
};

module.exports = {
  getBookingsByUser,
  getBookingsByProducer,
  createBooking,
  getBookingHoursByDate,
  createPayPalOrder,
  capturePayPalOrder,
  getBookings,
  updateBooking,
};
