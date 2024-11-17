const express = require('express');
const userController = require('../controllers/userController');
const authenticateToken = require('../middlewares/authenticateToken');
const router = express.Router();

// Protegidas - requieren autenticación
router.get('/users', authenticateToken, userController.getUsers);
router.get('/user-token', authenticateToken, userController.getUserByToken);
router.patch('/update-username', authenticateToken, userController.updateUsername);
router.patch('/update-email', authenticateToken, userController.updateEmail);
router.patch('/update-password', authenticateToken, userController.updatePassword);

// Públicas - No requieren autenticación
router.post('/register', userController.createUser);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/verify-email/:token', userController.verifyEmail);

module.exports = router;