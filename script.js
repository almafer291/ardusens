import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBJT5ckT_Os1eTxPvVn9kjFi3pXXEUeIe8",
    authDomain: "ardusens.firebaseapp.com",
    databaseURL: "https://ardusens-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "ardusens"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
let luzChart = null;

// NAVEGACIÓN
window.switchTab = (id) => {
    document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`tab-${id}`).style.display = 'block';
    
    if(id === 'energia') updateLuz();
    if(id === 'reles') createRelayButtons();
};

// --- PRECIO DE LA LUZ (API ESTABLE) ---
async function updateLuz() {
    try {
        // Esta API es mucho más abierta y no suele dar errores de CORS
        const response = await fetch('https://api.preciodelaluz.org/v1/prices/all?zone=PCB');
        const data = await response.json();
        
        const hours = Object.values(data);
        const prices = hours.map(h => h.price);
        const labels = hours.map(h => h.hour + 'h');
        const now = new Date().getHours();

        // Actualizar tarjetas
        document.getElementById('p-now').innerText = hours[now].price.toFixed(2) + " €";
        document.getElementById('p-min').innerText = Math.min(...prices).toFixed(2) + " €";
        document.getElementById('p-max').innerText = Math.max(...prices).toFixed(2) + " €";

        // Graficar
        const ctx = document.getElementById('luzChart').getContext('2d');
        if(luzChart) luzChart.destroy();
        
        luzChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Precio €/MWh',
                    data: prices,
                    backgroundColor: prices.map((_, i) => i === now ? '#38bdf8' : 'rgba(255,255,255,0.1)'),
                    borderRadius: 5
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    } catch (error) {
        console.error("Error cargando luz:", error);
        document.getElementById('p-now').innerText = "Error API";
    }
}

// --- ACTUADORES (BOTONES) ---
function createRelayButtons() {
    const container = document.getElementById('reles-container');
    container.innerHTML = ""; // Limpiar
    for(let i=1; i<=8; i++) {
        const btn = document.createElement('div');
        btn.className = 'relay-card';
        btn.innerHTML = `
            <i class="fas fa-power-off"></i>
            <p>Relé ${i}</p>
            <button onclick="this.classList.toggle('active')">OFF</button>
        `;
        container.appendChild(btn);
    }
}

// --- DATOS FIREBASE ---
onValue(ref(db, "/sensorData"), (snap) => {
    const data = Object.values(snap.val() || {}).pop();
    if(data) {
        document.getElementById('h-val').innerText = data.humidity_aht.toFixed(1) + "%";
        document.getElementById('t-val').innerText = data.temperature_aht.toFixed(1) + "°C";
    }
});
