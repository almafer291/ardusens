function getData() {
    fetch('/api/getData')
        .then(response => response.json())
        .then(data => {
            document.getElementById('result').innerHTML = `
                <p>Temperatura: ${data.temperature} °C</p>
                <p>Humedad: ${data.humidity} %</p>
            `;
        })
        .catch(error => {
            document.getElementById('result').innerHTML = 'Error obteniendo datos';
        });
}
