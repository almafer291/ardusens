/* --- HESTIA DASHBOARD LOGIC --- */

document.addEventListener('DOMContentLoaded', () => {
    
    // Iniciar el Reloj
    updateTime();
    setInterval(updateTime, 1000);
    
    // Simular Carga de Datos de Atmosphere
    loadAtmosphereData();
    
});

// --- FUNCIÓN DEL RELOJ ---
function updateTime() {
    const timeElement = document.getElementById('current-time');
    const dateElement = document.getElementById('current-date');
    
    const now = new Date();
    
    // Formato de Hora: "1:17:09 PM"
    timeElement.innerText = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    
    // Formato de Fecha: "Saturday, March 21, 2026"
    dateElement.innerText = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
}

// --- SIMULACIÓN DE DATOS DE CLIMA ---
function loadAtmosphereData() {
    
    // Estos datos simulan la respuesta de una API (como OpenWeatherMap)
    const weatherData = {
        main: {
            temp: 21,
            feels_like: 20,
            humidity: 58,
            pressure: 1014,
            dew_point: 12
        },
        description: "MAYORMENTE NUBLADO",
        wind: { speed: 18 },
        clouds: { all: 45 },
        visibility: 16,
        uv_index: 4,
        sys: {
            sunrise_ts: 1711011120, // Unix Timestamp
            sunset_ts: 1711055280
        },
        hourly: [
            { time: "2 PM", temp: 22, pop: 10, icon: "fa-cloud-sun", width: 85 },
            { time: "3 PM", temp: 23, pop: 10, icon: "fa-cloud-sun", width: 90 },
            { time: "4 PM", temp: 23, pop: 15, icon: "fa-cloud-sun", width: 90 },
            { time: "5 PM", temp: 22, pop: 20, icon: "fa-cloud-sun", width: 85 },
            { time: "6 PM", temp: 21, pop: 20, icon: "fa-cloud", width: 80 },
            { time: "7 PM", temp: 19, pop: 30, icon: "fa-cloud", width: 70 }
        ]
    };
    
    // --- Actualizar el Panel Central ---
    document.getElementById('temp-main-val').innerText = weatherData.main.temp;
    document.getElementById('weather-desc-main').innerText = weatherData.description;
    document.getElementById('feels-like-val').innerText = weatherData.main.feels_like;
    document.getElementById('humidity-val').innerText = weatherData.main.humidity;
    document.getElementById('wind-val').innerText = weatherData.wind.speed;
    document.getElementById('clouds-val').innerText = weatherData.clouds.all;
    document.getElementById('visibility-val').innerText = weatherData.visibility;
    document.getElementById('uv-val').innerText = weatherData.uv_index;
    document.getElementById('dew-point-val').innerText = weatherData.main.dew_point;
    document.getElementById('pressure-val').innerText = weatherData.main.pressure;
    
    // Formatear Timestamp de sol
    document.getElementById('sunrise-val').innerText = formatUnixTimestamp(weatherData.sys.sunrise_ts);
    document.getElementById('sunset-val').innerText = formatUnixTimestamp(weatherData.sys.sunset_ts);
    
    // --- Actualizar Pronóstico por Horas ---
    renderHourlyForecast(weatherData.hourly);
}

// --- FUNCIÓN AUXILIAR: FORMATO DE TIMESTAMP ---
function formatUnixTimestamp(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); // Formato "07:12"
}

// --- FUNCIÓN AUXILIAR: RENDERIZAR PRONÓSTICO ---
function renderHourlyForecast(hourlyData) {
    const listElement = document.getElementById('hourly-forecast-list');
    listElement.innerHTML = ''; // Limpiar lista
    
    hourlyData.forEach(item => {
        const hourItem = document.createElement('div');
        hourItem.className = 'forecast-hour-item';
        
        hourItem.innerHTML = `
            <span class="hour-time">${item.time}</span>
            <i class="fas ${item.icon} hour-icon"></i>
            <div class="hour-temp-bar-container">
                <span class="hour-temp-val">${item.temp}°C</span>
                <div class="hour-temp-bar" style="width: ${item.width}%;"></div>
            </div>
        `;
        
        listElement.appendChild(hourItem);
    });
}
