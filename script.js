// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

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

// Mostrar datos de los sensores
const displayData = () => {
  const sensorDataRef = ref(database, "/sensorData");
  onValue(sensorDataRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      document.getElementById("humidity").innerText = `Humedad: ${data.humidity_aht.toFixed(2)}%`;
      document.getElementById("tempAHT").innerText = `Temperatura AHT20: ${data.temperature_aht.toFixed(2)}°C`;
      document.getElementById("pressure").innerText = `Presión: ${data.pressure_bmp.toFixed(2)} hPa`;
      document.getElementById("tempBMP").innerText = `Temperatura BMP280: ${data.temperature_bmp.toFixed(2)}°C`;
    } else {
      console.log("No se encontraron datos.");
    }
  });
};

// Generar botones de control de relés
const generateReleControls = () => {
  const container = document.getElementById("releContainer");
  for (let i = 1; i <= 8; i++) {
    const releDiv = document.createElement("div");
    releDiv.className = "rele-item";
    releDiv.innerHTML = `
      <p>Relé ${i}</p>
      <button onclick="toggleRele(${i}, true)">ON</button>
      <button onclick="toggleRele(${i}, false)">OFF</button>
      <div id="rele-status-${i}" style="margin-top:10px;">🟥</div>
    `;
    container.appendChild(releDiv);
  }
};

// Función para cambiar el estado de un relé
window.toggleRele = (releId, state) => {
  const releRef = ref(database, `/reles/rele${releId}`);
  update(releRef, { state });
  document.getElementById(`rele-status-${releId}`).innerText = state ? "🟩" : "🟥";
};

// Cambiar sección visible
window.showSection = (section) => {
  document.querySelectorAll(".section").forEach((sec) => sec.classList.add("hidden"));
  document.getElementById(section).classList.remove("hidden");
};

// Inicializar Gráficas
const initializeCharts = () => {
  const ctx1 = document.getElementById('humidityChart').getContext('2d');
  new Chart(ctx1, {
    type: 'line',
    data: { labels: [], datasets: [{ label: 'Humedad', data: [], borderColor: '#0a9396' }] }
  });
};

// Inicializar todo
document.addEventListener("DOMContentLoaded", () => {
  displayData();
  generateReleControls();
  initializeCharts();
});
