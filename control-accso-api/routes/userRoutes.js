const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Asegúrate de que la ruta sea correcta

// Rutas para registro e inicio de sesión
router.post('/register', userController.registerUser );
router.post('/login', userController.loginUser );
router.get('/usuarios', userController.getAllUsers); // Ruta para obtener todos los usuarios

module.exports = router;
