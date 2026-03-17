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
const LAT = "36.8340";
const LON = "-2.4637";

let sensorChart;

// --- CLIMA ---
async function fetchWeather() {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=metric&appid=${WEATHER_KEY}&lang=es`);
        const data = await res.json();
        
        document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
        document.getElementById("weather-temp").innerText = `${data.main.temp.toFixed(1)}°C`;
        document.getElementById("weather-description").innerText = data.weather[0].description;
        document.getElementById("weather-wind").innerText = `${data.wind.speed} m/s`;
        document.getElementById("weather-visibility").innerText = `${(data.visibility/1000).toFixed(1)} km`;
    } catch (e) { console.error("Error Clima:", e); }
}

// --- GRÁFICO ---
function initChart() {
    const ctx = document.getElementById('sensorChart').getContext('2d');
    sensorChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Temp',
                borderColor: '#f87171',
                borderWidth: 3,
                pointRadius: 0,
                data: [],
                fill: true,
                backgroundColor: 'rgba(248, 113, 113, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } }
            }
        }
    });
}

// --- SENSORES ---
function initSensors() {
    if(!sensorChart) initChart();
    onValue(ref(database, "/sensorData"), (snap) => {
        const val = snap.val();
        if(!val) return;
        const data = Object.values(val).slice(-20);
        const last = data[data.length - 1];

        document.getElementById("humidity").innerText = `${last.humidity_aht?.toFixed(1)}%`;
        document.getElementById("tempAHT").innerText = `${last.temperature_aht?.toFixed(1)}°C`;
        document.getElementById("pressure").innerText = `${last.pressure_bmp?.toFixed(0)} hPa`;
        document.getElementById("tempBMP").innerText = `${last.temperature_bmp?.toFixed(1)}°C`;

        sensorChart.data.labels = data.map((_, i) => i);
        sensorChart.data.datasets[0].data = data.map(d => d.temperature_aht);
        sensorChart.update();
    });
}

// --- NAVEGACIÓN ---
window.showSection = (name) => {
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    
    document.getElementById(`${name}-display`).style.display = 'block';
    document.getElementById(`btn-${name}`).classList.add('active');
    
    if(name === 'clima') fetchWeather();
};

// Iniciar
initSensors();
document.getElementById("current-date").innerText = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
