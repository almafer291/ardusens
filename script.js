// Inicializar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBJT5ckT_Os1eTxPvVn9kjFi3pXXEUeIe8",
  authDomain: "ardusens.firebaseapp.com",
  databaseURL: "https://ardusens-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ardusens",
  storageBucket: "ardusens.appspot.com",
  messagingSenderId: "932230234372",
  appId: "1:932230234372:web:f68c12d2913155e30a9051",
  measurementId: "G-JBXRDGDTY7"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Función para mostrar datos en consola y en la página
const displayData = () => {
  const sensorDataRef = ref(database, "/"); // Lee toda la raíz de la base de datos
  onValue(sensorDataRef, (snapshot) => {
    const data = snapshot.val();

    console.log("Datos recibidos de Firebase:", data);  // Verificamos si los datos llegan a la consola

    if (data) {
      // Valida que los datos existan antes de mostrar
      const humidity = data.humidity_aht ? data.humidity_aht.toFixed(2) : "No disponible";
      const temperatureAHT = data.temperature_aht ? data.temperature_aht.toFixed(2) : "No disponible";
      const pressure = data.pressure_bmp ? data.pressure_bmp.toFixed(2) : "No disponible";
      const temperatureBMP = data.temperature_bmp ? data.temperature_bmp.toFixed(2) : "No disponible";

      console.log(`Humedad: ${humidity}, Temperatura AHT20: ${temperatureAHT}, Presión: ${pressure}, Temperatura BMP280: ${temperatureBMP}`);

      // Actualiza el contenido de la página
      document.getElementById("humidity").innerText = `Humedad (AHT20): ${humidity}%`;
      document.getElementById("tempAHT").innerText = `Temperatura (AHT20): ${temperatureAHT}°C`;
      document.getElementById("pressure").innerText = `Presión (BMP280): ${pressure} hPa`;
      document.getElementById("tempBMP").innerText = `Temperatura (BMP280): ${temperatureBMP}°C`;
    } else {
      console.log("No se encontraron datos en Firebase.");
    }
  });
};

// Llama la función para mostrar los datos
displayData();
