import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";
import Chart from "https://cdn.jsdelivr.net/npm/chart.js";

// Firebase Configuración
const firebaseConfig = {
  apiKey: "AIzaSyBJT5ckT_Os1eTxPvVn9kjFi3pXXEUeIe8",
  authDomain: "ardusens.firebaseapp.com",
  databaseURL: "https://ardusens-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ardusens",
  storageBucket: "ardusens.appspot.com",
  messagingSenderId: "932230234372",
  appId: "1:932230234372:web:f68c12d2913155e30a9051",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Variables globales para gráficos
let humidityChart = null;
let temperatureChart = null;

// Función para actualizar datos
const displayData = () => {
  const sensorDataRef = ref(database, "/sensorData");
  onValue(sensorDataRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const latest = Object.values(data).pop();
      document.getElementById("humidity").innerText = `Humedad: ${latest.humidity_aht || "No disponible"}%`;
      document.getElementById("tempAHT").innerText = `Temperatura AHT20: ${latest.temperature_aht || "No disponible"}°C`;
      document.getElementById("pressure").innerText = `Presión: ${latest.pressure_bmp || "No disponible"} hPa`;
      document.getElementById("tempBMP").innerText = `Temperatura BMP280: ${latest.temperature_bmp || "No disponible"}°C`;

      updateCharts(latest);
    }
  });
};

// Actualiza gráficos
const updateCharts = (data) => {
  if (humidityChart) humidityChart.destroy();
  if (temperatureChart) temperatureChart.destroy();

  const ctxHumidity = document.getElementById("humidityChart").getContext("2d");
  const ctxTemperature = document.getElementById("temperatureChart").getContext("2d");

  humidityChart = new Chart(ctxHumidity, {
    type: "line",
    data: {
      labels: ["Humedad"],
      datasets: [{ label: "Humedad (%)", data: [data.humidity_aht], backgroundColor: "rgba(0, 191, 255, 0.5)" }],
    },
  });

  temperatureChart = new Chart(ctxTemperature, {
    type: "line",
    data: {
      labels: ["Temperatura"],
      datasets: [{ label: "Temperatura (°C)", data: [data.temperature_aht], backgroundColor: "rgba(255, 99, 132, 0.5)" }],
    },
  });
};

// Secciones de control
const showSection = (section) => {
  document.querySelectorAll(".content-display").forEach((el) => (el.style.display = "none"));
  document.getElementById(`${section}-display`).style.display = "block";

  if (section === "sensores") displayData();
  if (section === "reles") displayRelays();
};

// Control de Relés
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
    relayButton.innerText = `Rele ${i} ON/OFF`;
    relayButton.addEventListener("click", () => toggleRelay(i));

    relayDiv.appendChild(relayButton);
    relaysContainer.appendChild(relayDiv);
  }
};

const toggleRelay = (relayNumber) => {
  const statusCircle = document.getElementById(`rele-status-${relayNumber}`);
  statusCircle.style.backgroundColor = statusCircle.style.backgroundColor === "red" ? "green" : "red";
};

// Eventos
document.getElementById("btn-sensores").addEventListener("click", () => showSection("sensores"));
document.getElementById("btn-reles").addEventListener("click", () => showSection("reles"));
document.getElementById("btn-graficas").addEventListener("click", () => showSection("graficas"));
