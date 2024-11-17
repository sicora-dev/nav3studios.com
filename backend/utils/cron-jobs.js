const cron = require("node-cron");
const pool = require("../config/db"); // Asegúrate de tener la configuración de DB en las variables de entorno


async function cancelExpiredBookings() {
  try {
    const now = new Date(); // Fecha y hora actual

    const queryText = `
      UPDATE bookings
      SET status = 'canceled',
          cancellation_reason = 'Reserva cancelada automáticamente: Fecha de reserva ha expirado'
      WHERE status = 'pending' AND booking_date < $1
      RETURNING *;
    `;

    // Ejecuta la query de actualización
    const result = await pool.query(queryText, [now]);

    if (result.rowCount > 0) {
      console.log(
        `Cron job: ${result.rowCount} reservas canceladas automáticamente.`
      );
    } else {
      console.log("Cron job: No se encontraron reservas pendientes vencidas.");
    }
  } catch (err) {
    console.error("Cron job error al cancelar reservas:", err);
  }
}
// Iniciar el cron job
function initCronJobs() {
  // Ejecutar cada hora
  cron.schedule("* * * * *", async () => {
    try {
      await pool.query("SELECT delete_unverified_users()");
      console.log("Cron job: Unverified users cleanup completed");
    } catch (err) {
      console.error("Cron job error:", err);
    }
  });

  cron.schedule('0 * * * *', async () => {
    await cancelExpiredBookings();
  });
}

module.exports = { initCronJobs };
