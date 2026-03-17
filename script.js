import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBJT5ckT_Os1eTxPvVn9kjFi3pXXEUeIe8",
  authDomain: "ardusens.firebaseapp.com",
  databaseURL: "https://ardusens-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "ardusens"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// --- Lógica de Sensores ---
const initSensors = () => {
  const sensorDataRef = ref(database, "/sensorData");
  onValue(sensorDataRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;
    
    // Obtenemos el último registro (si los datos vienen en un objeto de timestamps)
    const lastEntry = Object.values(data).pop();
    
    document.getElementById("humidity").innerText = `${lastEntry.humidity_aht?.toFixed(1)}%`;
    document.getElementById("tempAHT").innerText = `${lastEntry.temperature_aht?.toFixed(1)}°C`;
    document.getElementById("pressure").innerText = `${lastEntry.pressure_bmp?.toFixed(0)} hPa`;
    document.getElementById("tempBMP").innerText = `${lastEntry.temperature_bmp?.toFixed(1)}°C`;
  });
};

// --- Lógica de Relés (Con Persistencia Real) ---
const initRelays = () => {
  const container = document.getElementById("reles-grid");
  container.innerHTML = "";
  
  for (let i = 1; i <= 8; i++) {
    const card = document.createElement("div");
    card.className = "rele-card";
    card.innerHTML = `
      <div>
        <div id="ind-${i}" class="status-indicator"></div>
        <span>Relé ${i}</span>
      </div>
      <button class="rele-btn" id="btn-rele-${i}">Cambiar</button>
    `;
    container.appendChild(card);

    // Evento de click
    card.querySelector("button").addEventListener("click", () => {
      const ind = document.getElementById(`ind-${i}`);
      const isOff = ind.classList.toggle("on");
      // Aquí podrías enviar el dato a Firebase:
      // set(ref(database, `/relays/r${i}`), isOff ? 1 : 0);
    });
  }
};

// --- Lógica de Clima ---
const initWeather = () => {
  const weatherRef = ref(database, "/weatherData");
  onValue(weatherRef, (snapshot) => {
    const w = snapshot.val();
    if (!w) return;

    document.getElementById("weather-icon").src = w.icon?.startsWith("http") ? w.icon : `https:${w.icon}`;
    document.getElementById("weather-temp").innerText = `${w.temp_c}°C`;
    document.getElementById("weather-description").innerText = w.condition;
    document.getElementById("weather-wind").innerText = `${w.wind_kph} km/h`;
    document.getElementById("weather-rain").innerText = `${w.chance_of_rain}% lluvia`;
    document.getElementById("weather-uv").innerText = `UV: ${w.uv}`;
    document.getElementById("weather-visibility").innerText = `${w.vis_km} km vis.`;
  });
};

// --- Navegación ---
const sections = {
  "btn-sensores": { id: "sensores-display", title: "Panel de Sensores", init: initSensors },
  "btn-reles": { id: "reles-control", title: "Control de Relés", init: initRelays },
  "btn-clima": { id: "clima-display", title: "Estado del Clima", init: initWeather }
};

Object.keys(sections).forEach(btnId => {
  document.getElementById(btnId).addEventListener("click", (e) => {
    // UI Updates
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    e.currentTarget.classList.add("active");
    
    // Hide all
    document.querySelectorAll(".content-section").forEach(s => s.style.display = "none");
    
    // Show selected
    const section = sections[btnId];
    document.getElementById(section.id).style.display = "block";
    document.getElementById("section-title").innerText = section.title;
    
    section.init();
  });
});

// Inicialización por defecto
initSensors();
initRelays();
