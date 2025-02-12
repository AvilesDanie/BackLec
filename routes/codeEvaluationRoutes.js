const express = require('express');
const router = express.Router();
const { evaluarCodigo } = require('../controllers/codeEvaluationController');

// Evaluar el código
router.post('/evaluate', evaluarCodigo);

module.exports = router;
