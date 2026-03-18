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
const W_KEY = "233740e194c45ee901ca539f6773ed0d";
const LAT = "36.8340"; const LON = "-2.4637";

let sensorChart, energyChart;

// --- NAVEGACIÓN ---
const showSection = (id) => {
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.getElementById(`${id}-display`).style.display = 'block';
    document.getElementById(`btn-${id}`).classList.add('active');

    if(id === 'energia') fetchEnergy();
    if(id === 'clima') fetchWeather();
    if(id === 'reles') renderRelays();
    if(id === 'sensores') initSensors();
};

// --- PRECIO LUZ (ESIOS + PROXY) ---
async function fetchEnergy() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const proxy = "https://api.allorigins.win/get?url=";
        const url = encodeURIComponent(`https://api.esios.ree.es/archives/70/download_json?locale=es&date=${today}`);
        
        const res = await fetch(proxy + url);
        const json = await res.json();
        const data = JSON.parse(json.contents);

        if(data && data.PVPC) {
            const prices = data.PVPC.map(item => ({
                h: item.Dia.split('T')[1].substring(0, 2),
                v: parseFloat(item.PCB.replace(',', '.'))
            }));

            const now = new Date().getHours();
            document.getElementById("price-now").innerText = prices[now].v.toFixed(2) + " €";
            document.getElementById("price-min").innerText = Math.min(...prices.map(p=>p.v)).toFixed(2) + " €";
            document.getElementById("price-max").innerText = Math.max(...prices.map(p=>p.v)).toFixed(2) + " €";

            const ctx = document.getElementById('energyChart').getContext('2d');
            if(energyChart) energyChart.destroy();
            energyChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: prices.map(p => p.h + ':00'),
                    datasets: [{
                        data: prices.map(p=>p.v),
                        backgroundColor: prices.map((_,i) => i === now ? '#0ea5e9' : 'rgba(255,255,255,0.1)'),
                        borderRadius: 5
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            });
        }
    } catch (e) { console.error("Error Luz:", e); }
}

// --- CLIMA ---
async function fetchWeather() {
    try {
        const resCurr = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=metric&appid=${W_KEY}&lang=es`);
        const curr = await resCurr.json();
        const resFore = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&units=metric&appid=${W_KEY}&lang=es`);
        const fore = await resFore.json();

        document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${curr.weather[0].icon}@4x.png`;
        document.getElementById("weather-temp").innerText = `${curr.main.temp.toFixed(1)}°C`;
        document.getElementById("weather-desc").innerText = curr.weather[0].description;

        const fCont = document.getElementById("forecast-container");
        fCont.innerHTML = "";
        fore.list.filter(f => f.dt_txt.includes("12:00:00")).slice(0,3).forEach(day => {
            const d = new Date(day.dt * 1000).toLocaleDateString('es', {weekday:'short'});
            fCont.innerHTML += `<div class="fore-item"><span>${d}</span><img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png"><b>${day.main.temp.toFixed(0)}°</b></div>`;
        });
    } catch (e) { console.error(e); }
}

// --- SENSORES ---
function initSensors() {
    onValue(ref(database, "/sensorData"), (snap) => {
        const data = Object.values(snap.val() || {}).slice(-20);
        if(data.length > 0) {
            const last = data[data.length-1];
            document.getElementById("humidity").innerText = `${last.humidity_aht?.toFixed(1)}%`;
            document.getElementById("tempAHT").innerText = `${last.temperature_aht?.toFixed(1)}°C`;
            document.getElementById("pressure").innerText = `${last.pressure_bmp?.toFixed(0)} hPa`;
            document.getElementById("tempBMP").innerText = `${last.temperature_bmp?.toFixed(1)}°C`;
        }
    });
}

// --- RELÉS ---
function renderRelays() {
    const grid = document.getElementById("reles-grid");
    grid.innerHTML = "";
    for(let i=1; i<=8; i++) {
        grid.innerHTML += `
            <div class="rele-card">
                <div class="rele-info"><div class="dot" id="dot-${i}"></div><span>Relé ${i}</span></div>
                <label class="switch"><input type="checkbox" onchange="document.getElementById('dot-${i}').classList.toggle('on')"><span class="slider"></span></label>
            </div>`;
    }
}

// Listeners
document.getElementById("btn-sensores").onclick = () => showSection('sensores');
document.getElementById("btn-reles").onclick = () => showSection('reles');
document.getElementById("btn-clima").onclick = () => showSection('clima');
document.getElementById("btn-energia").onclick = () => showSection('energia');

document.getElementById("current-date").innerText = new Date().toLocaleDateString('es', {weekday:'long', day:'numeric', month:'long'});
showSection('sensores');
