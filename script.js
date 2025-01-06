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
    measurementId: "G-JBXRDGDTY7",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Función para mostrar datos de los sensores
const displayData = () => {
    const sensorDataRef = ref(database, "/sensorData");
    onValue(sensorDataRef, (snapshot) => {
        const data = snapshot.val();
        console.log("Datos recibidos de Firebase:", data);

        if (data) {
            // Tomar el último dato recibido
            const latestDataKey = Object.keys(data).pop();
            const latestData = data[latestDataKey];

            // Mostrar datos de sensores
            document.getElementById("humidity").innerText = `Humedad: ${latestData.humidity_aht?.toFixed(2) ?? "No disponible"}%`;
            document.getElementById("tempAHT").innerText = `Temperatura AHT20: ${latestData.temperature_aht?.toFixed(2) ?? "No disponible"}°C`;
            document.getElementById("pressure").innerText = `Presión: ${latestData.pressure_bmp?.toFixed(2) ?? "No disponible"} hPa`;
            document.getElementById("tempBMP").innerText = `Temperatura BMP280: ${latestData.temperature_bmp?.toFixed(2) ?? "No disponible"}°C`;
        } else {
            console.error("No hay datos disponibles en Firebase.");
        }
    }, (error) => {
        console.error("Error al leer datos de Firebase:", error);
    });
};

// Función para cambiar de sección al presionar los botones
const showSection = (section) => {
    document.getElementById("sensores-display").style.display = "none";
    document.getElementById("reles-control").style.display = "none";

    if (section === "sensores") {
        document.getElementById("sensores-display").style.display = "block";
        displayData();
    } else if (section === "reles") {
        document.getElementById("reles-control").style.display = "block";
    }
};

// Asignar eventos a los botones
document.getElementById("btn-sensores").addEventListener("click", () => showSection("sensores"));
document.getElementById("btn-reles").addEventListener("click", () => showSection("reles"));

// Función para inicializar los controles de relés
const displayRelays = () => {
    const relaysContainer = document.getElementById("reles-status");
    relaysContainer.innerHTML = "";

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

// Función para alternar el estado de los relés
const toggleRelay = (relayNumber) => {
    const statusCircle = document.getElementById(`rele-status-${relayNumber}`);
    if (statusCircle.style.backgroundColor === "red") {
        statusCircle.style.backgroundColor = "green"; // Encendido
    } else {
        statusCircle.style.backgroundColor = "red"; // Apagado
    }
};

// Inicializar controles
displayRelays();
