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
const displaySensorData = () => {
    const sensorDataRef = ref(database, "/sensorData"); // Nodo de datos
    onValue(sensorDataRef, (snapshot) => {
        const data = snapshot.val();
        console.log("Datos de Firebase:", data);

        if (data) {
            const { humidity_aht, temperature_aht, pressure_bmp, temperature_bmp } = data;

            document.getElementById("humidity").innerText = `Humedad (AHT20): ${humidity_aht?.toFixed(2) || "No disponible"}%`;
            document.getElementById("tempAHT").innerText = `Temperatura (AHT20): ${temperature_aht?.toFixed(2) || "No disponible"}°C`;
            document.getElementById("pressure").innerText = `Presión (BMP280): ${pressure_bmp?.toFixed(2) || "No disponible"} hPa`;
            document.getElementById("tempBMP").innerText = `Temperatura (BMP280): ${temperature_bmp?.toFixed(2) || "No disponible"}°C`;
        } else {
            console.log("No hay datos disponibles en Firebase.");
        }
    });
};

// Función para cambiar entre secciones
const showSection = (sectionId) => {
    const sections = ["sensores-display", "reles-display", "graficas-display", "tablas-display"];
    sections.forEach((id) => {
        document.getElementById(id).style.display = id === sectionId ? "block" : "none";
    });

    if (sectionId === "sensores-display") {
        displaySensorData();
    } else if (sectionId === "reles-display") {
        initializeRelays();
    }
};

// Función para inicializar los controles de relés
const initializeRelays = () => {
    const relaysContainer = document.getElementById("reles-status");
    relaysContainer.innerHTML = ""; // Limpiar contenido previo

    for (let i = 1; i <= 8; i++) {
        const relayDiv = document.createElement("div");
        relayDiv.classList.add("rele-control");

        const statusCircle = document.createElement("div");
        statusCircle.classList.add("rele-status");
        statusCircle.id = `rele-status-${i}`;
        relayDiv.appendChild(statusCircle);

        const relayButton = document.createElement("button");
        relayButton.classList.add("rele-btn");
        relayButton.innerText = `Relé ${i} ON/OFF`;
        relayButton.addEventListener("click", () => toggleRelay(i));

        relayDiv.appendChild(relayButton);
        relaysContainer.appendChild(relayDiv);
    }
};

// Función para alternar estado del relé
const toggleRelay = (relayNumber) => {
    const statusCircle = document.getElementById(`rele-status-${relayNumber}`);
    statusCircle.style.backgroundColor = statusCircle.style.backgroundColor === "green" ? "red" : "green";
};

// Asignar eventos a los botones
const setupEventListeners = () => {
    document.getElementById("btn-sensores").addEventListener("click", () => showSection("sensores-display"));
    document.getElementById("btn-reles").addEventListener("click", () => showSection("reles-display"));
    document.getElementById("btn-graficas").addEventListener("click", () => showSection("graficas-display"));
    document.getElementById("btn-tablas").addEventListener("click", () => showSection("tablas-display"));
};

// Inicializar la aplicación
setupEventListeners();
