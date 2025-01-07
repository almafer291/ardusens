// Inicializar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, remove } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCYzmW5Ur4fUxCdVxOD2lTzlsVgOIjhZZ8",
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

// Función para eliminar los datos
const deleteData = () => {
  const sensorDataRef = ref(database, "/sensorData");
  remove(sensorDataRef)
    .then(() => {
      console.log("Datos eliminados con éxito.");
    })
    .catch((error) => {
      console.log("Error al eliminar los datos: ", error);
    });
};

// Función para mostrar una confirmación antes de eliminar los datos
const confirmDeleteData = () => {
  if (confirm("¿Estás seguro de que deseas eliminar los datos de los sensores?")) {
    deleteData(); // Llamar a la función para eliminar los datos
  }
};

// Eliminar datos manualmente al hacer clic en el botón
document.getElementById("btn-delete-data").addEventListener("click", confirmDeleteData);

// Función para configurar la eliminación automática cada 3 días
const autoDeleteData = () => {
  // Ejecutar la función deleteData al iniciar la página
  deleteData();

  // Configurar un temporizador para ejecutar la eliminación cada 3 días (259200000 ms)
  setInterval(deleteData, 259200000); // 259200000 ms = 3 días
};

// Llamar a autoDeleteData al cargar la página
window.onload = autoDeleteData;
