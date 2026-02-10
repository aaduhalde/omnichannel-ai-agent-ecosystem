export default {
    async fetch(request, env) {
      // ESTE BLOQUE ES SOLO PARA ACTIVAR TU NÚMERO +54
      // Ejecútalo una vez visitando la URL de tu worker en el navegador
      const WABA_ID = "930708702858295"; // Tu ID de cuenta que vi en la captura
      const TOKEN = env.WHATSAPP_TOKEN; // El token de workercontrol
  
      const response = await fetch(`https://graph.facebook.com/v21.0/${WABA_ID}/subscribed_apps`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TOKEN}`
        }
      });
  
      const result = await response.json();
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };