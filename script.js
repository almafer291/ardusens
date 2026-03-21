import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

// --- CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyBJT5ckT_Os1eTxPvVn9kjFi3pXXEUeIe8",
    authDomain: "ardusens.firebaseapp.com",
    databaseURL: "https://ardusens-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "ardusens"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
let pChart = null;

// --- GESTIÓN DE NAVEGACIÓN (TABS) ---
window.showTab = (tab) => {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    const target = document.getElementById(`tab-${tab}`);
    if (target) target.classList.add('active');
    
    // Resaltar botón en sidebar
    const activeBtn = document.querySelector(`.nav-item[onclick*="${tab}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    document.getElementById('tab-title').innerText = tab.charAt(0).toUpperCase() + tab.slice(1);

    if(tab === 'energy') loadEnergy();
    if(tab === 'core') loadRelays();
    if(tab === 'atmosphere') loadWeather();
};

// --- MOTOR DE ENERGÍA (ESIOS + SEMÁFORO) ---
async function loadEnergy() {
    const elNow = document.getElementById('p-now');
    const elMin = document.getElementById('p-min');
    const elMax = document.getElementById('p-max');
    
    elNow.innerHTML = '<i class="fas fa-fire-alt fa-spin" style="color:#cd7f32"></i>';

    const proxies = [
        "https://api.allorigins.win/get?url=",
        "https://corsproxy.io/?",
        "https://thingproxy.freeboard.io/fetch/"
    ];

    async function tryFetch(index) {
        if (index >= proxies.length) {
            useSimulatedEnergy(); // Último recurso si todo falla
            return;
        }

        try {
            const target = "https://api.preciodelaluz.org/v1/prices/all?zone=PCB";
            const response = await fetch(proxies[index] + encodeURIComponent(target));
            
            if (!response.ok) throw new Error();

            const json = await response.json();
            const data = typeof json.contents === 'string' ? JSON.parse(json.contents) : (json.contents || json);

            const hours = Object.values(data);
            const prices = hours.map(h => h.price);
            const nowIdx = new Date().getHours();
            const currentPrice = hours[nowIdx].price;

            // --- Lógica de Ahorro (Semáforo) ---
            const minP = Math.min(...prices);
            const maxP = Math.max(...prices);
            const range = maxP - minP;
            
            let statusColor = "#4ade80"; // Verde (Barato)
            if (currentPrice > minP + (range * 0.35)) statusColor = "#fbbf24"; // Naranja (Medio)
            if (currentPrice > minP + (range * 0.70)) statusColor = "#f87171"; // Rojo (Caro)

            // Actualizar UI
            elNow.innerText = (currentPrice / 1000).toFixed(4) + " €/kWh";
            elNow.style.color = statusColor;
            elMin.innerText = (minP / 1000).toFixed(4) + " €";
            elMax.innerText = (maxP / 1000).toFixed(4) + " €";

            renderEnergyChart(hours.map(h => h.hour + 'h'), prices.map(p => p/1000), nowIdx, statusColor);
            console.log("Hestia: Energy linked via proxy " + index);

        } catch (e) {
            console.warn(`Hestia: Bridge ${index} offline. Trying next...`);
            tryFetch(index + 1);
        }
    }
    tryFetch(0);
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
                borderRadius: 4
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

// Respaldo Inteligente (Modo Simulación)
function useSimulatedEnergy() {
    const now = new Date().getHours();
    const mockPrices = [0.12, 0.11, 0.10, 0.10, 0.11, 0.14, 0.22, 0.28, 0.26, 0.23, 0.21, 0.20, 0.19, 0.18, 0.19, 0.22, 0.25, 0.29, 0.32, 0.30, 0.26, 0.21, 0.16, 0.13];
    
    document.getElementById('p-now').innerText = mockPrices[now].toFixed(4) + " €/kWh";
    document.getElementById('p-now').style.color = "#cd7f32"; 
    document.getElementById('p-min').innerText = "0.1000 €";
    document.getElementById('p-max').innerText = "0.3200 €";
    
    renderEnergyChart(Array.from({length: 24}, (_, i) => i + 'h'), mockPrices, now, "#ffffff");
}

// --- CORE CONTROL (RELÉS POR ZONAS) ---
function loadRelays() {
    const container = document.getElementById('relay-container');
    if(!container) return;
    const zones = ["Great Hall", "South Garden", "Library", "Kitchen Hearth", "Master Suite", "Wine Cellar", "Gallery", "Outer Gate"];
    container.innerHTML = zones.map((z, i) => `
        <div class="relay-card glass">
            <div class="relay-info"><i class="fas fa-fingerprint"></i><span>${z}</span></div>
            <div class="hestia-switch" onclick="this.classList.toggle('active')"><div class="knob"></div></div>
        </div>`).join('');
}

// --- ATMOSPHERE (TIEMPO) ---
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
    } catch(e) { console.log("Hestia Atmosphere error"); }
}

// --- FIREBASE SYNC (DATOS REALES) ---
onValue(ref(db, "/sensorData"), (snap) => {
    const val = snap.val();
    if(val) {
        const data = Object.values(val).pop();
        document.getElementById('val-hum').innerText = (data.humidity_aht || 0).toFixed(1) + "%";
        document.getElementById('val-temp').innerText = (data.temperature_aht || 0).toFixed(1) + "°";
        document.getElementById('val-pres').innerText = Math.round(data.pressure_bmp || 0);
        document.getElementById('val-pcb').innerText = (data.temperature_bmp || 0).toFixed(1) + "°";
    }
});

// Reloj en vivo
setInterval(() => {
    const clock = document.getElementById('live-clock');
    if(clock) clock.innerText = new Date().toLocaleTimeString();
}, 1000);

// Inicio Automático
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => showTab('essence'), 200);
});
