const pool = require("../config/db");

const getBookings = async () => {
  const result = await pool.query("SELECT * FROM bookings ORDER BY id DESC");
  return result.rows;
};

const getBookingsByUser = async (userId) => {
  const result = await pool.query("SELECT * FROM bookings WHERE user_id = $1 ORDER BY id ASC", [userId]);
  return result.rows;
};

const getBookingsByProducer = async (producerId) => {
  const result = await pool.query(
    "SELECT b.* FROM bookings b INNER JOIN producers p ON b.producer_id = p.id INNER JOIN users u ON p.user_id = u.id WHERE u.id = $1",
    [producerId]
  );
  return result.rows;
};

const createBooking = async (userId, serviceId, producerId, payment_method, booking_date) => {
  const hours = booking_date.getHours();
  if (hours < 9 || hours > 19 || hours % 2 === 0) {
    throw new Error("Hora no válida");
  }

  const result = await pool.query(
    "INSERT INTO bookings (user_id, producer_id, service_id, booking_date, payment_method_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [userId, producerId, serviceId, booking_date, payment_method]
  );
  return result.rows[0];
};

const getBookingHoursByDate = async (date) => {
  const result = await pool.query(
    `SELECT EXTRACT(HOUR FROM booking_date) AS hour, status 
       FROM bookings 
       WHERE booking_date::date = $1::date 
       AND EXTRACT(HOUR FROM booking_date) BETWEEN 9 AND 19
       AND (status = 'pending' OR status = 'accepted')`,
    [date]
  );
  return result.rows;
};

const getBookingsByDate = async (date) => {
  const result = await pool.query(
    `SELECT * FROM bookings WHERE booking_date::date = $1::date`,
    [date]
  );
  return result.rows;
};

const acceptBooking = async (bookingID) => {
  const result = await pool.query(
    "UPDATE bookings SET status = 'accepted' WHERE id = $1 RETURNING *",
    [bookingID]
  );
  return result.rows[0];
}

const cancelBooking = async (bookingID, reason) => {
  const result = await pool.query(
    "UPDATE bookings SET status = 'canceled', cancellation_reason = $2 WHERE id = $1 RETURNING *",
    [bookingID, reason]
  );
  return result.rows[0];
}

module.exports = {
  getBookingsByUser,
  getBookingsByProducer,
  createBooking,
  getBookingHoursByDate,
  getBookings,
  getBookingsByDate,
  acceptBooking,
  cancelBooking
};

