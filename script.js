import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBJT5ckT_Os1eTxPvVn9kjFi3pXXEUeIe8",
    authDomain: "ardusens.firebaseapp.com",
    databaseURL: "https://ardusens-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "ardusens"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
let pChart = null;

// --- NAVEGACIÓN ---
window.showTab = (tab) => {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    const target = document.getElementById(`tab-${tab}`);
    if(target) target.classList.add('active');
    
    const btn = document.querySelector(`.nav-item[onclick*="${tab}"]`);
    if (btn) btn.classList.add('active');
    
    document.getElementById('tab-title').innerText = tab.charAt(0).toUpperCase() + tab.slice(1);

    if(tab === 'energy') loadEnergy();
    if(tab === 'core') loadRelays();
    if(tab === 'atmosphere') loadWeather();
};

// --- MOTOR DE ENERGÍA (ESTILO APAGA-LUZ) ---
async function loadEnergy() {
    const elNow = document.getElementById('p-now');
    const elMin = document.getElementById('p-min');
    const elMax = document.getElementById('p-max');
    
    elNow.innerHTML = '<i class="fas fa-bolt fa-spin"></i>';

    try {
        // Usamos el proxy para saltar el CORS de REE
        const target = "https://api.preciodelaluz.org/v1/prices/all?zone=PCB";
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(target)}`);
        const json = await response.json();
        const data = JSON.parse(json.contents);

        const hours = Object.values(data);
        const prices = hours.map(h => h.price);
        const nowIdx = new Date().getHours();
        const currentPrice = hours[nowIdx].price;

        // Lógica de Semáforo (Basada en la App Apaga Luz)
        const minP = Math.min(...prices);
        const maxP = Math.max(...prices);
        const range = maxP - minP;
        
        let statusColor = "#4ade80"; // Verde (Barato)
        if (currentPrice > minP + (range * 0.33)) statusColor = "#fbbf24"; // Naranja (Medio)
        if (currentPrice > minP + (range * 0.66)) statusColor = "#f87171"; // Rojo (Caro)

        // Actualizar UI con el color del "alma" de Hestia
        elNow.innerText = (currentPrice / 1000).toFixed(4) + " €/kWh";
        elNow.style.color = statusColor;
        elMin.innerText = (minP / 1000).toFixed(4) + " €";
        elMax.innerText = (maxP / 1000).toFixed(4) + " €";

        renderEnergyChart(hours.map(h => h.hour + 'h'), prices.map(p => p/1000), nowIdx, statusColor);

    } catch (e) {
        console.error("Hestia Energy Sync Error");
        useSimulatedEnergy();
    }
}

function renderEnergyChart(labels, prices, nowHour, activeColor) {
    const ctx = document.getElementById('energyChart').getContext('2d');
    if(pChart) pChart.destroy();
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(205, 127, 50, 0.4)'); 
    gradient.addColorStop(1, 'rgba(205, 127, 50, 0)');

    pChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: prices,
                backgroundColor: labels.map((_, i) => i === nowHour ? activeColor : gradient),
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#666' } },
                x: { grid: { display: false }, ticks: { color: '#666' } }
            }
        }
    });
}

// --- CORE CONTROL: ZONAS ---
function loadRelays() {
    const container = document.getElementById('relay-container');
    if(!container) return;
    const zones = ["Great Hall", "South Garden", "Library", "Kitchen", "Master Bed", "Wine Cellar", "Gallery", "Gate"];
    container.innerHTML = zones.map((z, i) => `
        <div class="relay-card glass">
            <div class="relay-info"><i class="fas fa-fingerprint"></i><span>${z}</span></div>
            <div class="hestia-switch" onclick="this.classList.toggle('active')"><div class="knob"></div></div>
        </div>`).join('');
}

// --- ATMOSPHERE ---
async function loadWeather() {
    const W_KEY = "233740e194c45ee901ca539f6773ed0d";
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=36.8340&lon=-2.4637&units=metric&appid=${W_KEY}&lang=es`);
        const data = await res.json();
        const cur = data.list[0];
        document.getElementById('w-icon').src = `https://openweathermap.org/img/wn/${cur.weather[0].icon}@4x.png`;
        document.getElementById('w-temp').innerText = cur.main.temp.toFixed(1) + "°";
        document.getElementById('w-desc').innerText = cur.weather[0].description.toUpperCase();
        document.getElementById('w-wind').innerText = cur.wind.speed;
        document.getElementById('w-hum').innerText = cur.main.humidity;
    } catch(e) { console.log("Atmosphere error"); }
}

// --- FIREBASE SYNC ---
onValue(ref(db, "/sensorData"), (snap) => {
    const val = snap.val();
    if(val) {
        const data = Object.values(val).pop();
        document.getElementById('val-hum').innerText = data.humidity_aht.toFixed(1) + "%";
        document.getElementById('val-temp').innerText = data.temperature_aht.toFixed(1) + "°";
        document.getElementById('val-pres').innerText = Math.round(data.pressure_bmp);
        document.getElementById('val-pcb').innerText = data.temperature_bmp.toFixed(1) + "°";
    }
});

// Respaldo por si falla la red
function useSimulatedEnergy() {
    const elNow = document.getElementById('p-now');
    elNow.innerText = "Check Connection";
    elNow.style.color = "#ff4d4d";
}

setInterval(() => {
    const clock = document.getElementById('live-clock');
    if(clock) clock.innerText = new Date().toLocaleTimeString();
}, 1000);

document.addEventListener('DOMContentLoaded', () => setTimeout(() => showTab('essence'), 200));
