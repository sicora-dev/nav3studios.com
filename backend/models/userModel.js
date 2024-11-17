const pool = require('../config/db');
const moment = require('moment-timezone');

const getCurrentTimestamp = () => {
  return moment().tz('Europe/Madrid').format(); // Formato ISO 8601 ajustado a la zona horaria de España
};

const getAllUsers = async () => {
  const result = await pool.query('SELECT id,username,email,role_id,created_at,last_login FROM users');
  return result.rows;
};

const getUserById = async (id) => {
  const result = await pool.query('SELECT * FROM users WHERE id= $1',
    [id]
  )
  return result.rows[0];
}

const findUserByEmailOrUsername = async (identifier) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1 OR username = $2',
    [identifier, identifier]
  );
  return result.rows[0];
};

const setLastLogin = async (id) => {
  const currentTimestamp = getCurrentTimestamp();
  const result = await pool.query(
    'UPDATE users SET last_login = $1 WHERE id = $2',
    [currentTimestamp, id]
  );
  return result;
};

const findUserByEmail = async (email) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
};
const findUserByUsername = async (username) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE username = $1',
    [username]
  );
  return result.rows[0];
};

const updateUsername = async (userId, newUsername) => {
  const result = await pool.query(
    'UPDATE users SET username = $1 WHERE id = $2 RETURNING *',
    [newUsername, userId]
  );
  console.log(result.rows[0]);
  return result.rows[0];
};

const updateEmail = async (userId, newEmail) => {
  const result = await pool.query(
    'UPDATE users SET email = $1 WHERE id = $2 RETURNING *',
    [newEmail, userId]
  );
  console.log(result.rows[0]);
  return result.rows[0];
};

const updatePassword = async (userId, hashedPassword) => {
  const result = await pool.query(
    'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING *',
    [hashedPassword, userId]
  );
  return result.rows[0];
};

const createUser = async (username, email, password_hash, token) => {
  const result = await pool.query(
    'INSERT INTO users (username, email, password_hash, verification_token) VALUES ($1, $2, $3, $4) RETURNING *',
    [username, email, password_hash, token]
  );
  return result.rows[0];
};

const verifyEmail = async (token) => {
  console.log(token);
  const result = await pool.query(
    'UPDATE users SET is_verified = true, verification_token = null WHERE verification_token = $1 RETURNING *',
    [token]
  );
  console.log('Filas afectadas:', result.rowCount);
  return {
    success: result.rowCount > 0,
    user: result.rows[0]
  };
}


module.exports = {
  getAllUsers,
  findUserByEmailOrUsername,
  findUserByEmail,
  findUserByUsername,
  getUserById,
  setLastLogin,
  updateUsername,
  updateEmail,
  updatePassword,
  createUser,
  verifyEmail
  
};