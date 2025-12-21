export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      const payload = await request.json();
      
      // Extraer mensaje y número del empleado
      const message = payload.entry[0].changes[0].value.messages[0].text.body;
      const phone = payload.entry[0].changes[0].value.messages[0].from;

      if (message.toLowerCase().includes("check-in")) {
        // Aquí llamarías a la función de Google Sheets
        return new Response("Check-in registrado correctamente");
      }
    }
    return new Response("WhatsApp Webhook Active");
  }
};