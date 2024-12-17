// Estado de los relés (1 a 8)
const relayState = Array(8).fill(false);

// Función para encender/apagar un relé
function toggleRelay(relayNumber) {
    relayState[relayNumber - 1] = !relayState[relayNumber - 1];
    logAction(`Relé ${relayNumber} ${(relayState[relayNumber - 1] ? "ENCENDIDO" : "APAGADO")}`);
    // Aquí puedes agregar el código para enviar el estado al servidor o Firebase
}

// Función para establecer temporizador de un relé
function setTimer(relayNumber) {
    const onTime = parseInt(document.getElementById(`onTime${relayNumber}`).value) || 0;
    const offTime = parseInt(document.getElementById(`offTime${relayNumber}`).value) || 0;

    logAction(`Temporizador configurado para Relé ${relayNumber} - Encender: ${onTime}s, Apagar: ${offTime}s`);

    if (onTime > 0) {
        setTimeout(() => {
            relayState[relayNumber - 1] = true;
            logAction(`Relé ${relayNumber} ENCENDIDO automáticamente.`);
        }, onTime * 1000);
    }

    if (offTime > 0) {
        setTimeout(() => {
            relayState[relayNumber - 1] = false;
            logAction(`Relé ${relayNumber} APAGADO automáticamente.`);
        }, offTime * 1000);
    }
}

// Función para registrar acciones en los logs
function logAction(message) {
    const logOutput = document.getElementById("logOutput");
    const timestamp = new Date().toLocaleTimeString();
    logOutput.innerHTML += `<p>[${timestamp}] ${message}</p>`;
    logOutput.scrollTop = logOutput.scrollHeight;
}

// Generar dinámicamente los 8 controles de relés (opcional para mejorar)
document.addEventListener("DOMContentLoaded", () => {
    const relaysContainer = document.querySelector(".relays");

    for (let i = 3; i <= 8; i++) {
        const relayDiv = document.createElement("div");
        relayDiv.className = "relay";
        relayDiv.id = `relay${i}`;
        relayDiv.innerHTML = `
            <h3>Relé ${i}</h3>
            <button onclick="toggleRelay(${i})">Encender/Apagar</button>
            <div class="timers">
                <label>Encender (s): <input type="number" id="onTime${i}" min="0"></label>
                <label>Apagar (s): <input type="number" id="offTime${i}" min="0"></label>
                <button onclick="setTimer(${i})">Temporizar</button>
            </div>
        `;
        relaysContainer.appendChild(relayDiv);
    }
});
