const pool = require("../config/db");

const getAllServices = async () => {
  const result = await pool.query("SELECT * FROM services ORDER BY id ASC");
  return result.rows;
};

const getServicePrice = async (serviceId) => {
  const result = await pool.query("SELECT price FROM services WHERE id = $1", [
    serviceId,
  ]);
  if (result.rows.length === 0) {
    throw new Error("Service not found");
  }
  return result.rows[0];
};

const getServiceName = async (serviceId) => {
  const result = await pool.query("SELECT name FROM services WHERE id = $1", [
    serviceId,
  ]);
  if (result.rows.length === 0) {
    throw new Error("Service not found");
  }
  return result.rows[0];
};

module.exports = {
  getAllServices,
  getServicePrice,
  getServiceName
};
