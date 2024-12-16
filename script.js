// Configuración de Firebase
const firebaseConfig = {
apiKey: "AIzaSyBJT5ckT_Os1eTxPvVn9kjFi3pXXEUeIe8",
  authDomain: "ardusens.firebaseapp.com",
  databaseURL: "https://ardusens-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ardusens",
  storageBucket: "ardusens.appspot.com",
  messagingSenderId: "932230234372",
  appId: "1:932230234372:web:f68c12d2913155e30a9051",
  measurementId: "G-JBXRDGDTY7",
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Inicializar los gráficos
const ctxTemp = document.getElementById('temperatureChart').getContext('2d');
const ctxHumidity = document.getElementById('humidityChart').getContext('2d');

const temperatureChart = new Chart(ctxTemp, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Temperatura AHT20',
      data: [],
      borderColor: '#e74c3c',
      borderWidth: 2,
      tension: 0.1,
    }]
  },
  options: {
    responsive: true,
    scales: {
      x: { title: { display: true, text: 'Hora' } },
      y: { beginAtZero: true, title: { display: true, text: 'Temperatura (°C)' } },
    }
  }
});

const humidityChart = new Chart(ctxHumidity, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Humedad AHT20',
      data: [],
      borderColor: '#3498db',
      borderWidth: 2,
      tension: 0.1,
    }]
  },
  options: {
    responsive: true,
    scales: {
      x: { title: { display: true, text: 'Hora' } },
      y: { beginAtZero: true, title: { display: true, text: 'Humedad (%)' } },
    }
  }
});

// Función para actualizar los gráficos
function updateCharts(data) {
  const timeLabel = new Date().toLocaleTimeString(); // Hora actual como etiqueta

  // Actualizar datos de temperatura
  temperatureChart.data.labels.push(timeLabel);
  temperatureChart.data.datasets[0].data.push(data.temperature_aht);
  temperatureChart.update();

  // Actualizar datos de humedad
  humidityChart.data.labels.push(timeLabel);
  humidityChart.data.datasets[0].data.push(data.humidity_aht);
  humidityChart.update();
}

// Conexión a Firebase
const database = firebase.database();
const sensorRef = database.ref('sensorData');

sensorRef.on('value', (snapshot) => {
  const data = snapshot.val();
  if (data) {
    // Obtener el último conjunto de datos
    const latestData = data[Object.keys(data)[Object.keys(data).length - 1]];

    // Actualizar datos en la página
    document.getElementById('humidity').textContent = latestData.humidity_aht.toFixed(2) + ' %';
    document.getElementById('temp_aht').textContent = latestData.temperature_aht.toFixed(2) + ' °C';
    document.getElementById('pressure').textContent = latestData.pressure_bmp.toFixed(2) + ' hPa';
    document.getElementById('temp_bmp').textContent = latestData.temperature_bmp.toFixed(2) + ' °C';

    // Actualizar los gráficos
    updateCharts(latestData);
  }
});
