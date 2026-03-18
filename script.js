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
const WEATHER_KEY = "233740e194c45ee901ca539f6773ed0d";
const LAT = "36.8340"; const LON = "-2.4637"; // Almería Centro

let sensorChart;

// --- CÁLCULOS METEOROLÓGICOS AVANZADOS ---
// Punto de Rocío (Dew Point) aproxima condensación
const calcDewPoint = (T, RH) => (237.7 * ((17.27 * T) / (237.7 + T) + Math.log(RH / 100))) / (17.27 - ((17.27 * T) / (237.7 + T) + Math.log(RH / 100)));

// Humedad Absoluta (g/m³) - Cantidad real de agua en el aire
const calcAbsoluteHumidity = (T, RH) => (6.112 * Math.exp((17.67 * T) / (T + 243.5)) * RH * 2.1674) / (273.15 + T);


// --- NAVEGACIÓN ---
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));

    document.getElementById(`${sectionId}-display`).style.display = 'block';
    document.getElementById(`btn-${sectionId}`).classList.add('active');

    if(sectionId === 'clima') fetchWeather();
    if(sectionId === 'sensores') initSensors();
}

// --- CLIMA (DATOS Y CÁLCULOS AMPLIADOS) ---
async function fetchWeather() {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=metric&appid=${WEATHER_KEY}&lang=es`);
        const d = await res.json();
        
        // Héroe (Datos Principales)
        document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${d.weather[0].icon}@4x.png`;
        document.getElementById("weather-temp").innerText = `${d.main.temp.toFixed(0)}°`;
        document.getElementById("weather-description").innerText = d.weather[0].description.toUpperCase();
        document.getElementById("weather-feels").innerText = `${d.main.feels_like.toFixed(1)}°C`;

        // Astros (Sol)
        const formatTime = (unix) => new Date(unix * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        document.getElementById("sunrise").innerText = formatTime(d.sys.sunrise);
        document.getElementById("sunset").innerText = formatTime(d.sys.sunset);

        // GRID DE DETALLES AVANZADOS (12 Datos e Iconos)
        const dp = calcDewPoint(d.main.temp, d.main.humidity).toFixed(1);
        const ah = calcAbsoluteHumidity(d.main.temp, d.main.humidity).toFixed(1);

        const detailsGrid = document.getElementById("weather-details-extended");
        detailsGrid.innerHTML = `
            <div class="w-detail-card icon-blue"><i class="fas fa-droplet"></i><span>${d.main.humidity}%</span><small>Humedad Rel.</small></div>
            <div class="w-detail-card icon-green"><i class="fas fa-wind"></i><span>${d.wind.speed} m/s</span><small>Vel. Viento</small></div>
            <div class="w-detail-card icon-orange"><i class="fas fa-compass"></i><span>${d.wind.deg}°</span><small>Dirección</small></div>
            <div class="w-detail-card icon-red"><i class="fas fa-compress-arrows-alt"></i><span>${d.main.pressure} hPa</span><small>Presión</small></div>
            <div class="w-detail-card icon-blue"><i class="fas fa-cloud"></i><span>${d.clouds.all}%</span><small>Nubosidad</small></div>
            <div class="w-detail-card icon-orange"><i class="fas fa-eye"></i><span>${(d.visibility/1000).toFixed(1)} km</span><small>Visibilidad</small></div>
            <div class="w-detail-card icon-purple"><i class="fas fa-temperature-arrow-down"></i><span>${dp}°C</span><small>Punto Rocío</small></div>
            <div class="w-detail-card icon-blue"><i class="fas fa-tint"></i><span>${ah} g/m³</span><small>Hum. Absoluta</small></div>
            <div class="w-detail-card icon-red"><i class="fas fa-bolt"></i><span>${d.wind.gust || d.wind.speed} m/s</span><small>Ráfagas</small></div>
            <div class="w-detail-card icon-green"><i class="fas fa-water"></i><span>${d.main.sea_level || d.main.pressure} hPa</span><small>Nivel Mar</small></div>
        `;

    } catch (e) { console.error("Error OpenWeather:", e); }
}

// --- SENSORES Y GRÁFICO ---
function initChart() {
    const ctx = document.getElementById('sensorChart');
    if(!sensorChart && ctx) {
        sensorChart = new Chart(ctx, {
            type: 'line',
            data: { labels: [], datasets: [{
                label: 'Temperatura AHT20',
                borderColor: '#f87171',
                borderWidth: 4,
                pointRadius: 0,
                lineTension: 0.4,
                data: [],
                fill: true,
                backgroundColor: 'rgba(248, 113, 113, 0.03)'
            }] },
            options: { 
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { 
                    x: { display: false },
                    y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#94a3b8', font: {family: 'Plus Jakarta Sans'} } }
                }
            }
        });
    }
}

function initSensors() {
    if(!sensorChart) initChart();
    onValue(ref(database, "/sensorData"), (snap) => {
        const raw = snap.val(); if(!raw) return;
        const data = Object.values(raw).slice(-20);
        const last = data[data.length - 1];

        document.getElementById("humidity").innerText = `${last.humidity_aht?.toFixed(1)}%`;
        document.getElementById("tempAHT").innerText = `${last.temperature_aht?.toFixed(1)}°C`;
        document.getElementById("pressure").innerText = `${last.pressure_bmp?.toFixed(0)} hPa`;
        document.getElementById("tempBMP").innerText = `${last.temperature_bmp?.toFixed(1)}°C`;

        if(sensorChart) {
            sensorChart.data.labels = data.map((_, i) => i);
            sensorChart.data.datasets[0].data = data.map(d => d.temperature_aht);
            sensorChart.update();
        }
    });
}

// --- RELÉS ---
function initRelays() {
    const grid = document.getElementById("reles-grid");
    grid.innerHTML = "";
    for(let i=1; i<=8; i++) {
        grid.innerHTML += `
            <div class="rele-card">
                <span>Canal Actuador ${i}</span>
                <label class="switch">
                    <input type="checkbox" id="switch-rele-${i}">
                    <span class="slider"></span>
                </label>
            </div>`;
    }
}

// Event Listeners (Corregido para Module type)
document.getElementById("btn-sensores").onclick = () => showSection('sensores');
document.getElementById("btn-reles").onclick = () => { showSection('reles'); initRelays(); };
document.getElementById("btn-clima").onclick = () => showSection('clima');

// Fecha Actual
document.getElementById("current-date").innerText = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

// Inicio por defecto
initSensors();
