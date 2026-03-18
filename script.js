import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

// Tu configuración de Firebase...
const firebaseConfig = { /* ... tu config ... */ };
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

let energyChart = null;

// --- FUNCIÓN PRINCIPAL DE ENERGÍA ---
async function fetchEnergy() {
    try {
        const today = new Date().toISOString().split('T')[0];
        // API de Red Eléctrica
        const response = await fetch(`https://api.esios.ree.es/archives/70/download_json?locale=es&date=${today}`);
        const data = await response.json();

        if (data && data.PVPC) {
            const prices = data.PVPC.map(item => {
                // Limpieza de datos: convertir "123,45" en 123.45
                const precioNum = parseFloat(item.PCB.replace(',', '.'));
                return {
                    hora: item.Dia.split('T')[1].substring(0, 2) + ':00',
                    valor: precioNum
                };
            });

            updateEnergyUI(prices);
        }
    } catch (error) {
        console.error("Error cargando precios luz:", error);
        document.getElementById("price-now").innerText = "Error API";
    }
}

function updateEnergyUI(prices) {
    const nowHour = new Date().getHours();
    const currentPrice = prices[nowHour].valor;
    const valuesOnly = prices.map(p => p.valor);
    
    // Actualizar textos
    document.getElementById("price-now").innerText = currentPrice.toFixed(2) + " €";
    document.getElementById("price-min").innerText = Math.min(...valuesOnly).toFixed(2) + " €";
    document.getElementById("price-max").innerText = Math.max(...valuesOnly).toFixed(2) + " €";

    // Gráfica de Barras
    const ctx = document.getElementById('energyChart').getContext('2d');
    
    if (energyChart) {
        energyChart.destroy(); // Destruir gráfica previa para evitar fallos visuales
    }

    energyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: prices.map(p => p.hora),
            datasets: [{
                label: 'Precio €/MWh',
                data: valuesOnly,
                backgroundColor: prices.map((_, i) => i === nowHour ? '#0ea5e9' : 'rgba(255, 255, 255, 0.1)'),
                borderColor: prices.map((_, i) => i === nowHour ? '#fff' : 'transparent'),
                borderWidth: 1,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#94a3b8' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8', maxRotation: 0 }
                }
            }
        }
    });
}

// --- NAVEGACIÓN CORREGIDA ---
function showSection(id) {
    const sections = ['sensores-display', 'reles-control', 'clima-display', 'energia-display'];
    sections.forEach(s => {
        const el = document.getElementById(s);
        if(el) el.style.display = 'none';
    });

    const target = document.getElementById(`${id}-display`);
    if(target) target.style.display = 'block';

    // Cargar datos según sección
    if(id === 'energia') fetchEnergy();
    // ... resto de lógica
}

document.getElementById("btn-energia").onclick = () => showSection('energia');
