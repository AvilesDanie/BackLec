const User = require('../models/user');
const mongoose = require('mongoose');
const Exercise = require('../models/exercise');
const axios = require('axios'); // Asegúrate de importar axios para hacer solicitudes HTTP
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// Crear un nuevo usuario
const createUser = async (req, res) => {
  const { username, email, password, level, experiencePoints, progress } = req.body;

  if (!password) {
      return res.status(400).json({ message: "La contraseña es obligatoria" });
  }

  try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(400).json({ message: "El usuario ya está registrado" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = new User({
          username,
          email,
          password: hashedPassword,
          level,
          experiencePoints,
          progress
      });
      await user.save();

      res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};




// Obtener todos los usuarios
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ error: "Error getting users" });
  }
};

// Obtener un usuario por su ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ error: "Error getting user" });
  }
};

// Eliminar un usuario por su ID
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Error deleting user" });
  }
};

// Actualizar los puntos de experiencia y nivel de un usuario
const updateUser = async (req, res) => {
  try {
    const { experiencePoints, level } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.experiencePoints = experiencePoints;
    user.level = level;

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
};

// Actualizar el nivel y puntos del usuario
const updateUserProgressUnified = async (req, res) => {
  try {
    const { userId, exerciseId, experiencePoints, successful } = req.body;

    console.log('Data received in the backend:', req.body);

    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User Found:', user);

    // Intentar buscar el ejercicio por ObjectId o codewarsId
    let exercise = await Exercise.findOne({ codewarsId: exerciseId });

    if (!exercise) {
      console.log('Exercise not found:', exerciseId);
      return res.status(404).json({ message: 'Exercise not found' });
    }

    console.log('Exercise found:', exercise);

    // Obtener los detalles del ejercicio desde la API de Codewars
    const codewarsResponse = await axios.get(
      `https://www.codewars.com/api/v1/code-challenges/${exercise.codewarsId}`
    );
    const tags = codewarsResponse.data.tags || [];

    console.log('Tags obtained from Codewars:', tags);

    // Actualizar puntos de experiencia y nivel
    user.experiencePoints += experiencePoints;
    user.level = Math.floor(user.experiencePoints / 1000);

    // Asegurarse de no duplicar desafíos completados
    if (!user.completedChallenges.includes(exercise._id)) {
      user.completedChallenges.push(exercise._id);
    }

    user.progress = Math.min((user.completedChallenges.length * 100) / 10, 100);

    // Manejar los tags en caso de éxito o error
    if (successful) {
      tags.forEach((tag) => {
        const tagObj = user.tagsWithMistakes.find((t) => t.tag === tag);
        if (tagObj) {
          tagObj.priority = Math.max(tagObj.priority - 1, 0);
        }
      });
    } else {
      tags.forEach((tag) => {
        const tagObj = user.tagsWithMistakes.find((t) => t.tag === tag);
        if (tagObj) {
          tagObj.priority += 1;
        } else {
          user.tagsWithMistakes.push({ tag, priority: 1 });
        }
      });
    }

    await user.save();
    console.log('Updated user:', user);
    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user progress:', error);
    res.status(500).json({ error: 'Error updating user progress' });
  }
};


const login = async (req, res) => {
  const { email, password } = req.body;

  // Verificar que se proporcionen el email y la contraseña
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Buscar el usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Comparar la contraseña proporcionada con la almacenada (cifrada)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generar un token JWT con la ID del usuario
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    if (!process.env.JWT_SECRET) {
      throw new Error('Secret key is not set in .env');
    }
    // Enviar el token al cliente
    console.log(user);
    res.json({userId:user._id,token, message: "Login successful" });

  } catch (err) {
    console.error("Error al iniciar sesión:", err);
    res.status(500).json({ message: "Server error" });
  }
};







module.exports = { createUser, getUsers, getUserById, deleteUser, updateUser, updateUserProgressUnified,  login };
