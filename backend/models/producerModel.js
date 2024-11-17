const pool = require('../config/db');

const getAllProducers = async () => {
    const result = await pool.query('SELECT users.username, producers.id FROM producers JOIN users ON producers.user_id = users.id');
    return result.rows;
}


module.exports = {
    getAllProducers,
};