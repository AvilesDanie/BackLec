const Exercise = require('../models/exercise');
const axios = require('axios');
const User = require('../models/user');
const mongoose = require('mongoose'); // Importar Mongoose

// Crear un nuevo ejercicio
const createExercise = async (req, res) => {
  try {
    const { codewarsId, difficulty, answer } = req.body;
    const newExercise = new Exercise({ codewarsId, difficulty, answer });
    await newExercise.save();
    res.status(201).json(newExercise);
  } catch (error) {
    console.error("Error al crear ejercicio:", error);
    res.status(500).json({ error: "Error al crear el ejercicio" });
  }
};

// Obtener todos los ejercicios
const getExercises = async (req, res) => {
  try {
    const exercises = await Exercise.find();
    res.status(200).json(exercises);
  } catch (error) {
    console.error("Error al obtener los ejercicios:", error);
    res.status(500).json({ error: "Error al obtener los ejercicios" });
  }
};

// Obtener un ejercicio por su ID
const getExerciseById = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    // Obtener detalles del ejercicio desde Codewars usando el codewarsId
    const codewarsResponse = await axios.get(`https://www.codewars.com/api/v1/code-challenges/${exercise.codewarsId}`);
    const codewarsData = codewarsResponse.data;

    res.json({
      name: codewarsData.name,
      description: codewarsData.description,
      answer: exercise.answer // La respuesta para los diferentes lenguajes
    });
  } catch (error) {
    console.error('Error fetching exercise:', error);
    res.status(500).json({ message: 'Error fetching exercise details' });
  }
};

// Eliminar un ejercicio por su ID
const deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndDelete(req.params.id);
    if (!exercise) {
      return res.status(404).json({ error: "Ejercicio no encontrado" });
    }
    res.status(200).json({ message: "Ejercicio eliminado" });
  } catch (error) {
    console.error("Error al eliminar ejercicio:", error);
    res.status(500).json({ error: "Error al eliminar el ejercicio" });
  }
};

// Obtener la lista de ejercicios con información de Codewars
const getExercisesWithDetails = async (req, res) => {
  try {
    const exercises = await Exercise.find(); // Obtiene todos los ejercicios de la base de datos
    const exerciseDetails = await Promise.all(
      exercises.map(async (exercise) => {
        const response = await axios.get(`https://www.codewars.com/api/v1/code-challenges/${exercise.codewarsId}`);
        return {
          ...exercise.toObject(),
          codewarsDetails: response.data, // Detalles del ejercicio desde Codewars
        };
      })
    );
    res.status(200).json(exerciseDetails);
  } catch (error) {
    console.error("Error al obtener detalles de los ejercicios:", error);
    res.status(500).json({ error: "Error al obtener detalles de los ejercicios" });
  }
};

// Obtener un ejercicio por su codewarsId
const getExerciseByCodewarsId = async (req, res) => {
  try {
    const { codewarsId } = req.params;
    const exercise = await Exercise.findOne({ codewarsId });  // Buscar por el codewarsId

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    res.status(200).json(exercise);  // Responder con el ejercicio encontrado
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving exercise', error: err });
  }
};

// Obtener ejercicios recomendados según nivel y etiquetas
const getRecommendedExercises = async (req, res) => {
  try {
    const userId = req.params.userId; // ID del usuario
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const userLevel = user.level; // Nivel del usuario

    // Obtener ejercicios según nivel (Codewars usa rangos negativos para niveles)
    const difficultyLevel = `${9 - userLevel} kyu`;

    // Consultar la base de datos para obtener ejercicios del nivel correspondiente
    let exercises = await Exercise.find({ difficulty: difficultyLevel });

    // Mapear los tags con errores del usuario a un objeto para priorización
    const mistakeTags = (user.tagsWithMistakes || []).reduce((acc, tagObj) => {
      acc[tagObj.tag] = tagObj.priority;
      return acc;
    }, {});

    // Priorizar ejercicios relacionados con tags con errores
    exercises = await Promise.all(
      exercises.map(async (exercise) => {
        // Obtener datos de la API de Codewars
        const codewarsResponse = await axios.get(
          `https://www.codewars.com/api/v1/code-challenges/${exercise.codewarsId}`
        );
        const codewarsDetails = codewarsResponse.data;

        // Obtener los tags desde la API de Codewars
        const exerciseTags = codewarsDetails.tags || [];

        // Calcular la prioridad basada en los tags
        const priority = exerciseTags.reduce((acc, tag) => acc + (mistakeTags[tag] || 0), 0);

        return {
          ...exercise.toObject(),
          name: codewarsDetails.name,
          description: codewarsDetails.description,
          tags: exerciseTags,
          priority, // Prioridad calculada
        };
      })
    );

    // Ordenar los ejercicios por prioridad (de mayor a menor)
    exercises.sort((a, b) => b.priority - a.priority);

    res.status(200).json(exercises);
  } catch (error) {
    console.error('Error al obtener ejercicios recomendados:', error);
    res.status(500).json({ error: 'Error al obtener ejercicios recomendados' });
  }
};



// Actualizar el progreso del usuario y manejar etiquetas de error
const updateUserProgressWithTags = async (req, res) => {
  try {
    const { userId, exerciseId, successful } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    let exercise = await Exercise.findById(exerciseId);

    // Si no encuentras tags en la base de datos, busca en Codewars
    if (!exercise.tags || exercise.tags.length === 0) {
      const codewarsResponse = await axios.get(`https://www.codewars.com/api/v1/code-challenges/${exercise.codewarsId}`);
      exercise.tags = codewarsResponse.data.tags; // Actualiza los tags desde Codewars
    }

    // Actualizar progreso
    if (successful) {
      user.completedChallenges.push(exerciseId);

      // Reducir prioridad de los tags del ejercicio
      exercise.tags.forEach((tag) => {
        const tagObj = user.tagsWithMistakes.find((t) => t.tag === tag);
        if (tagObj) {
          tagObj.priority = Math.max(tagObj.priority - 1, 0);
        }
      });
    } else {
      // Aumentar prioridad de los tags del ejercicio en caso de error
      exercise.tags.forEach((tag) => {
        const tagObj = user.tagsWithMistakes.find((t) => t.tag === tag);
        if (tagObj) {
          tagObj.priority += 1;
        } else {
          user.tagsWithMistakes.push({ tag, priority: 1 });
        }
      });
    }

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    console.error('Error al actualizar progreso del usuario:', error);
    res.status(500).json({ error: 'Error al actualizar progreso del usuario' });
  }
};

const getRandomExercisesExcludingId = async (req, res) => {
  try {
    const { codewarsId } = req.params;

    // Obtener todos los ejercicios excepto el que tiene el codewarsId recibido
    const exercises = await Exercise.find({ codewarsId: { $ne: codewarsId } });

    if (exercises.length < 3) {
      return res.status(404).json({ message: 'No hay suficientes ejercicios disponibles' });
    }

    // Seleccionar tres ejercicios aleatorios
    const randomExercises = [];
    while (randomExercises.length < 3) {
      const randomIndex = Math.floor(Math.random() * exercises.length);
      const randomExercise = exercises[randomIndex];
      if (!randomExercises.includes(randomExercise)) {
        randomExercises.push(randomExercise);
      }
    }

    res.status(200).json(randomExercises);
  } catch (error) {
    console.error('Error al obtener ejercicios aleatorios:', error);
    res.status(500).json({ error: 'Error al obtener ejercicios aleatorios' });
  }
};

module.exports = { createExercise, getExercises, getExerciseById, deleteExercise, getExercisesWithDetails, getExerciseByCodewarsId, getRecommendedExercises, updateUserProgressWithTags, getRandomExercisesExcludingId  };
