const express = require('express');
const router = express.Router();
const {
  createUser,
  getUsers,
  getUserById,
  deleteUser,
  updateUser,
  updateUserProgressUnified,
  login, // Importar el controlador de login
} = require('../controllers/userController');

// Iniciar sesión
router.post('/users/login', login);

// Actualizar progreso de un usuario
router.put('/users/progress-unified', updateUserProgressUnified);

// Crear usuario
router.post('/users', createUser);

// Obtener todos los usuarios
router.get('/users', getUsers);

// Obtener un usuario por su ID
router.get('/users/:id', getUserById);

// Eliminar un usuario por su ID
router.delete('/users/:id', deleteUser);

// Actualizar un usuario
router.put('/users/:id', updateUser);

module.exports = router;
