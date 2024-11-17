const producerModel = require("../models/producerModel");

const getProducers = async (req, res) => {
  try {
    const producers = await producerModel.getAllProducers();
    res.json(producers);
  } catch (err) {
    console.error("Error fetching producers:", err);
    res.status(500).send("Server error");
  }
};

module.exports = {
  getProducers,
};
