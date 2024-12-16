// Inicializar las gráficas
const ctxTemp = document.getElementById('temperatureChart').getContext('2d');
const ctxHumidity = document.getElementById('humidityChart').getContext('2d');

// Crear las gráficas
const temperatureChart = new Chart(ctxTemp, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Temperatura AHT20',
      data: [],
      borderColor: '#e74c3c',
      borderWidth: 1,
      fill: false,
    }]
  },
  options: {
    responsive: true,
    scales: {
      x: { type: 'linear', position: 'bottom' },
      y: { beginAtZero: true }
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
      borderWidth: 1,
      fill: false,
    }]
  },
  options: {
    responsive: true,
    scales: {
      x: { type: 'linear', position: 'bottom' },
      y: { beginAtZero: true }
    }
  }
});

// Función para actualizar las gráficas con los datos de Firebase
function updateCharts(data) {
  temperatureChart.data.labels.push(Date.now()); // Usamos la hora actual como etiqueta
  temperatureChart.data.datasets[0].data.push(data.temperature_aht);
  temperatureChart.update();

  humidityChart.data.labels.push(Date.now());
  humidityChart.data.datasets[0].data.push(data.humidity_aht);
  humidityChart.update();
}

// Conexión a Firebase y actualización de los datos
const database = firebase.database();
const sensorRef = database.ref('sensorData');

sensorRef.on('value', (snapshot) => {
  const data = snapshot.val();
  if (data) {
    const latestData = data[Object.keys(data)[Object.keys(data).length - 1]];
    document.getElementById('humidity').textContent = latestData.humidity_aht.toFixed(2);
    document.getElementById('temp_aht').textContent = latestData.temperature_aht.toFixed(2);
    document.getElementById('pressure').textContent = latestData.pressure_bmp.toFixed(2);
    document.getElementById('temp_bmp').textContent = latestData.temperature_bmp.toFixed(2);

    // Actualizar las gráficas
    updateCharts(latestData);
  }
});
