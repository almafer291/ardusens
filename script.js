import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

// Firebase Configuración
const firebaseConfig = {
    apiKey: "API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Función para inicializar gráficas
const initCharts = () => {
    const tempCtx = document.getElementById('temp-chart').getContext('2d');
    const humidityCtx = document.getElementById('humidity-chart').getContext('2d');

    const tempChart = new Chart(tempCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Temperatura (°C)',
                data: [],
                borderColor: '#00baba',
                tension: 0.3,
                fill: false
            }]
        }
    });

    const humidityChart = new Chart(humidityCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Humedad (%)',
                data: [],
                borderColor: '#007f7f',
                tension: 0.3,
                fill: false
            }]
        }
    });

    const sensorRef = ref(database, '/sensorData');
    onValue(sensorRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const labels = Object.keys(data);
            const temps = labels.map(key => data[key].temperature_aht);
            const hums = labels.map(key => data[key].humidity_aht);

            tempChart.data.labels = labels;
            tempChart.data.datasets[0].data = temps;
            tempChart.update();

            humidityChart.data.labels = labels;
            humidityChart.data.datasets[0].data = hums;
            humidityChart.update();
        }
    });
};

// Mostrar secciones
const showSection = (section) => {
    document.querySelectorAll('.content-display').forEach(el => el.style.display = 'none');
    document.getElementById(`${section}-display`).style.display = 'block';

    if (section === 'graficas') initCharts();
};

document.getElementById('btn-sensores').addEventListener('click', () => showSection('sensores'));
document.getElementById('btn-reles').addEventListener('click', () => showSection('reles'));
document.getElementById('btn-graficas').addEventListener('click', () => showSection('graficas'));
document.getElementById('btn-tablas').addEventListener('click', () => showSection('tablas'));
