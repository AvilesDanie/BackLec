const express = require('express');
const router = express.Router();
const { createExecutionResult, getExecutionResults, getExecutionResultById, deleteExecutionResult } = require('../controllers/executionResultController');

// Crear resultado de ejecución
router.post('/execution-results', createExecutionResult);

// Obtener todos los resultados de ejecución
router.get('/execution-results', getExecutionResults);

// Obtener un resultado de ejecución por su ID
router.get('/execution-results/:id', getExecutionResultById);

// Eliminar un resultado de ejecución por su ID
router.delete('/execution-results/:id', deleteExecutionResult);

module.exports = router;
