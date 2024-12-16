// Importar configuración de Firebase
import { database, ref, onValue } from './firebase-config.js';

// Referencias a los nodos de la base de datos
const tempAHTRef = ref(database, 'temperature_aht');
const humAHTRef = ref(database, 'humidity_aht');
const tempBMPRef = ref(database, 'temperature_bmp');
const pressureBMPRef = ref(database, 'pressure_bmp');

// Función para actualizar los datos en la página
const updateElement = (id, value) => {
  document.getElementById(id).textContent = value.toFixed(2);
};

// Leer datos de temperatura (AHT20)
onValue(tempAHTRef, (snapshot) => {
  const tempAHT = snapshot.val();
  updateElement('tempAHT', tempAHT);
});

// Leer datos de humedad (AHT20)
onValue(humAHTRef, (snapshot) => {
  const humAHT = snapshot.val();
  updateElement('humAHT', humAHT);
});

// Leer datos de temperatura (BMP280)
onValue(tempBMPRef, (snapshot) => {
  const tempBMP = snapshot.val();
  updateElement('tempBMP', tempBMP);
});

// Leer datos de presión (BMP280)
onValue(pressureBMPRef, (snapshot) => {
  const pressureBMP = snapshot.val();
  updateElement('pressureBMP', pressureBMP);
});
