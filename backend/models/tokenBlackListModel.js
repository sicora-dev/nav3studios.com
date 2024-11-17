const pool = require("../config/db");

const blacklistToken = async (token, expiryTimestamp) => {
  const query = `
    INSERT INTO token_blacklist (token, expiry) 
    VALUES ($1, to_timestamp($2))
  `;
  await pool.query(query, [token, expiryTimestamp]);
};

const isBlacklisted = async (token) => {
  const query = `
    SELECT EXISTS (
      SELECT 1 FROM token_blacklist 
      WHERE token = $1 AND expiry > NOW()
    )
  `;
  const result = await pool.query(query, [token]);
  return result.rows[0].exists;
};

// Cleanup expired tokens
const cleanupBlacklist = async () => {
  const query = "DELETE FROM token_blacklist WHERE expiry < NOW()";
  await pool.query(query);
};

module.exports = { blacklistToken, isBlacklisted, cleanupBlacklist };
