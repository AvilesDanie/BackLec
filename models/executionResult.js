const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const executionResultSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  exercise: {
    type: Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  result: {
    type: String, // Resultado de la ejecución (Ej. "Passed" o "Failed")
    required: true,
  },
  executionTime: {
    type: Number, // Tiempo de ejecución en ms
    required: true,
  },
  score: {
    type: Number, // Puntuación obtenida en el ejercicio
    required: true,
  },
  adaptabilityDecision: {
    type: String, // Decisión tomada para la adaptabilidad ("Increase Difficulty", "Keep Same", "Decrease Difficulty")
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ExecutionResult', executionResultSchema);
