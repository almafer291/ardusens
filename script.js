// Importar Firebase
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
  appId: "1:932230234372:web:f68c12d2913155e30a9051"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Inicializar Gráficas
let humidityChart, temperatureChart, pressureChart;

function initializeCharts() {
    const ctxHumidity = document.getElementById("humidityChart").getContext("2d");
    const ctxTemperature = document.getElementById("temperatureChart").getContext("2d");
    const ctxPressure = document.getElementById("pressureChart").getContext("2d");

    humidityChart = new Chart(ctxHumidity, {
        type: "line",
        data: { labels: [], datasets: [{ label: "Humedad", data: [], borderColor: "#00baba", backgroundColor: "rgba(0,186,186,0.2)" }] },
    });

    temperatureChart = new Chart(ctxTemperature, {
        type: "line",
        data: { labels: [], datasets: [{ label: "Temperatura", data: [], borderColor: "#00baba", backgroundColor: "rgba(0,186,186,0.2)" }] },
    });

    pressureChart = new Chart(ctxPressure, {
        type: "line",
        data: { labels: [], datasets: [{ label: "Presión", data: [], borderColor: "#00baba", backgroundColor: "rgba(0,186,186,0.2)" }] },
    });
}

// Actualizar gráficas
function updateCharts(data) {
    const timestamp = new Date().toLocaleTimeString();

    humidityChart.data.labels.push(timestamp);
    humidityChart.data.datasets[0].data.push(data.humidity_aht || 0);

    temperatureChart.data.labels.push(timestamp);
    temperatureChart.data.datasets[0].data.push(data.temperature_aht || 0);

    pressureChart.data.labels.push(timestamp);
    pressureChart.data.datasets[0].data.push(data.pressure_bmp || 0);

    [humidityChart, temperatureChart, pressureChart].forEach((chart) => {
        if (chart.data.labels.length > 10) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
        }
        chart.update();
    });
}

// Mostrar datos de los sensores
function displayData() {
    const sensorDataRef = ref(database, "/sensorData");
    onValue(sensorDataRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            document.getElementById("humidity").innerText = `Humedad: ${data.humidity_aht?.toFixed(2) || "No disponible"}%`;
            document.getElementById("tempAHT").innerText = `Temperatura AHT20: ${data.temperature_aht?.toFixed(2) || "No disponible"}°C`;
            document.getElementById("pressure").innerText = `Presión: ${data.pressure_bmp?.toFixed(2) || "No disponible"} hPa`;
            document.getElementById("tempBMP").innerText = `Temperatura BMP280: ${data.temperature_bmp?.toFixed(2) || "No disponible"}°C`;
            document.getElementById("dewPoint").innerText = `Punto de Rocío: ${data.dew_point?.toFixed(2) || "No disponible"}°C`;
            document.getElementById("altitude").innerText = `Altitud: ${data.altitude?.toFixed(2) || "No disponible"} m`;
            document.getElementById("seaLevelPressure").innerText = `Presión al Nivel del Mar: ${data.sea_level_pressure?.toFixed(2) || "No disponible"} hPa`;
            document.getElementById("heatIndex").innerText = `Índice de Calor: ${data.heat_index?.toFixed(2) || "No disponible"}°C`;

            updateCharts(data);
        }
    });
}

// Cambiar sección visible
window.showSection = (section) => {
    document.querySelectorAll(".section").forEach((sec) => sec.classList.add("hidden"));
    document.getElementById(section).classList.remove("hidden");
};

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
    displayData();
    initializeCharts();
});
