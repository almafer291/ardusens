// ... (Mantener inicialización de Firebase igual) ...

const OPENWEATHER_KEY = "233740e194c45ee901ca539f6773ed0d"; 
const LAT = "36.8340";
const LON = "-2.4637"; 

async function fetchWeather() {
    try {
        const currRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=metric&appid=${OPENWEATHER_KEY}&lang=es`);
        const curr = await currRes.json();
        
        const foreRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&units=metric&appid=${OPENWEATHER_KEY}&lang=es`);
        const fore = await foreRes.json();

        updateCurrentWeather(curr);
        updateForecast(fore.list);
    } catch (e) { console.error(e); }
}

function updateCurrentWeather(data) {
    const { main, wind, weather, sys, clouds, visibility } = data;
    
    // Icono y Temp Principal
    document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${weather[0].icon}@4x.png`;
    document.getElementById("weather-temp").innerText = `${main.temp.toFixed(1)}°C`;
    document.getElementById("weather-description").innerText = weather[0].description.toUpperCase();

    // Detalles Extendidos
    document.getElementById("weather-details").innerHTML = `
        <div class="detail-box"><i class="fas fa-droplet icon-blue"></i><span>${main.humidity}%</span><label>Humedad</label></div>
        <div class="detail-box"><i class="fas fa-wind icon-green"></i><span>${wind.speed}m/s</span><label>Viento</label></div>
        <div class="detail-box"><i class="fas fa-cloud icon-blue"></i><span>${clouds.all}%</span><label>Nubosidad</label></div>
        <div class="detail-box"><i class="fas fa-eye icon-orange"></i><span>${(visibility/1000).toFixed(1)}km</span><label>Visibilidad</label></div>
        <div class="detail-box"><i class="fas fa-compress-arrows-alt icon-red"></i><span>${main.pressure}hPa</span><label>Presión</label></div>
        <div class="detail-box"><i class="fas fa-temperature-high icon-red"></i><span>${main.feels_like.toFixed(1)}°C</span><label>Sensación</label></div>
        <div class="detail-box"><i class="fas fa-water icon-blue"></i><span>${main.sea_level || main.pressure}hPa</span><label>Nivel Mar</label></div>
        <div class="detail-box"><i class="fas fa-bolt icon-orange"></i><span>${wind.gust || wind.speed}m/s</span><label>Ráfagas</label></div>
    `;

    // Amanecer y Atardecer
    const formatTime = (unix) => new Date(unix * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    document.getElementById("sunrise").innerText = formatTime(sys.sunrise);
    document.getElementById("sunset").innerText = formatTime(sys.sunset);
}

// ... (Resto de funciones initSensors, showSection etc igual) ...
