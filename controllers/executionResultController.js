const ExecutionResult = require('../models/executionResult');

// Crear un nuevo resultado de ejecución
const createExecutionResult = async (req, res) => {
  try {
    const { user, exercise, code, result, executionTime, score, adaptabilityDecision } = req.body;
    const newExecutionResult = new ExecutionResult({ user, exercise, code, result, executionTime, score, adaptabilityDecision });
    await newExecutionResult.save();
    res.status(201).json(newExecutionResult);
  } catch (error) {
    console.error("Error al crear resultado de ejecución:", error);
    res.status(500).json({ error: "Error al crear el resultado de ejecución" });
  }
};

// Obtener todos los resultados de ejecución
const getExecutionResults = async (req, res) => {
  try {
    const executionResults = await ExecutionResult.find();
    res.status(200).json(executionResults);
  } catch (error) {
    console.error("Error al obtener resultados de ejecución:", error);
    res.status(500).json({ error: "Error al obtener los resultados de ejecución" });
  }
};

// Obtener un resultado de ejecución por su ID
const getExecutionResultById = async (req, res) => {
  try {
    const executionResult = await ExecutionResult.findById(req.params.id);
    if (!executionResult) {
      return res.status(404).json({ error: "Resultado de ejecución no encontrado" });
    }
    res.status(200).json(executionResult);
  } catch (error) {
    console.error("Error al obtener resultado de ejecución:", error);
    res.status(500).json({ error: "Error al obtener el resultado de ejecución" });
  }
};

// Eliminar un resultado de ejecución por su ID
const deleteExecutionResult = async (req, res) => {
  try {
    const executionResult = await ExecutionResult.findByIdAndDelete(req.params.id);
    if (!executionResult) {
      return res.status(404).json({ error: "Resultado de ejecución no encontrado" });
    }
    res.status(200).json({ message: "Resultado de ejecución eliminado" });
  } catch (error) {
    console.error("Error al eliminar resultado de ejecución:", error);
    res.status(500).json({ error: "Error al eliminar el resultado de ejecución" });
  }
};

module.exports = { createExecutionResult, getExecutionResults, getExecutionResultById, deleteExecutionResult };
