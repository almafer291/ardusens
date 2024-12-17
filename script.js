// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

// Configuración Firebase
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

// Variables globales
const relayState = Array(8).fill(false); // Estado inicial de los 8 relés

// Función para obtener datos de Firebase
const displayData = () => {
    const sensorDataRef = ref(database, "/sensorData");
    onValue(sensorDataRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const latestData = Object.values(data)[0]; // Última lectura
            document.getElementById("humidity").innerText = `Humedad (AHT20): ${latestData.humidity_aht.toFixed(2)}%`;
            document.getElementById("tempAHT").innerText = `Temperatura (AHT20): ${latestData.temperature_aht.toFixed(2)}°C`;
            document.getElementById("pressure").innerText = `Presión (BMP280): ${latestData.pressure_bmp.toFixed(2)} hPa`;
            document.getElementById("tempBMP").innerText = `Temperatura (BMP280): ${latestData.temperature_bmp.toFixed(2)}°C`;

            updateCharts(latestData); // Actualizar gráficas
        }
    });
};

// Configuración de gráficas
const ctxTemp = document.getElementById("tempChart").getContext("2d");
const ctxHumidity = document.getElementById("humidityChart").getContext("2d");

const tempChart = new Chart(ctxTemp, {
    type: "line",
    data: { labels: [], datasets: [{ label: "Temperatura °C", data: [], borderColor: "#00b894" }] },
});

const humidityChart = new Chart(ctxHumidity, {
    type: "line",
    data: { labels: [], datasets: [{ label: "Humedad %", data: [], borderColor: "#0984e3" }] },
});

function updateCharts(data) {
    const time = new Date().toLocaleTimeString();
    tempChart.data.labels.push(time);
    tempChart.data.datasets[0].data.push(data.temperature_aht);

    humidityChart.data.labels.push(time);
    humidityChart.data.datasets[0].data.push(data.hum
