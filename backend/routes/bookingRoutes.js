const express = require("express");
const bookingController = require("../controllers/bookingController");
const authenticateToken = require("../middlewares/authenticateToken");
const authorizeRoles = require("../middlewares/authorizeRoles");
const ROLES = require('../config/roles');
const router = express.Router();

router.get("/bookings", authenticateToken, bookingController.getBookings);
router.get(
  "/bookings/user",
  authenticateToken,
  bookingController.getBookingsByUser
);
router.get(
  "/bookings/producer",
  authenticateToken,
  authorizeRoles(ROLES.PRODUCER, ROLES.ADMIN),
  bookingController.getBookingsByProducer
);
router.put(
  "/bookings/update/:bookingID",
  authenticateToken,
  authorizeRoles(ROLES.PRODUCER, ROLES.ADMIN),
  bookingController.updateBooking
);
router.post(
  "/createBooking",
  authenticateToken,
  bookingController.createBooking
);
router.post(
  "/create-paypal-order",
  authenticateToken,
  bookingController.createPayPalOrder
);
router.post(
  "/capture-paypal-order/:orderID",
  authenticateToken,
  bookingController.capturePayPalOrder
);

// Pública - No requiere autenticación (asumiendo que es para verificar disponibilidad)
router.get("/bookings/date", bookingController.getBookingHoursByDate);

module.exports = router;
