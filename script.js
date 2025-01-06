// Función para mostrar los datos de los sensores
const displayData = () => {
    const sensorDataRef = ref(database, "/sensorData"); // Lee el nodo sensorData
    console.log("Esperando datos de Firebase...");  // Log para asegurarse de que se está escuchando
    onValue(sensorDataRef, (snapshot) => {
        const data = snapshot.val();
        console.log("Datos recibidos de Firebase:", data);  // Verifica los datos recibidos

        // Asegurarse de que los datos no sean null o undefined
        if (data) {
            // Asegúrate de que el formato de los datos sea correcto
            Object.values(data).forEach(sensor => {
                console.log("Datos de un sensor:", sensor);  // Log para verificar qué datos se reciben de cada sensor

                // Asegurarse de que las propiedades existan en los datos y estén correctamente nombradas
                const humidity = sensor.hum_aht20 ? sensor.hum_aht20.toFixed(2) : "No disponible";
                const temperatureAHT = sensor.temp_aht20 ? sensor.temp_aht20.toFixed(2) : "No disponible";
                const pressure = sensor.pressure ? sensor.pressure.toFixed(2) : "No disponible";
                const temperatureBMP = sensor.temp_bmp280 ? sensor.temp_bmp280.toFixed(2) : "No disponible";

                // Verificación en consola para asegurarse de que estamos mostrando los valores correctos
                console.log("Actualizando el DOM con estos valores: ");
                console.log("Humedad:", humidity, "Temperatura AHT:", temperatureAHT, "Presión BMP:", pressure, "Temperatura BMP:", temperatureBMP);

                // Actualizar el contenido en el HTML
                document.getElementById("humidity").innerText = `Humedad (AHT20): ${humidity}%`;
                document.getElementById("tempAHT").innerText = `Temperatura (AHT20): ${temperatureAHT}°C`;
                document.getElementById("pressure").innerText = `Presión (BMP280): ${pressure} hPa`;
                document.getElementById("tempBMP").innerText = `Temperatura (BMP280): ${temperatureBMP}°C`;
            });
        } else {
            console.log("No se encontraron datos en Firebase.");
            // Actualizar el DOM para mostrar un mensaje si no hay datos
            document.getElementById("humidity").innerText = "Humedad (AHT20): No disponible";
            document.getElementById("tempAHT").innerText = "Temperatura (AHT20): No disponible";
            document.getElementById("pressure").innerText = "Presión (BMP280): No disponible";
            document.getElementById("tempBMP").innerText = "Temperatura (BMP280): No disponible";
        }
    }, (error) => {
        console.error("Error al leer los datos de Firebase:", error);
        alert("Hubo un error al intentar obtener los datos.");
    });
};
