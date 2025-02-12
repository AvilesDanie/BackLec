const express = require('express');
const router = express.Router();
const { getCodewarsChallenge } = require('../controllers/codewarsController');

// Obtener un desafío de Codewars por su ID
router.get('/codewars/challenge/:id', getCodewarsChallenge);

module.exports = router;
