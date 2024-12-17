// Inicializar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

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
    console.log("Datos recibidos de Firebase:", data);  // Verificamos si los datos llegan a la consola

    if (data) {
      // Recorremos cada entrada dentro de los datos recibidos
      Object.values(data).forEach(sensor => {
        const humidity = sensor.humidity_aht ? sensor.humidity_aht.toFixed(2) : "No disponible";
        const temperatureAHT = sensor.temperature_aht ? sensor.temperature_aht.toFixed(2) : "No disponible";
        const pressure = sensor.pressure_bmp ? sensor.pressure_bmp.toFixed(2) : "No disponible";
        const temperatureBMP = sensor.temperature_bmp ? sensor.temperature_bmp.toFixed(2) : "No disponible";

        // Actualiza el contenido de la página
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

// Función para mostrar el control de los relés
const displayRelays = () => {
  const relaysContainer = document.getElementById("reles-status");
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

// Función para alternar el estado del relé
const toggleRelay = (relayNumber) => {
  const relayStatusRef = ref(database, `/relays/rele${relayNumber}`);
  onValue(relayStatusRef, (snapshot) => {
    const currentState = snapshot.val() || false;
    update(relayStatusRef, { state: !currentState });

    // Actualizar el estado visual del relé
    const statusCircle = document.getElementById(`rele-status-${relayNumber}`);
    if (!currentState) {
      statusCircle.style.backgroundColor = "green";
    } else {
      statusCircle.style.backgroundColor = "red";
    }
  });
};

// Función para iniciar el temporizador
const startTimer = (relayNumber, timerValue) => {
  const [hours, minutes] = timerValue.split(":").map(Number);
  const totalMilliseconds = (hours * 60 + minutes) * 60 * 1000;

  setTimeout(() => {
    toggleRelay(relayNumber); // Cambia el estado del relé después de que el temporizador termine
  }, totalMilliseconds);
};

// Mostrar datos y relés al cargar la página
displayData();
displayRelays();
