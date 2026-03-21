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
let pChart;

// --- NAVEGACIÓN ---
window.showTab = (tab) => {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');
    
    // El evento se captura del click
    if (event) event.currentTarget.classList.add('active');
    document.getElementById('tab-title').innerText = tab.charAt(0).toUpperCase() + tab.slice(1);

    if(tab === 'energy') loadEnergy();
    if(tab === 'core') loadRelays();
    if(tab === 'atmosphere') loadWeather();
};

// --- PRECIO LUZ (SOLUCIÓN DEFINITIVA CON PROXY) ---
async function loadEnergy() {
    const elNow = document.getElementById('p-now');
    elNow.innerText = "Connecting...";

    try {
        // Usamos AllOrigins para saltar el bloqueo del navegador
        const targetUrl = 'https://api.preciodelaluz.org/v1/prices/all?zone=PCB';
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
        
        const response = await fetch(proxyUrl);
        const wrappedData = await response.json();
        const data = JSON.parse(wrappedData.contents); // Extraemos el JSON real

        const now = new Date().getHours();
        const hours = Object.values(data);
        const prices = hours.map(h => h.price);

        elNow.innerText = hours[now].price.toFixed(2) + " €";
        document.getElementById('p-min').innerText = Math.min(...prices).toFixed(2) + " €";
        document.getElementById('p-max').innerText = Math.max(...prices).toFixed(2) + " €";

        const ctx = document.getElementById('energyChart').getContext('2d');
        if(pChart) pChart.destroy();
        pChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: hours.map(h => h.hour + 'h'),
                datasets: [{
                    data: prices,
                    backgroundColor: hours.map((_,i) => i === now ? '#cd7f32' : 'rgba(255,255,255,0.05)'),
                    borderRadius: 4
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666' } },
                    x: { grid: { display: false }, ticks: { color: '#666' } }
                }
            }
        });
    } catch (e) { 
        console.error("Hestia Energy Error:", e);
        elNow.innerText = "Sync Error"; 
    }
}

// --- RESTO DE FUNCIONES (CORREGIDAS) ---
function loadRelays() {
    const container = document.getElementById('relay-container');
    if(!container) return;
    container.innerHTML = "";
    for(let i=1; i<=8; i++) {
        container.innerHTML += `
            <div class="relay-card glass">
                <div class="relay-info"><i class="fas fa-fingerprint"></i><span>Channel ${i}</span></div>
                <div class="hestia-switch" onclick="this.classList.toggle('active')"><div class="knob"></div></div>
            </div>`;
    }
}

async function loadWeather() {
    const W_KEY = "233740e194c45ee901ca539f6773ed0d";
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=36.8340&lon=-2.4637&units=metric&appid=${W_KEY}&lang=es`);
        const data = await res.json();
        const cur = data.list[0];
        document.getElementById('w-icon').src = `https://openweathermap.org/img/wn/${cur.weather[0].icon}@4x.png`;
        document.getElementById('w-temp').innerText = cur.main.temp.toFixed(1) + "°";
        document.getElementById('w-desc').innerText = cur.weather[0].description;
        document.getElementById('w-wind').innerText = cur.wind.speed;
        document.getElementById('w-hum').innerText = cur.main.humidity;
    } catch(e) { console.log("Weather error"); }
}

onValue(ref(db, "/sensorData"), (snap) => {
    const val = snap.val();
    if(val) {
        const data = Object.values(val).pop();
        document.getElementById('val-hum').innerText = data.humidity_aht.toFixed(1) + "%";
        document.getElementById('val-temp').innerText = data.temperature_aht.toFixed(1) + "°";
        document.getElementById('val-pres').innerText = data.pressure_bmp.toFixed(0);
        document.getElementById('val-pcb').innerText = data.temperature_bmp.toFixed(1) + "°";
    }
});

setInterval(() => {
    const clock = document.getElementById('live-clock');
    if(clock) clock.innerText = new Date().toLocaleTimeString();
}, 1000);
