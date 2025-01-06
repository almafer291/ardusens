// Importar las funciones necesarias de Firebase
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

// Función para mostrar los datos de los sensores
const displayData = () => {
  const sensorDataRef = ref(database, "/sensorData"); // Obtener la referencia del nodo "sensorData"
  
  // Escuchar los cambios en tiempo real de los datos de Firebase
  onValue(sensorDataRef, (snapshot) => {
    const data = snapshot.val();
    console.log("Datos recibidos de Firebase:", data); // Esto debería verse cada vez que se recibe una actualización

    if (data) {
      // Aquí es donde mostramos los datos de forma continua
      Object.keys(data).forEach(sensorKey => {
        const sensor = data[sensorKey]; // Obtener los datos de cada sensor

        // Actualizar los valores de los sensores en el HTML
        const humidity = sensor.humidity_aht ? sensor.humidity_aht.toFixed(2) : "No disponible";
        const temperatureAHT = sensor.temperature_aht ? sensor.temperature_aht.toFixed(2) : "No disponible";
        const pressure = sensor.pressure_bmp ? sensor.pressure_bmp.toFixed(2) : "No disponible";
        const temperatureBMP = sensor.temperature_bmp ? sensor.temperature_bmp.toFixed(2) : "No disponible";

        // Actualizar el DOM con los datos
        document.getElementById("humidity").innerText = `Humedad (AHT20): ${humidity}%`;
        document.getElementById("tempAHT").innerText = `Temperatura (AHT20): ${temperatureAHT}°C`;
        document.getElementById("pressure").innerText = `Presión (BMP280): ${pressure} hPa`;
        document.getElementById("tempBMP").innerText = `Temperatura (BMP280): ${temperatureBMP}°C`;
      });
    } else {
      console.log("No se encontraron datos en Firebase.");
    }
  }, (error) => {
    console.error("Error al obtener datos:", error);
  });
};

// Función para cambiar entre secciones
const showSection = (section) => {
  // Ocultar todas las secciones
  document.getElementById("sensores-display").style.display = "none";
  document.getElementById("reles-control").style.display = "none";

  // Mostrar la sección correspondiente
  if (section === "sensores") {
    document.getElementById("sensores-display").style.display = "block";
    displayData(); // Llamar a la función que muestra los datos de los sensores
  } else if (section === "reles") {
    document.getElementById("reles-control").style.display = "block";
  }
};

// Asignar eventos a los botones
document.getElementById("btn-sensores").addEventListener("click", () => showSection("sensores"));
document.getElementById("btn-reles").addEventListener("click", () => showSection("reles"));
