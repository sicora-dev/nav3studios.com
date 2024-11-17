const serviceModel = require("../models/serviceModel");

const getServices = async (req, res) => {
  try {
    const services = await serviceModel.getAllServices();
    res.json(services);
  } catch (err) {
    console.error("Error fetching services:", err); // Agregar registro de error
    res.status(500).send("Server error");
  }
};

const getServicePrice = async (req, res) => {
  const { serviceId } = req.params;
  try {
    const service = await serviceModel.getServicePrice(serviceId);
    res.json(service);
  } catch (err) {
    console.error("Error fetching service price:", err);
    res.status(500).json({ error: err.message });
  }
};

const getServiceName = async (req, res) => {
  const { serviceId } = req.params;
  try {
    const service = await serviceModel.getServiceName(serviceId);
    res.json(service);
  } catch (err) {
    console.error("Error fetching service name:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getServices,
  getServicePrice,
  getServiceName
};
