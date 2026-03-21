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
let eChart, pChart;

// --- GESTOR DE TABS ---
window.showTab = (tab) => {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');
    event.currentTarget.classList.add('active');
    
    document.getElementById('tab-title').innerText = tab.charAt(0).toUpperCase() + tab.slice(1);

    if(tab === 'energy') loadEnergy();
    if(tab === 'core') loadRelays();
    if(tab === 'atmosphere') loadWeather();
};

// --- PRECIO LUZ (RESISTENTE A FALLOS) ---
async function loadEnergy() {
    try {
        const res = await fetch('https://api.preciodelaluz.org/v1/prices/all?zone=PCB');
        const data = await res.json();
        const now = new Date().getHours();
        const hours = Object.values(data);
        const prices = hours.map(h => h.price);

        document.getElementById('p-now').innerText = hours[now].price.toFixed(2) + " €";
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
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    } catch (e) { document.getElementById('p-now').innerText = "Offline"; }
}

// --- CORE CONTROL (RELÉS) ---
function loadRelays() {
    const container = document.getElementById('relay-container');
    container.innerHTML = "";
    for(let i=1; i<=8; i++) {
        container.innerHTML += `
            <div class="relay-card glass">
                <div class="relay-info">
                    <i class="fas fa-fingerprint"></i>
                    <span>Channel ${i}</span>
                </div>
                <div class="hestia-switch" onclick="this.classList.toggle('active')">
                    <div class="knob"></div>
                </div>
            </div>`;
    }
}

// --- ATMOSPHERE (CLIMA) ---
async function loadWeather() {
    const W_KEY = "233740e194c45ee901ca539f6773ed0d";
    const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=36.8340&lon=-2.4637&units=metric&appid=${W_KEY}&lang=es`);
    const data = await res.json();
    
    const cur = data.list[0];
    document.getElementById('w-icon').src = `https://openweathermap.org/img/wn/${cur.weather[0].icon}@4x.png`;
    document.getElementById('w-temp').innerText = cur.main.temp.toFixed(1) + "°";
    document.getElementById('w-desc').innerText = cur.weather[0].description;
    document.getElementById('w-wind').innerText = cur.wind.speed;
    document.getElementById('w-hum').innerText = cur.main.humidity;

    const fList = document.getElementById('w-forecast');
    fList.innerHTML = "<h3>Forecast</h3>";
    data.list.filter((_,i) => i % 8 === 0).forEach(d => {
        const day = new Date(d.dt * 1000).toLocaleDateString('en', {weekday:'short'});
        fList.innerHTML += `<div class="f-row"><span>${day}</span><img src="https://openweathermap.org/img/wn/${d.weather[0].icon}.png"><b>${d.main.temp.toFixed(0)}°</b></div>`;
    });
}

// --- FIREBASE SYNC ---
onValue(ref(db, "/sensorData"), (snap) => {
    const data = Object.values(snap.val() || {}).pop();
    if(data) {
        document.getElementById('val-hum').innerText = data.humidity_aht.toFixed(1) + "%";
        document.getElementById('val-temp').innerText = data.temperature_aht.toFixed(1) + "°";
        document.getElementById('val-pres').innerText = data.pressure_bmp.toFixed(0);
        document.getElementById('val-pcb').innerText = data.temperature_bmp.toFixed(1) + "°";
    }
});

setInterval(() => {
    document.getElementById('live-clock').innerText = new Date().toLocaleTimeString();
}, 1000);
