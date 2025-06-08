// Inicializar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBJT5ckT_Os1eTxPvVn9kjFi3pXXEUeIe8",
  authDomain: "ardusens.firebaseapp.com",
  databaseURL: "https://ardusens-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "ardusens",
  storageBucket: "ardusens.appspot.com",
  messagingSenderId: "932230234372",
  appId: "1:932230234372:web:f68c12d2913155e30a9051",
  measurementId: "G-JBXRDGDTY7"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Mostrar datos de sensores
const displayData = () => {
  const sensorDataRef = ref(database, "/sensorData");
  onValue(sensorDataRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      Object.values(data).forEach(sensor => {
        document.getElementById("humidity").innerText = `Humedad (AHT20): ${sensor.humidity_aht?.toFixed(2) ?? "No disponible"}%`;
        document.getElementById("tempAHT").innerText = `Temperatura (AHT20): ${sensor.temperature_aht?.toFixed(2) ?? "No disponible"}°C`;
        document.getElementById("pressure").innerText = `Presión (BMP280): ${sensor.pressure_bmp?.toFixed(2) ?? "No disponible"} hPa`;
        document.getElementById("tempBMP").innerText = `Temperatura (BMP280): ${sensor.temperature_bmp?.toFixed(2) ?? "No disponible"}°C`;
      });
    }
  });
};

// Mostrar datos meteorológicos típicos de WeatherAPI
const displayWeather = () => {
  const weatherRef = ref(database, "/weatherData");
  onValue(weatherRef, (snapshot) => {
    const w = snapshot.val();
    if (!w) return;

    document.getElementById("weather-icon").src = w.icon?.startsWith("http") ? w.icon : `https:${w.icon}`;
    document.getElementById("weather-description").innerText = `Condición: ${w.condition ?? "No disponible"}`;
    document.getElementById("weather-temp").innerText = `Temperatura: ${w.temp_c ?? "--"}°C`;
    document.getElementById("weather-feels").innerText = `Sensación térmica: ${w.feelslike_c ?? "--"}°C`;
    document.getElementById("weather-humidity").innerText = `Humedad: ${w.humidity ?? "--"}%`;
    document.getElementById("weather-pressure").innerText = `Presión: ${w.pressure_mb ?? "--"} hPa`;
    document.getElementById("weather-visibility").innerText = `Visibilidad: ${w.vis_km ?? "--"} km`;
    document.getElementById("weather-uv").innerText = `Índice UV: ${w.uv ?? "--"}`;
    document.getElementById("weather-wind").innerText = `Viento: ${w.wind_kph ?? "--"} km/h (${w.wind_dir ?? "--"})`;
    document.getElementById("weather-rain").innerText = `Prob. de lluvia: ${w.chance_of_rain ?? "--"}%`;
    document.getElementById("weather-sunrise").innerText = `Amanecer: ${w.sunrise ?? "--"}`;
    document.getElementById("weather-sunset").innerText = `Atardecer: ${w.sunset ?? "--"}`;
  });
};

// Mostrar controles de relés
const displayRelays = () => {
  const relaysContainer = document.getElementById("reles-status");
  relaysContainer.innerHTML = "";
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
    relayButton.addEventListener("click", () => {
      statusCircle.style.backgroundColor = statusCircle.style.backgroundColor === "red" ? "green" : "red";
    });
    relayDiv.appendChild(relayButton);
    relaysContainer.appendChild(relayDiv);
  }
};

// Mostrar secciones
const showSection = (section) => {
  ["sensores-display", "reles-control", "clima-display"].forEach(id => {
    document.getElementById(id).style.display = "none";
  });
  if (section === "sensores") {
    document.getElementById("sensores-display").style.display = "block";
    displayData();
  } else if (section === "reles") {
    document.getElementById("reles-control").style.display = "block";
  } else if (section === "clima") {
    document.getElementById("clima-display").style.display = "block";
    displayWeather();
  }
};

document.getElementById("btn-sensores").addEventListener("click", () => showSection("sensores"));
document.getElementById("btn-reles").addEventListener("click", () => showSection("reles"));
document.getElementById("btn-clima").addEventListener("click", () => showSection("clima"));

displayRelays();
