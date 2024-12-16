// Importa Firebase desde la CDN
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

// Leer datos de Firebase en tiempo real
const displayData = () => {
  const sensorDataRef = ref(database, "/"); // Lee toda la raíz de la base de datos
  onValue(sensorDataRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      document.getElementById("humidity").innerText = `Humedad (AHT20): ${data.humidity_aht.toFixed(2)}%`;
      document.getElementById("tempAHT").innerText = `Temperatura (AHT20): ${data.temperature_aht.toFixed(2)}°C`;
      document.getElementById("pressure").innerText = `Presión (BMP280): ${data.pressure_bmp.toFixed(2)} hPa`;
      document.getElementById("tempBMP").innerText = `Temperatura (BMP280): ${data.temperature_bmp.toFixed(2)}°C`;
    }
  });
};

// Llama la función para mostrar los datos
displayData();
