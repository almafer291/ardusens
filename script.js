// Importar módulos de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, onChildAdded } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

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

// Función para mostrar datos de sensores
const displaySensorData = () => {
    const sensorDataRef = ref(database, "/sensorData");

    // Escuchar los cambios en tiempo real
    onChildAdded(sensorDataRef, (snapshot) => {
        const data = snapshot.val();
        console.log("Dato recibido:", data);

        // Actualizar elementos en la página
        document.getElementById("humidity").innerText = `Humedad: ${data.humidity_aht?.toFixed(2) ?? "No disponible"}%`;
        document.getElementById("tempAHT").innerText = `Temperatura AHT20: ${data.temperature_aht?.toFixed(2) ?? "No disponible"}°C`;
        document.getElementById("pressure").innerText = `Presión: ${data.pressure_bmp?.toFixed(2) ?? "No disponible"} hPa`;
        document.getElementById("tempBMP").innerText = `Temperatura BMP280: ${data.temperature_bmp?.toFixed(2) ?? "No disponible"}°C`;
    });
};

// Función para mostrar u ocultar secciones
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

// Llamar a la función para inicializar datos de sensores
displaySensorData();
