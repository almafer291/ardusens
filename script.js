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
const LAT = "36.8340"; const LON = "-2.4637";

let sensorChart;

// --- NAVEGACIÓN ---
function showSection(section) {
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));

    const target = document.getElementById(`${section}-display`) || document.getElementById(`${section}-control`);
    if(target) target.style.display = 'block';
    document.getElementById(`btn-${section}`).classList.add('active');

    if(section === 'clima') fetchWeather();
    if(section === 'reles') initRelays();
    if(section === 'sensores') initSensors();
}

// --- CLIMA AMPLIADO ---
async function fetchWeather() {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=metric&appid=${WEATHER_KEY}&lang=es`);
        const d = await res.json();
        
        document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${d.weather[0].icon}@4x.png`;
        document.getElementById("weather-temp").innerText = `${d.main.temp.toFixed(1)}°C`;
        document.getElementById("weather-description").innerText = d.weather[0].description.toUpperCase();

        document.getElementById("weather-details-extended").innerHTML = `
            <div class="detail-box"><span>${d.main.humidity}%</span><small>Humedad</small></div>
            <div class="detail-box"><span>${d.wind.speed}m/s</span><small>Viento</small></div>
            <div class="detail-box"><span>${d.main.feels_like.toFixed(1)}°C</span><small>Sensación</small></div>
            <div class="detail-box"><span>${d.main.pressure}hPa</span><small>Presión</small></div>
            <div class="detail-box"><span>${d.clouds.all}%</span><small>Nubes</small></div>
            <div class="detail-box"><span>${(d.visibility/1000).toFixed(1)}km</span><small>Visibilidad</small></div>
        `;
    } catch (e) { console.error(e); }
}

// --- RELÉS CON INTERRUPTORES ---
function initRelays() {
    const grid = document.getElementById("reles-grid");
    grid.innerHTML = "";
    for(let i=1; i<=8; i++) {
        const card = document.createElement("div");
        card.className = "rele-card";
        card.innerHTML = `
            <div class="rele-info">
                <i class="fas fa-power-off"></i>
                <span>Canal ${i}</span>
            </div>
            <label class="switch">
                <input type="checkbox" id="switch-rele-${i}">
                <span class="slider"></span>
            </label>
        `;
        grid.appendChild(card);
    }
}

// --- SENSORES ---
function initSensors() {
    const ctx = document.getElementById('sensorChart');
    if(!sensorChart && ctx) {
        sensorChart = new Chart(ctx, {
            type: 'line',
            data: { labels: [], datasets: [{ label: 'Temp', borderColor: '#f87171', data: [], tension: 0.4, fill: true, backgroundColor: 'rgba(248,113,113,0.05)' }] },
            options: { responsive: true, maintainAspectRatio: false, scales: { x: { display: false } } }
        });
    }
    onValue(ref(database, "/sensorData"), (snap) => {
        const raw = snap.val(); if(!raw) return;
        const data = Object.values(raw).slice(-15);
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

// Eventos de botones
document.getElementById("btn-sensores").onclick = () => showSection('sensores');
document.getElementById("btn-reles").onclick = () => showSection('reles');
document.getElementById("btn-clima").onclick = () => showSection('clima');

// Inicio automático
showSection('sensores');
