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

// Menú y vistas
document.getElementById("btn-sensores").addEventListener("click", () => showSection("sensores-display"));
document.getElementById("btn-reles").addEventListener("click", () => showSection("reles-control"));
document.getElementById("btn-graficas").addEventListener("click", () => showSection("graficas-display"));

function showSection(id) {
    document.querySelectorAll(".content-display").forEach(section => section.style.display = "none");
    document.getElementById(id).style.display = "block";
}

// Datos de sensores
const sensorDataRef = ref(database, "/sensorData");
onValue(sensorDataRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        const sensor = Object.values(data)[0];
        document.getElementById("humidity").innerText = `Humedad: ${sensor.humidity_aht || "No disponible"}%`;
        document.getElementById("tempAHT").innerText = `Temperatura AHT20: ${sensor.temperature_aht || "No disponible"}°C`;
        document.getElementById("pressure").innerText = `Presión: ${sensor.pressure_bmp || "No disponible"} hPa`;
        document.getElementById("tempBMP").innerText = `Temperatura BMP280: ${sensor.temperature_bmp || "No disponible"}°C`;

        updateGraficas(sensor);
    }
});

// Gráficas
let graficaHumedad = initGrafica("grafica-humedad", "Humedad");
let graficaTempAHT = initGrafica("grafica-tempAHT", "Temperatura AHT20");
let graficaPresion = initGrafica("grafica-presion", "Presión");
let graficaTempBMP = initGrafica("grafica-tempBMP", "Temperatura BMP280");

function initGrafica(id, label) {
    return new Chart(document.getElementById(id), {
        type: "line",
        data: { labels: [], datasets: [{ label, data: [], borderColor: "#00baba", backgroundColor: "rgba(0,186,186,0.2)" }] }
    });
}

function updateGraficas(sensor) {
    const tiempo = new Date().toLocaleTimeString();
    updateGrafica(graficaHumedad, tiempo, sensor.humidity_aht);
    updateGrafica(graficaTempAHT, tiempo, sensor.temperature_aht);
    updateGrafica(graficaPresion, tiempo, sensor.pressure_bmp);
    updateGrafica(graficaTempBMP, tiempo, sensor.temperature_bmp);
}

function updateGrafica(chart, label, value) {
    if (chart.data.labels.length > 10) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }
    chart.data.labels.push(label);
    chart.data.datasets[0].data.push(value || 0);
    chart.update();
}

// Control de relés
function toggleRele(id) {
    const statusCircle = document.getElementById(`status-${id}`);
    statusCircle.style.backgroundColor = statusCircle.style.backgroundColor === "green" ? "red" : "green";
}
