import { database, ref, query, limitToLast, onValue } from "./firebase-config.js";

// Referencia al nodo raíz donde están los datos
const sensoresRef = ref(database, "/");

// Consulta para obtener el último dato añadido
const lastDataQuery = query(sensoresRef, limitToLast(1));

// Leer el dato más reciente
onValue(lastDataQuery, (snapshot) => {
    snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        // Actualizar los datos en el HTML
        document.getElementById("temperature_aht").textContent = data.temperature_aht.toFixed(2) + " °C";
        document.getElementById("humidity_aht").textContent = data.humidity_aht.toFixed(2) + " %";
        document.getElementById("temperature_bmp").textContent = data.temperature_bmp.toFixed(2) + " °C";
        document.getElementById("pressure_bmp").textContent = data.pressure_bmp.toFixed(2) + " hPa";
    });
});
