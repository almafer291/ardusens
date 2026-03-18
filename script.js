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

// --- NAVEGACIÓN ---
function showSection(id) {
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.getElementById(`${id}-display` || id).style.display = 'block';
    document.getElementById(`btn-${id}`).classList.add('active');
    if(id === 'clima') fetchExtendedWeather();
}

// --- CLIMA AVANZADO ---
async function fetchExtendedWeather() {
    try {
        // 1. Datos Actuales
        const resCurr = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=metric&appid=${API_KEY}&lang=es`);
        const curr = await resCurrRes = await resCurr.json();

        // 2. Previsión (Forecast)
        const resFore = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&units=metric&appid=${API_KEY}&lang=es`);
        const fore = await resFore.json();

        updateUI(curr, fore.list);
    } catch (e) { console.error(e); }
}

function updateUI(curr, list) {
    // Actual Principal
    document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${curr.weather[0].icon}@4x.png`;
    document.getElementById("weather-temp").innerText = `${curr.main.temp.toFixed(1)}°C`;
    document.getElementById("weather-description").innerText = curr.weather[0].description.toUpperCase();
    
    const time = (u) => new Date(u * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    document.getElementById("sunrise").innerText = time(curr.sys.sunrise);
    document.getElementById("sunset").innerText = time(curr.sys.sunset);

    // Previsión 3 Días (Filtrando mediodía de los próximos 3 días)
    const forecastDiv = document.getElementById("forecast-3days");
    forecastDiv.innerHTML = "";
    const dailyData = list.filter(f => f.dt_txt.includes("12:00:00")).slice(0, 3);
    
    dailyData.forEach(day => {
        const dName = new Date(day.dt * 1000).toLocaleDateString('es-ES', {weekday: 'short'});
        forecastDiv.innerHTML += `
            <div class="fore-item">
                <span class="day">${dName}</span>
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
                <span class="temp">${day.main.temp.toFixed(0)}°</span>
            </div>
        `;
    });

    // Detalles Extendidos (10+ datos)
    const grid = document.getElementById("extended-weather-data");
    const dewPoint = (curr.main.temp - ((100 - curr.main.humidity) / 5)).toFixed(1);
    
    grid.innerHTML = `
        <div class="w-mini-card"><i class="fas fa-wind icon-blue"></i> <span>${curr.wind.speed} m/s</span><small>Viento</small></div>
        <div class="w-mini-card"><i class="fas fa-droplet icon-blue"></i> <span>${curr.main.humidity}%</span><small>Humedad</small></div>
        <div class="w-mini-card"><i class="fas fa-eye icon-orange"></i> <span>${(curr.visibility/1000).toFixed(1)} km</span><small>Visibilidad</small></div>
        <div class="w-mini-card"><i class="fas fa-compress-arrows-alt icon-green"></i> <span>${curr.main.pressure} hPa</span><small>Presión</small></div>
        <div class="w-mini-card"><i class="fas fa-cloud icon-muted"></i> <span>${curr.clouds.all}%</span><small>Nubosidad</small></div>
        <div class="w-mini-card"><i class="fas fa-temperature-arrow-down icon-purple"></i> <span>${dewPoint}°C</span><small>Punto Rocío</small></div>
        <div class="w-mini-card"><i class="fas fa-sun icon-orange"></i> <span>${curr.main.feels_like.toFixed(1)}°C</span><small>Sensación</small></div>
        <div class="w-mini-card"><i class="fas fa-bolt icon-red"></i> <span>${curr.wind.gust || '0'} m/s</span><small>Ráfagas</small></div>
    `;
}

// Event Listeners
document.getElementById("btn-sensores").onclick = () => showSection('sensores');
document.getElementById("btn-clima").onclick = () => showSection('clima');
document.getElementById("btn-reles").onclick = () => { showSection('reles'); initRelays(); };

// Iniciar
showSection('sensores');
document.getElementById("current-date").innerText = new Date().toLocaleDateString('es-ES', {weekday:'long', day:'numeric', month:'long'});
