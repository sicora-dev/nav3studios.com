const userModel = require("../models/userModel");
const tokenBlacklist = require("../models/tokenBlackListModel");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
  sendVerificationEmail,
  isValidEmail,
} = require("../services/emailService");

const argon2 = require("argon2");

const argon2Config = {
  type: argon2[process.env.ARGON2_TYPE],
  timeCost: parseInt(process.env.ARGON2_TIMECOST),
  memoryCost: parseInt(process.env.ARGON2_MEMORYCOST),
  parallelism: parseInt(process.env.ARGON2_PARALLELISM),
};

const validatePassword = (password) => {
  // Minimum 8 characters
  if (password.length < 8) {
    return "La contraseña debe tener al menos 8 caracteres";
  }

  // Must contain at least one number
  if (!/\d/.test(password)) {
    return "La contraseña debe contener al menos un número";
  }

  // Must contain at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return "La contraseña debe contener al menos una letra minúscula";
  }

  // Must contain at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return "La contraseña debe contener al menos una letra mayúscula";
  }

  // Must contain at least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return "La contraseña debe contener al menos un carácter especial";
  }

  return null; // Password is valid
};

const getUsers = async (req, res) => {
  const origin = req.headers.origin || req.headers.referer;
  console.log("Origin:", origin);

  if (origin !== process.env.FRONTEND_URL) {
    return res.status(403).json({ message: "Acceso prohibido" });
  }
  try {
    const users = await userModel.getAllUsers();
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err); // Agregar registro de error
    res.status(500).send("Server error");
  }
};

const getUserByToken = async (req, res) => {
  const token = req.cookies.access_token;
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decode.userId;
    const user = await userModel.getUserById(userId);
    if (user) {
      return res.status(200).json(user);
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const createUser = async (req, res) => {
  const origin = req.headers.origin || req.headers.referer;
  console.log("Origin:", origin);

  if (origin !== process.env.FRONTEND_URL) {
    return res.status(403).json({ message: "Acceso prohibido" });
  }

  const { username, email, password, password2 } = req.body;

  try {
    const isValid = await isValidEmail(email);
    if (!isValid) {
      return res.status(400).json({
        message:
          "Por favor, introduce un email válido (gmail.com, hotmail.com, ...) y existente",
      });
    }

    const isValidPassword = validatePassword(password);
    if (isValidPassword) {
      return res.status(400).json({ message: isValidPassword });
    }

    if (password !== password2) {
      return res.status(400).json({ message: "Las contraseñas no coinciden" });
    }

    const existingEmail = await userModel.findUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ message: "Email ya registrado" });
    }

    const existingUsername = await userModel.findUserByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ message: "Nombre de usuario ya existe" });
    }

    const verify_token = crypto.randomBytes(16).toString("hex");

    const password_hash = await argon2.hash(password, argon2Config);
    const newUser = await userModel.createUser(
      username,
      email,
      password_hash,
      verify_token
    );

    const emailSent = await sendVerificationEmail(email, verify_token);

    res.status(201).json({
      message: "Registro exitoso",
      username: newUser.username,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: err.message || "Error del servidor" });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const user = await userModel.verifyEmail(token);
    if (user) {
      return res.status(200).json({ message: "Email verificado" });
    }
    return res.status(404).json({ message: "Token inválido" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};

const login = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    // 1. Busca al usuario en la base de datos por email o nombre de usuario
    const user = await userModel.findUserByEmailOrUsername(identifier);

    if (!user) {
      return res.status(400).json({
        message: "Credenciales inválidas",
      });
    }

    // 2. Verifica que el usuario tenga el email confirmado
    if (user.is_verified === false) {
      return res.status(400).json({
        message: "Email no verificado",
      });
    }

    // 3. Verifica que la contraseña coincida
    const isMatch = await argon2.verify(user.password_hash, password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Credenciales inválidas",
      });
    }

    // 4. Genera el token JWT, incluyendo el `userId` y el `role`
    const token = jwt.sign(
      { userId: user.id, role: user.role_id }, // El rol se incluye aquí en el payload del token
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 5. Establece una cookie segura con el token de acceso
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Solo en https en producción
      sameSite: "strict",
      maxAge: 3600000, // 1 hora en milisegundos
    });

    // 6. Actualiza el último login del usuario
    await userModel.setLastLogin(user.id);

    // 7. Responde con éxito y algunos datos del usuario (sin información sensible)
    res.status(200).json({
      message: "Inicio de sesión exitoso",
      username: user.username,
    });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({
      message: "Error del servidor",
    });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.cookies.access_token;
    if (token) {
      const decoded = jwt.decode(token);
      await tokenBlacklist.blacklistToken(token, decoded.exp);
    }

    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    res.status(200).json({ message: "Sesión cerrada" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Error al cerrar sesión" });
  }
};

const updateUsername = async (req, res) => {
  const { newUsername, userId } = req.body;

  try {
    const user = await userModel.updateUsername(userId, newUsername);
    console.log("Username updated:", user);
    res.status(200).json({
      success: true,
      message: "Nombre de usuario actualizado correctamente",
      user: user,
    });
  } catch (err) {
    console.error("Error updating username:", err);
    res.status(500).json({
      success: false,
      message: "Error al actualizar el nombre de usuario",
      error: err.message,
      code: err.code,
    });
  }
};

const updateEmail = async (req, res) => {
  const { newEmail, userId } = req.body;

  try {
    const user = await userModel.updateEmail(userId, newEmail);
    console.log("Email updated:", user);
    res.status(200).json({
      success: true,
      message: "Email actualizado correctamente",
      user: user,
    });
  } catch (err) {
    console.error("Error updating email:", err);
    res.status(500).json({
      success: false,
      message: "Error al actualizar el email",
      error: err.message,
      code: err.code,
    });
  }
};

const updatePassword = async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  try {
    const user = await userModel.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
        code: "USER_NOT_FOUND",
      });
    }

    if (!user.password_hash) {
      return res.status(400).json({
        success: false,
        message: "Error: No hay contraseña establecida para este usuario",
        code: "NO_PASSWORD_SET",
      });
    }

    const isValid = await argon2.verify(user.password_hash, currentPassword);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "La contraseña actual es incorrecta",
        code: "INVALID_PASSWORD",
      });
    }

    const hashedPassword = await argon2.hash(newPassword, argon2Config);
    const updatedUser = await userModel.updatePassword(userId, hashedPassword);

    res.status(200).json({
      success: true,
      message: "Contraseña actualizada exitosamente",
      user: updatedUser,
    });
  } catch (err) {
    if (err.code === "23505") {
      // PostgreSQL unique constraint violation
      res.status(400).json({
        success: false,
        message: "Este nombre de usuario ya existe",
        code: "DUPLICATE_USERNAME",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error al actualizar el nombre de usuario",
        error: err.message,
        code: err.code,
      });
    }
  }
};

module.exports = {
  getUsers,
  createUser,
  login,
  getUserByToken,
  updateUsername,
  updateEmail,
  updatePassword,
  verifyEmail,
  logout,
};
