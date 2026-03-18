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

let sensorChart, energyChart;

// --- NAVEGACIÓN ---
window.showSection = (id) => {
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    
    document.getElementById(`${id}-display`).style.display = 'block';
    document.getElementById(`btn-${id}`).classList.add('active');

    if(id === 'clima') fetchWeather();
    if(id === 'energia') fetchEnergy();
    if(id === 'reles') initRelays();
    if(id === 'sensores') initSensors();
};

// --- PRECIO LUZ (API ESIOS CORREGIDA) ---
async function fetchEnergy() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const res = await fetch(`https://api.esios.ree.es/archives/70/download_json?locale=es&date=${today}`);
        const data = await res.json();
        
        // CORRECCIÓN: Convertir comas en puntos para que JS entienda los números
        const prices = data.PVPC.map(item => ({
            h: item.Dia.split('T')[1].substring(0, 2),
            v: parseFloat(item.PCB.replace(',', '.'))
        }));

        const now = new Date().getHours();
        document.getElementById("price-now").innerText = `${prices[now].v.toFixed(2)} €`;
        document.getElementById("price-min").innerText = `${Math.min(...prices.map(p=>p.v)).toFixed(2)} €`;
        document.getElementById("price-max").innerText = `${Math.max(...prices.map(p=>p.v)).toFixed(2)} €`;

        const ctx = document.getElementById('energyChart').getContext('2d');
        if(energyChart) energyChart.destroy();
        
        energyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: prices.map(p => p.h + ':00'),
                datasets: [{ 
                    label: '€/MWh', 
                    data: prices.map(p=>p.v), 
                    backgroundColor: prices.map((_,i) => i === now ? '#0ea5e9' : 'rgba(255,255,255,0.1)'),
                    borderRadius: 5
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false,
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                    x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                },
                plugins: { legend: { display: false } }
            }
        });
    } catch (e) { console.error("Error Luz:", e); }
}

// --- CLIMA (3 DÍAS + ACTUAL) ---
async function fetchWeather() {
    try {
        const resCurr = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=metric&appid=${WEATHER_KEY}&lang=es`);
        const curr = await resCurr.json();
        const resFore = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&units=metric&appid=${WEATHER_KEY}&lang=es`);
        const fore = await resFore.json();

        document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${curr.weather[0].icon}@4x.png`;
        document.getElementById("weather-temp").innerText = `${curr.main.temp.toFixed(1)}°C`;
        document.getElementById("weather-desc").innerText = curr.weather[0].description.toUpperCase();

        const foreCont = document.getElementById("forecast-container");
        foreCont.innerHTML = "";
        fore.list.filter(f => f.dt_txt.includes("12:00:00")).slice(0,3).forEach(day => {
            const date = new Date(day.dt * 1000).toLocaleDateString('es-ES', {weekday: 'short'});
            foreCont.innerHTML += `<div class="fore-item"><span>${date}</span><img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png"><b>${day.main.temp.toFixed(0)}°</b></div>`;
        });

        document.getElementById("weather-details-extended").innerHTML = `
            <div class="w-mini-card"><i class="fas fa-wind"></i> <span>${curr.wind.speed} m/s</span><small>Viento</small></div>
            <div class="w-mini-card"><i class="fas fa-droplet"></i> <span>${curr.main.humidity}%</span><small>Humedad</small></div>
            <div class="w-mini-card"><i class="fas fa-eye"></i> <span>${(curr.visibility/1000)} km</span><small>Visibilidad</small></div>
            <div class="w-mini-card"><i class="fas fa-compress-arrows-alt"></i> <span>${curr.main.pressure} hPa</span><small>Presión</small></div>
        `;
    } catch (e) { console.error(e); }
}

// --- SENSORES ---
function initSensors() {
    const ctx = document.getElementById('sensorChart').getContext('2d');
    if(!sensorChart) {
        sensorChart = new Chart(ctx, {
            type: 'line',
            data: { labels: [], datasets: [{ label: 'Temp AHT20', borderColor: '#f87171', data: [], tension: 0.4, fill: true, backgroundColor: 'rgba(248,113,113,0.05)' }] },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
    onValue(ref(database, "/sensorData"), (snap) => {
        const data = Object.values(snap.val() || {}).slice(-20);
        if(data.length > 0) {
            const last = data[data.length-1];
            document.getElementById("humidity").innerText = `${last.humidity_aht?.toFixed(1)}%`;
            document.getElementById("tempAHT").innerText = `${last.temperature_aht?.toFixed(1)}°C`;
            document.getElementById("pressure").innerText = `${last.pressure_bmp?.toFixed(0)} hPa`;
            document.getElementById("tempBMP").innerText = `${last.temperature_bmp?.toFixed(1)}°C`;
            sensorChart.data.labels = data.map((_,i)=>i);
            sensorChart.data.datasets[0].data = data.map(d=>d.temperature_aht);
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
                <div class="rele-info"><div class="dot" id="dot-${i}"></div><span>Canal ${i}</span></div>
                <label class="switch"><input type="checkbox" onchange="document.getElementById('dot-${i}').classList.toggle('on')"><span class="slider"></span></label>
            </div>`;
    }
}

// Listeners de botones
document.getElementById("btn-sensores").onclick = () => showSection('sensores');
document.getElementById("btn-reles").onclick = () => showSection('reles');
document.getElementById("btn-clima").onclick = () => showSection('clima');
document.getElementById("btn-energia").onclick = () => showSection('energia');

document.getElementById("current-date").innerText = new Date().toLocaleDateString('es-ES', {weekday:'long', day:'numeric', month:'long'});
showSection('sensores');
