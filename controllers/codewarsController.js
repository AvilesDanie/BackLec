const axios = require('axios');

// Consultar un desafío de Codewars por su ID
const getCodewarsChallenge = async (req, res) => {
  const challengeId = req.params.id;
  
  try {
    const response = await axios.get(`https://www.codewars.com/api/v1/code-challenges/${challengeId}`);
    res.json(response.data);
  } catch (error) {
    console.error("Error al consultar la API de Codewars:", error);
    res.status(500).json({ error: "Error al consultar la API de Codewars" });
  }
};

module.exports = { getCodewarsChallenge };
