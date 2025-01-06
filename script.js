// Función para mostrar datos de los sensores
const displayData = () => {
  const sensorDataRef = ref(database, "/sensorData"); // Lee el nodo sensorData
  onValue(sensorDataRef, (snapshot) => {
    const data = snapshot.val();
    console.log("Datos recibidos de Firebase:", data);

    if (data) {
      // Iterar sobre los nodos de sensores
      Object.keys(data).forEach(sensorKey => {
        const sensor = data[sensorKey]; // Datos de cada sensor

        // Usamos valores predeterminados si las propiedades no existen
        const humidity = sensor.humidity_aht ? sensor.humidity_aht.toFixed(2) : "No disponible";
        const temperatureAHT = sensor.temperature_aht ? sensor.temperature_aht.toFixed(2) : "No disponible";
        const pressure = sensor.pressure_bmp ? sensor.pressure_bmp.toFixed(2) : "No disponible";
        const temperatureBMP = sensor.temperature_bmp ? sensor.temperature_bmp.toFixed(2) : "No disponible";

        // Actualizamos los elementos del DOM con los datos
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
    // Ocultar todas las secciones
    document.getElementById("sensores-display").style.display = "none";
    document.getElementById("reles-control").style.display = "none";

    // Mostrar la sección correspondiente
    if (section === "sensores") {
        document.getElementById("sensores-display").style.display = "block";
        displayData(); // Llamar a la función que muestra los datos de los sensores
    } else if (section === "reles") {
        document.getElementById("reles-control").style.display = "block";
    }
};

// Asignar evento a los botones
document.getElementById("btn-sensores").addEventListener("click", () => showSection("sensores"));
document.getElementById("btn-reles").addEventListener("click", () => showSection("reles"));
