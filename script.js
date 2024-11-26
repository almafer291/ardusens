// Consumir datos de la API de ESP32 expuesta por ngrok
const apiUrl = 'http://1234abcd.ngrok.io';  // Cambia esto por la URL de ngrok

async function getData() {
    const response = await fetch(apiUrl);
    const data = await response.json();
    document.getElementById('temp').innerText = data.temp;
    document.getElementById('humidity').innerText = data.humidity;
}

// Llamar a la función cada 5 segundos
setInterval(getData, 5000);
