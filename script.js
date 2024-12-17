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

// Función para mostrar datos de los sensores
const displayData = () => {
  const sensorDataRef = ref(database, "/sensorData"); // Lee el nodo sensorData
  onValue(sensorDataRef, (snapshot) => {
    const data = snapshot.val();
    console.log("Datos recibidos de Firebase:", data);  // Verificamos si los datos llegan a la consola

    if (data) {
      // Recorremos cada entrada dentro de los datos recibidos
      Object.values(data).forEach(sensor => {
        // Accedemos a los valores dentro de cada objeto de sensor
        const humidity = sensor.humidity_aht ? sensor.humidity_aht.toFixed(2) : "No disponible";
        const temperatureAHT = sensor.temperature_aht ? sensor.temperature_aht.toFixed(2) : "No disponible";
        const pressure = sensor.pressure_bmp ? sensor.pressure_bmp.toFixed(2) : "No disponible";
        const temperatureBMP = sensor.temperature_bmp ? sensor.temperature_bmp.toFixed(2) : "No disponible";

        // Actualiza el contenido de la página
        document.getElementById("humidity").innerText = `Humedad (AHT20): ${humidity}%`;
        document.getElementById("tempAHT").innerText = `Temperatura (AHT20): ${temperatureAHT}°C`;
        document.getElementById("pressure").innerText = `Presión (BMP280): ${pressure} hPa`;
        document.getElementById("tempBMP").innerText = `Temperatura (BMP280): ${temperatureBMP}°C`;
      });
    } else {
      console.log("No se encontraron datos en Firebase.");
    }
  });
};

// Funcionalidad de los botones
document.getElementById("btn-sensores").addEventListener("click", function() {
  // Mostrar los datos de los sensores al pulsar el botón
  displayData();
  
  // Resaltar el botón activo
  document.querySelectorAll(".side-btn").forEach(button => {
    button.classList.remove("active");
  });
  this.classList.add("active");
});

document.getElementById("btn-reles").addEventListener("click", function() {
  alert("Funcionalidad de Relés en desarrollo.");
  // Aquí agregarás la funcionalidad para los relés
});

document.getElementById("btn-graficas").addEventListener("click", function() {
  alert("Funcionalidad de Gráficas en desarrollo.");
  // Aquí agregarás la funcionalidad para las gráficas
});

document.getElementById("btn-tablas").addEventListener("click", function() {
  alert("Funcionalidad de Tablas en desarrollo.");
  // Aquí agregarás la funcionalidad para las tablas
});
