// Importar las funciones necesarias desde Firebase SDK
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
    const sensorDataRef = ref(database, "/sensorData"); // Lee el nodo sensorData
    onValue(sensorDataRef, (snapshot) => {
        const data = snapshot.val();
        console.log("Datos recibidos de Firebase:", data);  // Verifica si los datos están llegando

        // Asegurarse de que los datos no sean null o undefined
        if (data) {
            Object.values(data).forEach(sensor => {
                // Verificación de los valores de los sensores
                const humidity = sensor.humidity_aht ? sensor.humidity_aht.toFixed(2) : "No disponible";
                const temperatureAHT = sensor.temperature_aht ? sensor.temperature_aht.toFixed(2) : "No disponible";
                const pressure = sensor.pressure_bmp ? sensor.pressure_bmp.toFixed(2) : "No disponible";
                const temperatureBMP = sensor.temperature_bmp ? sensor.temperature_bmp.toFixed(2) : "No disponible";

                // Actualizar el contenido en el HTML
                document.getElementById("humidity").innerText = `Humedad (AHT20): ${humidity}%`;
                document.getElementById("tempAHT").innerText = `Temperatura (AHT20): ${temperatureAHT}°C`;
                document.getElementById("pressure").innerText = `Presión (BMP280): ${pressure} hPa`;
                document.getElementById("tempBMP").innerText = `Temperatura (BMP280): ${temperatureBMP}°C`;
            });
        } else {
            console.log("No se encontraron datos en Firebase.");
            // Actualizar el DOM para mostrar un mensaje
            document.getElementById("humidity").innerText = "Humedad (AHT20): No disponible";
            document.getElementById("tempAHT").innerText = "Temperatura (AHT20): No disponible";
            document.getElementById("pressure").innerText = "Presión (BMP280): No disponible";
            document.getElementById("tempBMP").innerText = "Temperatura (BMP280): No disponible";
        }
    }, (error) => {
        console.log("Error al leer los datos de Firebase:", error);
        alert("Hubo un error al intentar obtener los datos.");
    });
};

// Llamada inicial para mostrar los datos de los sensores
displayData();
