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

// --- FUNCIÓN NAVEGACIÓN CORREGIDA ---
function showSection(sectionId) {
    // Ocultar todas
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));

    // Mostrar seleccionada
    document.getElementById(`${sectionId}-display` || sectionId).style.display = 'block';
    document.getElementById(`btn-${sectionId}`).classList.add('active');

    // Cargar datos específicos
    if(sectionId === 'clima') fetchWeather();
    if(sectionId === 'reles') initRelays();
    if(sectionId === 'sensores') initSensors();
}

// --- CLIMA ---
async function fetchWeather() {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=metric&appid=${WEATHER_KEY}&lang=es`);
        const data = await res.json();
        document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
        document.getElementById("weather-temp").innerText = `${data.main.temp.toFixed(1)}°C`;
        document.getElementById("weather-description").innerText = data.weather[0].description.toUpperCase();
        document.getElementById("weather-details").innerHTML = `
            <span>Viento: ${data.wind.speed} m/s</span> | <span>Humedad: ${data.main.humidity}%</span>
        `;
    } catch (e) { console.error(e); }
}

// --- RELÉS ---
function initRelays() {
    const grid = document.getElementById("reles-grid");
    grid.innerHTML = "";
    for(let i=1; i<=8; i++) {
        grid.innerHTML += `
            <div class="stat-card">
                <span>Relé ${i}</span>
                <button class="nav-item" style="background:var(--accent); color:black; justify-content:center">ON/OFF</button>
            </div>`;
    }
}

// --- SENSORES Y GRÁFICO ---
function initSensors() {
    const ctx = document.getElementById('sensorChart');
    if(!sensorChart && ctx) {
        sensorChart = new Chart(ctx, {
            type: 'line',
            data: { labels: [], datasets: [{ label: 'Temp', borderColor: '#f87171', data: [], tension: 0.4 }] },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
    onValue(ref(database, "/sensorData"), (snap) => {
        const data = Object.values(snap.val() || {}).slice(-15);
        if(data.length > 0) {
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
        }
    });
}

// Event Listeners
document.getElementById("btn-sensores").onclick = () => showSection('sensores');
document.getElementById("btn-reles").onclick = () => showSection('reles');
document.getElementById("btn-clima").onclick = () => showSection('clima');

// Inicio
showSection('sensores');
