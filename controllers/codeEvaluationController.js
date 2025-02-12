const axios = require("axios");

const evaluarCodigo = async (req, res) => {
  console.log("Datos recibidos en el backend:", req.body);

  const { codigo, lenguaje } = req.body;

  // Mapeo de lenguajes soportados
  const languageIdMap = {
    python: 71,         // Python 3
    javascript: 63,     // Node.js
    java: 62,           // Java
    c: 50,              // C (GCC 9.2)
    "c++": 54,          // C++ (GCC 9.2)
  };

  const languageId = languageIdMap[lenguaje.toLowerCase()];
  if (!languageId) {
    console.error("Lenguaje no soportado:", lenguaje);
    return res.status(400).json({ error: "Lenguaje no soportado" });
  }

  // Ajustar código según el lenguaje
  let codigoFinal = codigo;
  switch (lenguaje.toLowerCase()) {
    case "python":
      // Python no requiere ajustes.
      codigoFinal = codigo;
      break;

    case "javascript":
      if (!codigo.includes("console.log")) {
        console.log("Agregando estructura básica para JavaScript...");
        codigoFinal = `console.log(${codigo});`;
      }
      break;

    case "java":
      if (!codigo.includes("public static void main")) {
        console.log("Agregando estructura básica para Java...");
        codigoFinal = `public class Main {
    public static void main(String[] args) {
        ${codigo}
    }
}`;
      }
      break;

    case "c":
      if (!codigo.includes("int main")) {
        console.log("Agregando estructura básica para C...");
        codigoFinal = `#include <stdio.h>
int main() {
    ${codigo}
    return 0;
}`;
      }
      break;

    case "c++":
      if (!codigo.includes("int main")) {
        console.log("Agregando estructura básica para C++...");
        codigoFinal = `#include <iostream>
using namespace std;
int main() {
    ${codigo}
    return 0;
}`;
      }
      break;

    default:
      console.error("Lenguaje no soportado:", lenguaje);
      return res.status(400).json({ error: "Lenguaje no soportado" });
  }

  try {
    console.log("Enviando código a la API Judge0...");
    const response = await axios.post(
      "https://judge0-ce.p.rapidapi.com/submissions",
      {
        source_code: codigoFinal,
        language_id: languageId,
      },
      {
        headers: {
          "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Solicitud enviada exitosamente a Judge0. Token recibido:", response.data.token);

    const token = response.data.token;

    // Obtener el resultado
    const resultado = await axios.get(
      `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
      {
        headers: { "X-RapidAPI-Key": process.env.JUDGE0_API_KEY },
      }
    );

    console.log("Resultado recibido de Judge0:", resultado.data);
    res.json({ mensaje: resultado.data.stdout || resultado.data.stderr });
  } catch (error) {
    console.error("Error al evaluar el código:", error.response?.data || error.message);
    res.status(500).json({ error: "Error evaluando el código" });
  }
};

module.exports = { evaluarCodigo };
