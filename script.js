import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBJT5ckT_Os1eTxPvVn9kjFi3pXXEUeIe8",
  authDomain: "ardusens.firebaseapp.com",
  databaseURL: "https://ardusens-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "ardusens"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const API_KEY = "233740e194c45ee901ca539f6773ed0d";
const LAT = "36.8340"; const LON = "-2.4637"; // Almería

// --- FUNCIONALIDAD DE NAVEGACIÓN ---
const showSection = (section) => {
  const sections = ["sensores-display", "reles-control", "clima-display"];
  sections.forEach(id => document.getElementById(id).style.display = "none");
  
  const buttons = ["btn-sensores", "btn-reles", "btn-clima"];
  buttons.forEach(id => document.getElementById(id).classList.remove("active"));

  if (section === "sensores") {
    document.getElementById("sensores-display").style.display = "block";
    document.getElementById("btn-sensores").classList.add("active");
  } else if (section === "reles") {
    document.getElementById("reles-control").style.display = "block";
    document.getElementById("btn-reles").classList.add("active");
    renderRelays();
  } else if (section === "clima") {
    document.getElementById("clima-display").style.display = "block";
    document.getElementById("btn-clima").classList.add("active");
    fetchWeather();
  }
};

// Asignar eventos a los botones (Soluciona el problema de que no abren)
document.getElementById("btn-sensores").addEventListener("click", () => showSection("sensores"));
document.getElementById("btn-reles").addEventListener("click", () => showSection("reles"));
document.getElementById("btn-clima").addEventListener("click", () => showSection("clima"));

// --- METEOROLOGÍA Y PREVISIÓN ---
async function fetchWeather() {
  try {
    // Clima Actual
    const resCurr = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=metric&appid=${API_KEY}&lang=es`);
    const curr = await resCurr.json();
    
    // Previsión 5 días (para sacar 3)
    const resFore = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&units=metric&appid=${API_KEY}&lang=es`);
    const fore = await resFore.json();

    updateWeatherUI(curr, fore.list);
  } catch (e) { console.error(e); }
}

function updateWeatherUI(curr, list) {
  // Datos principales
  document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${curr.weather[0].icon}@4x.png`;
  document.getElementById("weather-temp").innerText = `${curr.main.temp.toFixed(1)}°C`;
  document.getElementById("weather-description").innerText = curr.weather[0].description;

  // Detalles extra
  const details = document.getElementById("weather-details-grid");
  details.innerHTML = `
    <div class="weather-item"><i class="fas fa-wind"></i> <p>${curr.wind.speed} m/s</p><span>Viento</span></div>
    <div class="weather-item"><i class="fas fa-droplet"></i> <p>${curr.main.humidity}%</p><span>Humedad</span></div>
    <div class="weather-item"><i class="fas fa-eye"></i> <p>${(curr.visibility/1000).toFixed(1)} km</p><span>Visibilidad</span></div>
    <div class="weather-item"><i class="fas fa-sun"></i> <p>${curr.main.feels_like.toFixed(1)}°</p><span>Sensación</span></div>
  `;

  // Previsión 3 días
  const forecastCont = document.getElementById("forecast-container");
  forecastCont.innerHTML = "";
  // Filtramos para obtener un dato por día (ej. a las 12:00)
  const daily = list.filter(f => f.dt_txt.includes("12:00:00")).slice(0, 3);
  
  daily.forEach(day => {
    const date = new Date(day.dt * 1000).toLocaleDateString('es-ES', { weekday: 'short' });
    forecastCont.innerHTML += `
      <div class="forecast-item">
        <p class="forecast-day">${date}</p>
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
        <p class="forecast-temp">${day.main.temp.toFixed(0)}°C</p>
      </div>
    `;
  });
}

// --- RELÉS ---
function renderRelays() {
  const container = document.getElementById("reles-status");
  container.innerHTML = "";
  for(let i=1; i<=8; i++) {
    container.innerHTML += `
      <div class="rele-card">
        <div class="rele-info">
          <div class="dot" id="dot-${i}"></div>
          <span>Actuador ${i}</span>
        </div>
        <button class="rele-toggle" onclick="this.parentElement.querySelector('.dot').classList.toggle('on')">ON/OFF</button>
      </div>
    `;
  }
}

// Iniciar cargando sensores
showSection("sensores");
