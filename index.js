const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const exerciseRoutes = require('./routes/exerciseRoutes');
const cors = require('cors');
const executionResultRoutes = require('./routes/executionResultRoutes');
const codewarsRoutes = require('./routes/codewarsRoutes'); // Importar las rutas de Codewars
const codeEvaluationRoutes = require('./routes/codeEvaluationRoutes'); // Importar las rutas de evaluación
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

// Usar las rutas
app.use('/api', userRoutes);
app.use('/api', exerciseRoutes);
app.use('/api', executionResultRoutes);
app.use('/api', codewarsRoutes); // Usar las rutas de Codewars
app.use('/api', codeEvaluationRoutes); // Usar las rutas de evaluación

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
