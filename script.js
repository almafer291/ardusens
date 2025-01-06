// Importar módulos de Firebase
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
    measurementId: "G-JBXRDGDTY7",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Elementos HTML
const humidityEl = document.getElementById("humidity");
const tempAHTEl = document.getElementById("tempAHT");
const pressureEl = document.getElementById("pressure");
const tempBMPEl = document.getElementById("tempBMP");

// Función para obtener y mostrar datos de sensores
const displaySensorData = () => {
    const sensorDataRef = ref(database, "/sensorData");

    // Escuchar cambios en la base de datos
    onValue(sensorDataRef, (snapshot) => {
        const data = snapshot.val();

        if (data) {
            console.log("Datos recibidos desde Firebase:", data);

            // Actualizar el DOM con los valores recibidos
            humidityEl.innerText = `Humedad: ${data.humidity_aht ? data.humidity_aht.toFixed(2) : "No disponible"}%`;
            tempAHTEl.innerText = `Temperatura AHT20: ${data.temperature_aht ? data.temperature_aht.toFixed(2) : "No disponible"}°C`;
            pressureEl.innerText = `Presión: ${data.pressure_bmp ? data.pressure_bmp.toFixed(2) : "No disponible"} hPa`;
            tempBMPEl.innerText = `Temperatura BMP280: ${data.temperature_bmp ? data.temperature_bmp.toFixed(2) : "No disponible"}°C`;
        } else {
            console.warn("No se recibieron datos válidos desde Firebase.");
        }
    }, (error) => {
        console.error("Error al leer datos desde Firebase:", error);
    });
};

// Mostrar la sección correspondiente
const showSection = (section) => {
    document.getElementById("sensores-display").style.display = "none";
    document.getElementById("reles-control").style.display = "none";

    if (section === "sensores") {
        document.getElementById("sensores-display").style.display = "block";
    } else if (section === "reles") {
        document.getElementById("reles-control").style.display = "block";
    }
};

// Configurar eventos para los botones
document.getElementById("btn-sensores").addEventListener("click", () => showSection("sensores"));
document.getElementById("btn-reles").addEventListener("click", () => showSection("reles"));

// Inicializar lectura de datos
displaySensorData();
