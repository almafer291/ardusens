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

// Función para mostrar datos de los sensores
const displayData = () => {
  const sensorDataRef = ref(database, "/sensorData");
  onValue(sensorDataRef, (snapshot) => {
    const data = snapshot.val();
    console.log("Datos recibidos de Firebase:", data);

    // Validación de que los datos están disponibles y completos
    if (data && Object.keys(data).length > 0) {
      const sensor = data[Object.keys(data)[0]]; // Obtener el primer set de datos
      const humidity = sensor.humidity_aht ? sensor.humidity_aht.toFixed(2) : "No disponible";
      const temperatureAHT = sensor.temperature_aht ? sensor.temperature_aht.toFixed(2) : "No disponible";
      const pressure = sensor.pressure_bmp ? sensor.pressure_bmp.toFixed(2) : "No disponible";
      const temperatureBMP = sensor.temperature_bmp ? sensor.temperature_bmp.toFixed(2) : "No disponible";

      // Actualización de los elementos HTML con los datos
      document.getElementById("humidity").innerText = `Humedad (AHT20): ${humidity}%`;
      document.getElementById("tempAHT").innerText = `Temperatura (AHT20): ${temperatureAHT}°C`;
      document.getElementById("pressure").innerText = `Presión (BMP280): ${pressure} hPa`;
      document.getElementById("tempBMP").innerText = `Temperatura (BMP280): ${temperatureBMP}°C`;

      // Actualizar los datos en la tabla
      const table = document.getElementById("sensorTable").getElementsByTagName("tbody")[0];
      table.innerHTML = `<tr>
        <td>${temperatureAHT}</td>
        <td>${humidity}</td>
        <td>${pressure}</td>
      </tr>`;

      // Actualizar gráficos
      updateCharts(temperatureAHT, humidity, pressure);
      document.getElementById("error-message").style.display = "none"; // Ocultar mensaje de error

    } else {
      // Si los datos no están disponibles, mostrar mensaje de error
      document.getElementById("error-message").style.display = "block";
    }
  }, (error) => {
    // Manejo de errores en la lectura de Firebase
    console.error("Error al leer los datos de Firebase:", error);
    document.getElementById("error-message").style.display = "block";
  });
};

// Función para actualizar gráficos
const updateCharts = (temperatureAHT, humidity, pressure) => {
  const tempChart = new Chart(document.getElementById('tempChart').getContext('2d'), {
    type: 'line',
    data: {
      labels: ['Temperatura'],
      datasets: [{
        label: 'Temperatura AHT20 (°C)',
        data: [temperatureAHT],
        borderColor: '#1abc9c',
        fill: false,
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { 
          beginAtZero: true,
        },
        y: {
          beginAtZero: true,
        },
      },
    }
  });

  const humChart = new Chart(document.getElementById('humChart').getContext('2d'), {
    type: 'line',
    data: {
      labels: ['Humedad'],
      datasets: [{
        label: 'Humedad AHT20 (%)',
        data: [humidity],
        borderColor: '#3498db',
        fill: false,
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { 
          beginAtZero: true,
        },
        y: {
          beginAtZero: true,
        },
      },
    }
  });

  const pressureChart = new Chart(document.getElementById('pressureChart').getContext('2d'), {
    type: 'line',
    data: {
      labels: ['Presión'],
      datasets: [{
        label: 'Presión BMP280 (hPa)',
        data: [pressure],
        borderColor: '#e74c3c',
        fill: false,
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { 
          beginAtZero: true,
        },
        y: {
          beginAtZero: true,
        },
      },
    }
  });
};

// Función para mostrar las secciones
const showSection = (section) => {
  document.getElementById("sensores-display").style.display = "none";
  document.getElementById("reles-control").style.display = "none";
  document.getElementById("graficas-display").style.display = "none";
  document.getElementById("tablas-display").style.display = "none";
  document.getElementById("error-message").style.display = "none"; // Ocultar mensaje de error

  if (section === "sensores") {
    document.getElementById("sensores-display").style.display = "block";
    displayData(); // Llamar para mostrar los datos
  } else if (section === "reles") {
    document.getElementById("reles-control").style.display = "block";
  } else if (section === "graficas") {
    document.getElementById("graficas-display").style.display = "block";
  } else if (section === "tablas") {
    document.getElementById("tablas-display").style.display = "block";
  }
};

// Asignar eventos a los botones
document.getElementById("btn-sensores").addEventListener("click", () => showSection("sensores"));
document.getElementById("btn-reles").addEventListener("click", () => showSection("reles"));
document.getElementById("btn-graficas").addEventListener("click", () => showSection("graficas"));
document.getElementById("btn-tablas").addEventListener("click", () => showSection("tablas"));
