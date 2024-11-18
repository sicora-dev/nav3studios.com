const ROLES = require("../config/roles");

const authorizeRoles = (...allowedRoles) => {
    
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(parseInt(req.user.role))) {
      return res
        .status(403)
        .json({ message: "No tienes permisos para realizar esta acción" });
    }
    next();
  };
};

module.exports = authorizeRoles;
