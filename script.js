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

// Función para mostrar datos de sensores
const displayData = () => {
  const sensorDataRef = ref(database, "/sensorData"); // Lee el nodo sensorData
  onValue(sensorDataRef, (snapshot) => {
    const data = snapshot.val();
    console.log("Datos recibidos de Firebase:", data);

    if (data) {
      Object.values(data).forEach(sensor => {
        const humidity = sensor.humidity_aht ? sensor.humidity_aht.toFixed(2) : "No disponible";
        const temperatureAHT = sensor.temperature_aht ? sensor.temperature_aht.toFixed(2) : "No disponible";
        const pressure = sensor.pressure_bmp ? sensor.pressure_bmp.toFixed(2) : "No disponible";
        const temperatureBMP = sensor.temperature_bmp ? sensor.temperature_bmp.toFixed(2) : "No disponible";

        document.getElementById("humidity").innerText = `Humedad (AHT20): ${humidity}%`;
        document.getElementById("tempAHT").innerText = `Temperatura (AHT20): ${temperatureAHT}°C`;
        document.getElementById("pressure").innerText = `Presión (BMP280): ${pressure} hPa`;
        document.getElementById("tempBMP").innerText = `Temperatura (BMP280): ${temperatureBMP}°C`;
      });
    } else {
      console.log("No se encontraron datos en Firebase.");
    }
  });
};

// Función para cambiar de sección al presionar los botones
const showSection = (section) => {
    document.getElementById("reles-control").style.display = "none";
    // Aquí puedes ocultar otras secciones como "sensores", etc.

    if (section === "reles") {
        document.getElementById("reles-control").style.display = "block";
    }
};

// Asignar evento a los botones
document.getElementById("btn-reles").addEventListener("click", () => showSection("reles"));
document.getElementById("btn-sensores").addEventListener("click", () => {
    showSection("sensores");
    displayData();
});

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
  relaysContainer.innerHTML = ""; // Limpiar contenido anterior

  for (let i = 1; i <= 8; i++) {
    const relayDiv = document.createElement("div");
    relayDiv.classList.add("rele-control");

    const statusCircle = document.createElement("div");
    statusCircle.classList.add("rele-status");
    statusCircle.id = `rele-status-${i}`;
    relayDiv.appendChild(statusCircle);

    const relayButton = document.createElement("button");
    relayButton.classList.add("rele-btn");
    relayButton.innerText = `Rele ${i} ON/OFF`;
    relayButton.addEventListener("click", () => toggleRelay(i));

    relayDiv.appendChild(relayButton);
    relaysContainer.appendChild(relayDiv);

    // Crear temporizador para cada relé
    const timerContainer = document.createElement("div");
    timerContainer.classList.add("timer-container");

    const timerInput = document.createElement("input");
    timerInput.type = "number";
    timerInput.classList.add("timer-input");
    timerInput.placeholder = "HH:MM";
    timerInput.id = `timer-input-${i}`;
    timerContainer.appendChild(timerInput);

    const timerButton = document.createElement("button");
    timerButton.classList.add("timer-btn");
    timerButton.innerText = "Iniciar Temporizador";
    timerButton.addEventListener("click", () => startTimer(i, timerInput.value));

    timerContainer.appendChild(timerButton);
    document.getElementById("timers").appendChild(timerContainer);
  }
};

// Función para iniciar temporizador
const startTimer = (relayNumber, time) => {
    console.log(`Iniciando temporizador para el relé ${relayNumber} con ${time} horas`);
    // Aquí agregarías la lógica del temporizador
};

// Inicializar la sección de relés
displayRelays();
