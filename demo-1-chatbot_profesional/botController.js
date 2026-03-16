const { saveLead } = require('./dbService');

async function handleMessage(incomingText, userName) {
    const input = incomingText.toLowerCase().trim();

    if (input === 'hola' || input === 'menu') {
        return "Bienvenido. Seleccione una opcion:\n1. Servicios\n2. Solicitar presupuesto\n3. Agente";
    }

    if (input === '2') {
        return "Para procesar su solicitud, por favor envie su nombre completo.";
    }

    // Simulacion de captura: si el texto tiene mas de 5 caracteres, lo tomamos como nombre
    if (input.length > 5 && !input.includes(' ')) {
        await saveLead({ name: incomingText });
        return "Datos registrados correctamente. Un asesor lo contactara pronto.";
    }

    return "Opcion no valida. Escriba 'MENU' para ver las opciones disponibles.";
}

module.exports = { handleMessage };