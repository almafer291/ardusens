// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBJT5ckT_Os1eTxPvVn9kjFi3pXXEUeIe8",
  authDomain: "ardusens.firebaseapp.com",
  databaseURL: "https://ardusens-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ardusens",
  storageBucket: "ardusens.appspot.com",
  messagingSenderId: "932230234372",
  appId: "1:932230234372:web:f68c12d2913155e30a9051",
  measurementId: "G-JBXRDGDTY7"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Configuración de las gráficas usando Chart.js
const ctxTemp = document.getElementById('tempChart').getContext('2d');
const ctxHumidity = document.getElementById('humidityChart').getContext('2d');

// Gráfica de Temperatura
const tempChart = new Chart(ctxTemp, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Temperatura AHT20 (°C)',
      data: [],
      borderColor: '#1ca3ec',
      backgroundColor: 'rgba(28, 163, 236, 0.2)',
      borderWidth: 2,
      fill: true,
    }]
  },
  options: { responsive: true, scales: { y: { beginAtZero: false } } }
});

// Gráfica de Humedad
const humidityChart = new Chart(ctxHumidity, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Humedad AHT20 (%)',
      data: [],
      borderColor: '#34dbeb',
      backgroundColor: 'rgba(52, 219, 235, 0.2)',
      borderWidth: 2,
      fill: true,
    }]
  },
  options: { responsive: true, scales: { y: { beginAtZero: false } } }
});

// Función para actualizar los datos en la página y gráficas
const updateData = () => {
  const sensorRef = ref(database, "/sensorData");

  onValue(sensorRef, (snapshot) => {
    const data = snapshot.val();
    console.log("Datos de Firebase:", data);

    if (data) {
      const latestEntry = Object.values(data).pop();

      // Mostrar en la página
      document.getElementById("humidity").innerText = `Humedad (AHT20): ${latestEntry.humidity_aht.toFixed(2)}%`;
      document.getElementById("tempAHT").innerText = `Temperatura (AHT20): ${latestEntry.temperature_aht.toFixed(2)}°C`;
      document.getElementById("pressure").innerText = `Presión (BMP280): ${latestEntry.pressure_bmp.toFixed(2)} hPa`;
      document.getElementById("tempBMP").innerText = `Temperatura (BMP280): ${latestEntry.temperature_bmp.toFixed(2)}°C`;

      // Actualizar gráficas
      const time = new Date().toLocaleTimeString();
      tempChart.data.labels.push(time);
      tempChart.data.datasets[0].data.push(latestEntry.temperature_aht);

      humidityChart.data.labels.push(time);
      humidityChart.data.datasets[0].data.push(latestEntry.humidity_aht);

      tempChart.update();
      humidityChart.update();
    }
  });
};

// Llamar la función
updateData();
