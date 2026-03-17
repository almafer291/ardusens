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

const OPENWEATHER_KEY = "233740e194c45ee901ca539f6773ed0d"; 
// Coordenadas exactas Almería Centro
const LAT = "36.8340";
const LON = "-2.4637"; 

let sensorChart;

// --- CLIMA ---
async function fetchWeather() {
    try {
        const currRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=metric&appid=${OPENWEATHER_KEY}&lang=es`);
        const curr = await currRes.json();
        
        const foreRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&units=metric&appid=${OPENWEATHER_KEY}&lang=es`);
        const fore = await foreRes.json();

        updateCurrentWeather(curr);
        updateForecast(fore.list);
    } catch (e) { console.error("Error en API Clima:", e); }
}

function updateCurrentWeather(data) {
    document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
    document.getElementById("weather-temp").innerText = `${data.main.temp.toFixed(1)}°C`;
    document.getElementById("weather-description").innerText = data.weather[0].description.toUpperCase();

    document.getElementById("weather-details").innerHTML = `
        <div class="detail-box"><i class="fas fa-droplet icon-blue"></i><span>${data.main.humidity}%</span><label>Humedad</label></div>
        <div class="detail-box"><i class="fas fa-wind icon-green"></i><span>${data.wind.speed} m/s</span><label>Viento</label></div>
        <div class="detail-box"><i class="fas fa-temperature-high icon-red"></i><span>${data.main.feels_like.toFixed(1)}°C</span><label>Sensación</label></div>
        <div class="detail-box"><i class="fas fa-compress-arrows-alt icon-orange"></i><span>${data.main.pressure} hPa</span><label>Presión</label></div>
    `;
}

function updateForecast(list) {
    const container = document.getElementById("forecast-container");
    container.innerHTML = "";
    // Filtramos para obtener el mediodía de los próximos 5 días
    const daily = list.filter(f => f.dt_txt.includes("12:00:00"));

    daily.forEach(day => {
        const date = new Date(day.dt * 1000).toLocaleDateString('es-ES', {weekday: 'short'});
        container.innerHTML += `
            <div class="forecast-card">
                <span class="day">${date}</span>
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
                <span class="temp">${day.main.temp.toFixed(0)}°C</span>
            </div>
        `;
    });
}

// --- SENSORES ---
function initChart() {
    const ctx = document.getElementById('sensorChart').getContext('2d');
    sensorChart = new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [
            { label: 'Temp AHT20', borderColor: '#f87171', backgroundColor: 'rgba(248, 113, 113, 0.1)', data: [], fill: true, tension: 0.4 },
            { label: 'Humedad', borderColor: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.1)', data: [], fill: true, tension: 0.4 }
        ]},
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }, x: { display: false } },
            plugins: { legend: { labels: { color: '#fff' } } }
        }
    });
}

function initSensors() {
    if(!sensorChart) initChart();
    const sensorRef = ref(database, "/sensorData");
    onValue(sensorRef, (snap) => {
        const val = snap.val();
        if(!val) return;
        const data = Object.values(val).slice(-15);
        const last = data[data.length - 1];

        document.getElementById("humidity").innerText = `${last.humidity_aht?.toFixed(1)}%`;
        document.getElementById("tempAHT").innerText = `${last.temperature_aht?.toFixed(1)}°C`;
        document.getElementById("pressure").innerText = `${last.pressure_bmp?.toFixed(0)} hPa`;
        document.getElementById("tempBMP").innerText = `${last.temperature_bmp?.toFixed(1)}°C`;

        sensorChart.data.labels = data.map((_, i) => i);
        sensorChart.data.datasets[0].data = data.map(d => d.temperature_aht);
        sensorChart.data.datasets[1].data = data.map(d => d.humidity_aht);
        sensorChart.update();
    });
}

// --- RELÉS ---
function initRelays() {
    const grid = document.getElementById("reles-grid");
    grid.innerHTML = "";
    for(let i=1; i<=8; i++) {
        const div = document.createElement("div");
        div.className = "rele-card";
        div.innerHTML = `
            <span>Relé ${i}</span>
            <label class="switch">
                <input type="checkbox" id="rele-${i}">
                <span class="slider"></span>
            </label>
        `;
        grid.appendChild(div);
    }
}

// --- NAVEGACIÓN ---
function showSection(name) {
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(`${name}-display` || `${name}-control`).style.display = 'block';
    document.getElementById(`btn-${name}`).classList.add('active');
    
    if(name === 'clima') fetchWeather();
}

document.getElementById("btn-sensores").onclick = () => showSection('sensores');
document.getElementById("btn-reles").onclick = () => showSection('reles');
document.getElementById("btn-clima").onclick = () => showSection('clima');

// Inicio
initSensors();
initRelays();
