export default {
    async fetch(request, env) {
      const WHATSAPP_TOKEN = "EAAZAGEPNzZBvoBQjyZB1E1aeR7ILvB87XegNrIkzHK96rbTSgIv9q5ldUrGWXdVvY4xGtSMJAxz3lvKx2oXH5L5lawYbEzrUxOpiptgftRqiRDZBiAnD7eHc7IyCv7lqt5Mem39qsta6Mj335Gxaalq0zZCAPDfsACQczCS63vzjOt5RmQZAJwW5NVKZA26ZAQZDZD";
      const PHONE_ID = "997403810119038";
      const VERIFY_TOKEN = "penny_valida_2026"; // Este es el que debes poner en Meta Developers
  
      // --- 1. VALIDACIÓN DEL WEBHOOK (GET) ---
      // Esto es para cuando configuras el Webhook en el panel de Meta
      if (request.method === "GET") {
        const { searchParams } = new URL(request.url);
        const mode = searchParams.get("hub.mode");
        const token = searchParams.get("hub.verify_token");
        const challenge = searchParams.get("hub.challenge");
  
        if (mode === "subscribe" && token === VERIFY_TOKEN) {
          return new Response(challenge, { status: 200 });
        }
  
        // Si entras tú desde el navegador, enviamos un mensaje de prueba
        const testResponse = await fetch(`https://graph.facebook.com/v21.0/${PHONE_ID}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: "51977396096", 
            type: "text",
            text: { body: "🔔 SISTEMA: Penny está escuchando con el nuevo Token de Admin." }
          })
        });
        
        const resData = await testResponse.json();
        return new Response("TEST DE SALIDA: " + JSON.stringify(resData));
      }
  
      // --- 2. RECEPCIÓN DE MENSAJES (POST) ---
      if (request.method === "POST") {
        const body = await request.json();
        
        // Imprimimos TODO lo que llega para verlo en el log de Cloudflare
        console.log("📥 EVENTO RECIBIDO:", JSON.stringify(body, null, 2));
  
        // Verificamos si es un mensaje de texto
        if (body.object === "whatsapp_business_account" && body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
          const message = body.entry[0].changes[0].value.messages[0];
          const from = message.from;
          const msgText = message.text?.body || "(No es texto)";
  
          console.log(`✅ Mensaje de ${from}: ${msgText}`);
  
          // Respuesta automática simple para confirmar que el círculo se cerró
          await fetch(`https://graph.facebook.com/v21.0/${PHONE_ID}/messages`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: from,
              type: "text",
              text: { body: `Penny dice: Recibí tu mensaje "${msgText}". El Webhook está VIVO.` }
            })
          });
        }
  
        return new Response("EVENT_RECEIVED", { status: 200 });
      }
  
      return new Response("Método no soportado", { status: 405 });
    }
  };