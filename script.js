// Inicializar Firebase
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
  const sensorDataRef = ref(database, "/sensorData"); // Lee el nodo sensorData
  onValue(sensorDataRef, (snapshot) => {
    const data = snapshot.val();
    console.log("Datos recibidos de Firebase:", data);

    if (data) {
      const sensors = Object.values(data);
      sensors.forEach(sensor => {
        const humidity = sensor.humidity_aht ? sensor.humidity_aht.toFixed(2) : "No disponible";
        const temperatureAHT = sensor.temperature_aht ? sensor.temperature_aht.toFixed(2) : "No disponible";
        const pressure = sensor.pressure_bmp ? sensor.pressure_bmp.toFixed(2) : "No disponible";
        const temperatureBMP = sensor.temperature_bmp ? sensor.temperature_bmp.toFixed(2) : "No disponible";
        
        // Calcular punto de rocío
        const dewPoint = sensor.temperature_aht && sensor.humidity_aht
          ? (sensor.temperature_aht - (100 - sensor.humidity_aht) / 5).toFixed(2)
          : "No disponible";

        // Mostrar los datos en la interfaz
        document.getElementById("humidity").innerText = `Humedad (AHT20): ${humidity}%`;
        document.getElementById("tempAHT").innerText = `Temperatura (AHT20): ${temperatureAHT}°C`;
        document.getElementById("pressure").innerText = `Presión (BMP280): ${pressure} hPa`;
        document.getElementById("tempBMP").innerText = `Temperatura (BMP280): ${temperatureBMP}°C`;
        document.getElementById("dewPoint").innerText = `Punto de Rocío: ${dewPoint}°C`;

        // Actualizar gráficas
        updateCharts(sensor);
      });
    } else {
      console.log("No se encontraron datos en Firebase.");
    }
  });
};

// Función para actualizar las gráficas
const updateCharts = (sensor) => {
  const humidityData = sensor.humidity_aht;
  const temperatureData = sensor.temperature_aht;
  const pressureData = sensor.pressure_bmp;
  const dewPointData = (sensor.temperature_aht - (100 - sensor.humidity_aht) / 5).toFixed(2);

  const humidityChart = new Chart(document.getElementById("humidityChart"), {
    type: 'line',
    data: {
      labels: ['Última medición'],
      datasets: [{
        label: 'Humedad',
        data: [humidityData],
        borderColor: '#00baba',
        fill: false
      }]
    }
  });

  const temperatureChart = new Chart(document.getElementById("temperatureChart"), {
    type: 'line',
    data: {
      labels: ['Última medición'],
      datasets: [{
        label: 'Temperatura AHT20',
        data: [temperatureData],
        borderColor: '#007f7f',
        fill: false
      }]
    }
  });

  const pressureChart = new Chart(document.getElementById("pressureChart"), {
    type: 'line',
    data: {
      labels: ['Última medición'],
      datasets: [{
        label: 'Presión',
        data: [pressureData],
        borderColor: '#f39c12',
        fill: false
      }]
    }
  });

  const dewPointChart = new Chart(document.getElementById("dewPointChart"), {
    type: 'line',
    data: {
      labels: ['Última medición'],
      datasets: [{
        label: 'Punto de Rocío',
        data: [dewPointData],
        borderColor: '#9b59b6',
        fill: false
      }]
    }
  });
};

// Función para cambiar de sección al presionar los botones
const showSection = (section) => {
    // Ocultar todas las secciones
    document.getElementById("sensores-display").style.display = "none";
    document.getElementById("reles-control").style.display = "none";
    document.getElementById("graficas-display").style.display = "none";

    // Mostrar la sección correspondiente
    if (section === "sensores") {
        document.getElementById("sensores-display").style.display = "block";
        displayData(); // Llamar a la función que muestra los datos de los sensores
    } else if (section === "reles") {
        document.getElementById("reles-control").style.display = "block";
    } else if (section === "graficas") {
        document.getElementById("graficas-display").style.display = "block";
    }
};

// Asignar evento a los botones
document.getElementById("btn-sensores").addEventListener("click", () => showSection("sensores"));
document.getElementById("btn-reles").addEventListener("click", () => showSection("reles"));
document.getElementById("btn-graficas").addEventListener("click", () => showSection("graficas"));

// Función para encender/apagar los relés
const toggleRelay = (relayNumber) => {
    const statusCircle = document.getElementById(`rele-status-${relayNumber}`);
    if (statusCircle.style.backgroundColor === "red") {
        statusCircle.style.backgroundColor = "green"; // Encendido
    } else {
        statusCircle.style.backgroundColor = "red"; // Apagado
    }
};

// Función para agregar los controles de relés
const displayRelays = () => {
    const relaysContainer = document.getElementById("reles-status");
    for (let i = 1; i <= 6; i++) {
        const relayDiv = document.createElement("div");
        relayDiv.classList.add("rele-control");

        const relayStatus = document.createElement("div");
        relayStatus.id = `rele-status-${i}`;
        relayStatus.classList.add("rele-status");

        const relayBtn = document.createElement("button");
        relayBtn.classList.add("rele-btn");
        relayBtn.innerText = `Relé ${i}`;
        relayBtn.addEventListener("click", () => toggleRelay(i));

        relayDiv.appendChild(relayStatus);
        relayDiv.appendChild(relayBtn);
        relaysContainer.appendChild(relayDiv);
    }
};

displayRelays();
