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
const W_KEY = "233740e194c45ee901ca539f6773ed0d";
const LAT = "36.8340"; const LON = "-2.4637";

let sensorChart, energyChart;

// --- GESTIÓN DE TABS ---
window.showTab = (tab) => {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(`${tab}-tab`).classList.add('active');
    
    // Cambiar título y estilo del botón
    const titles = {home:'Resumen de Sensores', devices:'Control de Actuadores', weather:'Meteorología Avanzada', energy:'Mercado Eléctrico'};
    document.getElementById('tab-title').innerText = titles[tab];

    if(tab === 'devices') renderRelays();
    if(tab === 'weather') fetchWeather();
    if(tab === 'energy') fetchEnergy();
};

// --- PRECIO ENERGÍA (API ALTERNATIVA MÁS FIABLE) ---
async function fetchEnergy() {
    try {
        // Usamos una API que no bloquea por CORS fácilmente
        const res = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://api.preciodelaluz.org/v1/prices/all?zone=PCB'));
        const json = await res.json();
        const data = JSON.parse(json.contents);
        
        const prices = Object.values(data).map(h => ({ hour: h.hour, val: h.price }));
        const nowHour = new Date().getHours();
        
        document.getElementById('e-now').innerText = prices[nowHour].val.toFixed(2) + " €";
        document.getElementById('e-min').innerText = Math.min(...prices.map(p=>p.val)).toFixed(2) + " €";
        document.getElementById('e-max').innerText = Math.max(...prices.map(p=>p.val)).toFixed(2) + " €";

        const ctx = document.getElementById('energyChart');
        if(energyChart) energyChart.destroy();
        energyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: prices.map(p => p.hour + 'h'),
                datasets: [{ 
                    label: '€/MWh', 
                    data: prices.map(p=>p.val), 
                    backgroundColor: prices.map((_,i) => i === nowHour ? '#38bdf8' : 'rgba(255,255,255,0.1)'),
                    borderRadius: 5
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    } catch (e) { document.getElementById('e-now').innerText = "Error API"; }
}

// --- CLIMA ---
async function fetchWeather() {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&units=metric&appid=${W_KEY}&lang=es`);
    const data = await res.json();
    
    const cur = data.list[0];
    document.getElementById('w-icon').src = `https://openweathermap.org/img/wn/${cur.weather[0].icon}@4x.png`;
    document.getElementById('w-temp').innerText = cur.main.temp.toFixed(1) + "°C";
    document.getElementById('w-desc').innerText = cur.weather[0].description.toUpperCase();
    document.getElementById('w-wind').innerText = cur.wind.speed;
    document.getElementById('w-hum').innerText = cur.main.humidity;

    const list = document.getElementById('forecast-list');
    list.innerHTML = "";
    data.list.filter((_,i) => i % 8 === 0).forEach(d => {
        const date = new Date(d.dt * 1000).toLocaleDateString('es', {weekday:'short'});
        list.innerHTML += `<div class="f-item"><span>${date}</span><img src="https://openweathermap.org/img/wn/${d.weather[0].icon}.png"><b>${d.main.temp.toFixed(0)}°</b></div>`;
    });
}

// --- ACTUADORES (BOTONES PRO) ---
function renderRelays() {
    const grid = document.getElementById('relay-grid');
    grid.innerHTML = "";
    for(let i=1; i<=8; i++) {
        grid.innerHTML += `
            <div class="relay-card glass">
                <i class="fas fa-lightbulb"></i>
                <p>Relé Canal ${i}</p>
                <div class="switch-btn" onclick="toggleRelay(this, ${i})">OFF</div>
            </div>`;
    }
}

window.toggleRelay = (btn, id) => {
    btn.classList.toggle('on');
    btn.innerText = btn.classList.contains('on') ? 'ON' : 'OFF';
};

// --- SENSORES FIREBASE ---
onValue(ref(db, "/sensorData"), (snap) => {
    const data = Object.values(snap.val() || {}).pop();
    if(data) {
        document.getElementById('h-val').innerText = data.humidity_aht.toFixed(1) + "%";
        document.getElementById('ta-val').innerText = data.temperature_aht.toFixed(1) + "°C";
        document.getElementById('p-val').innerText = data.pressure_bmp.toFixed(0) + " hPa";
        document.getElementById('tp-val').innerText = data.temperature_bmp.toFixed(1) + "°C";
    }
});

document.getElementById('date-now').innerText = new Date().toLocaleDateString();
