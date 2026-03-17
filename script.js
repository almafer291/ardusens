import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

// Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBJT5ckT_Os1eTxPvVn9kjFi3pXXEUeIe8",
  authDomain: "ardusens.firebaseapp.com",
  databaseURL: "https://ardusens-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "ardusens"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Configuración OpenWeather
const OPENWEATHER_KEY = "233740e194c45ee901ca539f6773ed0d"; 
const CITY = "Almeria,ES"; 

let sensorChart;

// --- UTILIDADES ---
const calcDewPoint = (T, RH) => (237.7 * ((17.27 * T) / (237.7 + T) + Math.log(RH / 100))) / (17.27 - ((17.27 * T) / (237.7 + T) + Math.log(RH / 100)));

// --- LÓGICA CLIMA ---
async function fetchWeather() {
    try {
        const currRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${CITY}&units=metric&appid=${OPENWEATHER_KEY}&lang=es`);
        const curr = await currRes.json();
        
        const foreRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${CITY}&units=metric&appid=${OPENWEATHER_KEY}&lang=es`);
        const fore = await foreRes.json();

        updateCurrentWeather(curr);
        updateForecast(fore.list);
    } catch (e) { console.error("Error API:", e); }
}

function updateCurrentWeather(data) {
    document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
    document.getElementById("weather-temp").innerText = `${data.main.temp.toFixed(1)}°C`;
    document.getElementById("weather-description").innerText = data.weather[0].description.toUpperCase();

    document.getElementById("weather-details").innerHTML = `
        <div class="detail-box"><i class="fas fa-droplet icon-blue"></i><span>${data.main.humidity}%</span><label>Humedad</label></div>
        <div class="detail-box"><i class="fas fa-wind icon-green"></i><span>${data.wind.speed}m/s</span><label>Viento</label></div>
        <div class="detail-box"><i class="fas fa-temperature-high icon-red"></i><span>${data.main.feels_like}°C</span><label>Sensación</label></div>
        <div class="detail-box"><i class="fas fa-cloud-sun icon-orange"></i><span>${calcDewPoint(data.main.temp, data.main.humidity).toFixed(1)}°C</span><label>Punto Rocío</label></div>
    `;
}

function updateForecast(list) {
    const container = document.getElementById("forecast-container");
    container.innerHTML = "";
    const daily = list.filter(f => f.dt_txt.includes("12:00:00")).slice(0, 5);

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

// --- LÓGICA SENSORES ---
function initChart() {
    const ctx = document.getElementById('sensorChart').getContext('2d');
    sensorChart = new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [
            { label: 'Temperatura', borderColor: '#f87171', backgroundColor: 'rgba(248, 113, 113, 0.1)', data: [], fill: true, tension: 0.4 },
            { label: 'Humedad', borderColor: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.1)', data: [], fill: true, tension: 0.4 }
        ]},
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#f8fafc' } } },
            scales: { 
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            }
        }
    });
}

function initSensors() {
    if(!sensorChart) initChart();
    onValue(ref(database, "/sensorData"), (snap) => {
        const dataRaw = snap.val();
        if(!dataRaw) return;
        const data = Object.values(dataRaw).slice(-15);
        
        const last = data[data.length - 1];
        const tempEl = document.getElementById("tempAHT");
        
        // Alerta Visual: Si > 30°C se pone rojo brillante
        tempEl.style.color = last.temperature_aht > 30 ? "#ff4444" : "#f8fafc";
        
        document.getElementById("humidity").innerText = `${last.humidity_aht?.toFixed(1)}%`;
        tempEl.innerText = `${last.temperature_aht?.toFixed(1)}°C`;
        document.getElementById("pressure").innerText = `${last.pressure_bmp?.toFixed(0)} hPa`;
        document.getElementById("tempBMP").innerText = `${last.temperature_bmp?.toFixed(1)}°C`;
        
        sensorChart.data.labels = data.map((_, i) => i + 1);
        sensorChart.data.datasets[0].data = data.map(d => d.temperature_aht);
        sensorChart.data.datasets[1].data = data.map(d => d.humidity_aht);
        sensorChart.update();
    });
}

// --- NAVEGACIÓN ---
window.showSection = (name) => {
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    const target = document.getElementById(`${name}-display`) || document.getElementById(`${name}-control`);
    if(target) target.style.display = 'block';
    document.getElementById(`btn-${name}`).classList.add('active');
    document.getElementById("section-title").innerText = name.toUpperCase();

    if(name === 'clima') fetchWeather();
};

document.getElementById("btn-sensores").onclick = () => showSection('sensores');
document.getElementById("btn-reles").onclick = () => showSection('reles');
document.getElementById("btn-clima").onclick = () => showSection('clima');

// Inicio por defecto
initSensors();
