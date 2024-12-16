const displayData = () => {
  const sensorDataRef = ref(database, "/"); // Lee toda la raíz de la base de datos
  onValue(sensorDataRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      // Verifica que los valores existan antes de intentar usarlos
      const humidity = data.humidity_aht;
      const temperatureAHT = data.temperature_aht;
      const pressure = data.pressure_bmp;
      const temperatureBMP = data.temperature_bmp;

      // Solo realiza .toFixed() si los datos no son undefined
      if (humidity !== undefined) {
        document.getElementById("humidity").innerText = `Humedad (AHT20): ${humidity.toFixed(2)}%`;
      } else {
        document.getElementById("humidity").innerText = "Humedad no disponible";
      }

      if (temperatureAHT !== undefined) {
        document.getElementById("tempAHT").innerText = `Temperatura (AHT20): ${temperatureAHT.toFixed(2)}°C`;
      } else {
        document.getElementById("tempAHT").innerText = "Temperatura no disponible";
      }

      if (pressure !== undefined) {
        document.getElementById("pressure").innerText = `Presión (BMP280): ${pressure.toFixed(2)} hPa`;
      } else {
        document.getElementById("pressure").innerText = "Presión no disponible";
      }

      if (temperatureBMP !== undefined) {
        document.getElementById("tempBMP").innerText = `Temperatura (BMP280): ${temperatureBMP.toFixed(2)}°C`;
      } else {
        document.getElementById("tempBMP").innerText = "Temperatura no disponible";
      }
    }
  });
};
