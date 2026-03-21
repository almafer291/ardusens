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
    // 1. Ocultar todas las secciones
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    // 2. Desactivar todos los botones de navegación
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    // 3. Activar la pestaña seleccionada
    const targetTab = document.getElementById(`tab-${tab}`);
    if (targetTab) targetTab.classList.add('active');
    
    // 4. Resaltar el botón clickeado
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    // 5. Actualizar el título del Header
    const titles = {
        essence: 'Home Essence',
        core: 'Core Control',
        atmosphere: 'Atmosphere',
        energy: 'Energy Flow'
    };
    document.getElementById('tab-title').innerText = titles[tab] || 'Hestia';

    // 6. Cargar datos específicos de la sección
    if(tab === 'energy') loadEnergy();
    if(tab === 'core') loadRelays();
    if(tab === 'atmosphere') loadWeather();
};

// --- ENERGY FLOW: MOTOR DE PRECIOS CON FALLBACK ---
async function loadEnergy() {
    const elNow = document.getElementById('p-now');
    const elMin = document.getElementById('p-min');
    const elMax = document.getElementById('p-max');
    
    elNow.innerHTML = '<i class="fas fa-fire fa-spin" style="color:#cd7f32"></i>'; 

    const proxies = [
        "https://api.allorigins.win/get?url=",
        "https://thingproxy.freeboard.io/fetch/",
        "https://corsproxy.io/?"
    ];

    async function tryFetch(proxyIdx) {
        try {
            const targetUrl = `https://api.preciodelaluz.org/v1/prices/all?zone=PCB&cache=${Date.now()}`;
            const finalUrl = proxies[proxyIdx] + encodeURIComponent(targetUrl);
            
            const response = await fetch(finalUrl);
            if (!response.ok) throw new Error("Proxy error");
            
            const raw = await response.json();
            // AllOrigins devuelve .contents, otros devuelven el JSON directamente
            const data = typeof raw.contents === 'string' ? JSON.parse(raw.contents) : (raw.contents || raw);

            const hours = Object.values(data);
            const prices = hours.map(h => h.price);
            const now = new Date().getHours();

            // Actualizar UI de Hestia
            elNow.innerText = hours[now].price.toFixed(2) + " €";
            elMin.innerText = Math.min(...prices).toFixed(2) + " €";
            elMax.innerText = Math.max(...prices).toFixed(2) + " €";

            renderEnergyChart(hours, prices, now);
            
        } catch (err) {
            console.warn(`Hestia: Proxy ${proxyIdx} down, trying next...`);
            if (proxyIdx < proxies.length - 1) {
                tryFetch(proxyIdx + 1);
            } else {
                elNow.innerText = "Offline";
            }
        }
    }
    tryFetch(0);
}

function renderEnergyChart(hours, prices, nowHour) {
    const ctx = document.getElementById('energyChart').getContext('2d');
    if(pChart) pChart.destroy();
    
    // Gradiente "Fuego Sagrado"
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(205, 127, 50, 0.6)'); 
    gradient.addColorStop(1, 'rgba(205, 127, 50, 0.02)');

    pChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: hours.map(h => h.hour + 'h'),
            datasets: [{
                data: prices,
                backgroundColor: hours.map((_, i) => i === nowHour ? '#ffffff' : gradient),
                borderColor: hours.map((_, i) => i === nowHour ? '#ffffff' : 'transparent'),
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#555' } },
                x: { grid: { display: false }, ticks: { color: '#555' } }
            }
        }
    });
}

// --- CORE CONTROL: INTERRUPTORES DE RELÉS ---
function loadRelays() {
    const container = document.getElementById('relay-container');
    if(!container) return;
    container.innerHTML = "";
    for(let i=1; i<=8; i++) {
        container.innerHTML += `
            <div class="relay-card glass">
                <div class="relay-info">
                    <i class="fas fa-fingerprint"></i>
                    <span>Relay Channel ${i}</span>
                </div>
                <div class="hestia-switch" onclick="this.classList.toggle('active')">
                    <div class="knob"></div>
                </div>
            </div>`;
    }
}

// --- ATMOSPHERE: METEOROLOGÍA ---
async function loadWeather() {
    const W_KEY = "233740e194c45ee901ca539f6773ed0d";
    const LAT = "36.8340"; const LON = "-2.4637";
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&units=metric&appid=${W_KEY}&lang=es`);
        const data = await res.json();
        
        const cur = data.list[0];
        document.getElementById('w-icon').src = `https://openweathermap.org/img/wn/${cur.weather[0].icon}@4x.png`;
        document.getElementById('w-temp').innerText = cur.main.temp.toFixed(1) + "°";
        document.getElementById('w-desc').innerText = cur.weather[0].description.toUpperCase();
        document.getElementById('w-wind').innerText = cur.wind.speed;
        document.getElementById('w-hum').innerText = cur.main.humidity;

        const fList = document.getElementById('w-forecast');
        if(fList) {
            fList.innerHTML = "<h3>Future Atmosphere</h3>";
            data.list.filter((_,i) => i % 8 === 0).forEach(d => {
                const day = new Date(d.dt * 1000).toLocaleDateString('en', {weekday:'short'});
                fList.innerHTML += `
                    <div class="f-row">
                        <span>${day}</span>
                        <img src="https://openweathermap.org/img/wn/${d.weather[0].icon}.png">
                        <b>${d.main.temp.toFixed(0)}°</b>
                    </div>`;
            });
        }
    } catch(e) { console.error("Weather unreachable"); }
}

// --- HOME ESSENCE: SYNC FIREBASE ---
onValue(ref(db, "/sensorData"), (snap) => {
    const val = snap.val();
    if(val) {
        const data = Object.values(val).pop();
        if(data) {
            document.getElementById('val-hum').innerText = (data.humidity_aht || 0).toFixed(1) + "%";
            document.getElementById('val-temp').innerText = (data.temperature_aht || 0).toFixed(1) + "°";
            document.getElementById('val-pres').innerText = Math.round(data.pressure_bmp || 0);
            document.getElementById('val-pcb').innerText = (data.temperature_bmp || 0).toFixed(1) + "°";
        }
    }
});

// --- CLOCK & INITIALIZATION ---
setInterval(() => {
    const clock = document.getElementById('live-clock');
    if(clock) clock.innerText = new Date().toLocaleTimeString();
}, 1000);

// Iniciar en la pestaña Essence por defecto
document.addEventListener('DOMContentLoaded', () => {
    // Pequeño delay para asegurar que el DOM está listo
    setTimeout(() => showTab('essence'), 100);
});
