const AUTHORIZED_NUMBERS = ["51977396096", "51900281711"];
// USANDO LA URL QUE FUNCIONÓ
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyUVr2ViYP1vN6Xb0kJNBxRCiUj61UX_29DCv8Hq43LuG1WR-iNU2P5xyIPUkXICf4jbQ/exec';

export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      const payload = await request.json();
      const message = payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

      if (message) {
        const from = message.from;
        const msgText = message.text?.body?.trim();

        if (!AUTHORIZED_NUMBERS.includes(from)) {
          await sendWhatsApp(from, "⚠️ NO AUTORIZADO", env);
          return new Response("OK");
        }

        await handleConversation(from, msgText, env);
      }
      return new Response("OK");
    }
    
    // Verificación Webhook (GET)
    const { searchParams } = new URL(request.url);
    if (searchParams.get("hub.verify_token") === env.VERIFY_TOKEN) {
      return new Response(searchParams.get("hub.challenge"));
    }
    return new Response("OK");
  }
};

async function handleConversation(from, text, env) {
  // 1. LEER memoria de Cloudflare KV
  let sessionRaw = await env.PENNY_STORAGE.get(from);
  let session = sessionRaw ? JSON.parse(sessionRaw) : { step: 'START' };

  switch (session.step) {
    case 'START':
      session.step = 'ASK_TYPE';
      await env.PENNY_STORAGE.put(from, JSON.stringify(session), { expirationTtl: 600 });
      await sendWhatsApp(from, "💰 *Penny Finance*\n¿Es una *Entrada* o *Salida* de dinero?", env);
      break;

    case 'ASK_TYPE':
      let t = text.toLowerCase();
      if (t.includes("entrada") || t.includes("salida")) {
        session.type = t.includes("entrada") ? "ENTRADA" : "SALIDA";
        session.step = 'ASK_AMOUNT';
        await env.PENNY_STORAGE.put(from, JSON.stringify(session), { expirationTtl: 600 });
        await sendWhatsApp(from, "💵 ¿Cuál es el *importe*? (Ej: 150.50)", env);
      } else {
        await sendWhatsApp(from, "⚠️ Por favor, responde 'Entrada' o 'Salida'.", env);
      }
      break;

    case 'ASK_AMOUNT':
      let amount = parseFloat(text.replace(',', '.'));
      if (!isNaN(amount)) {
        session.amount = amount;
        session.step = 'ASK_DETAIL';
        await env.PENNY_STORAGE.put(from, JSON.stringify(session), { expirationTtl: 600 });
        await sendWhatsApp(from, "📝 Escribe un *detalle o comentario*:", env);
      } else {
        await sendWhatsApp(from, "⚠️ Importe no válido. Ejemplo: 50.00", env);
      }
      break;

    case 'ASK_DETAIL':
      session.detail = text;
      await sendWhatsApp(from, "⏳ Guardando en planilla...", env);
      
      try {
        const res = await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          redirect: 'follow',
          body: JSON.stringify({
            fecha: new Date().toLocaleString("es-PE", { timeZone: "America/Lima" }),
            whatsapp: from,
            tipo: session.type,
            importe: session.amount,
            detalle: session.detail
          })
        });

        if (res.ok) {
          await sendWhatsApp(from, `✅ *¡Listo! Registrado*\n💰 ${session.type}: PEN ${session.amount}\n📝 ${session.detail}`, env);
        } else {
          await sendWhatsApp(from, "❌ Error al guardar. Verifica la planilla.", env);
        }
      } catch (e) {
        await sendWhatsApp(from, "❌ Error de conexión con Google.", env);
      }
      // 2. LIMPIAR memoria para el próximo registro
      await env.PENNY_STORAGE.delete(from);
      break;
  }
}

async function sendWhatsApp(to, text, env) {
  await fetch(`https://graph.facebook.com/v21.0/${env.WHATSAPP_PHONE_ID}/messages`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${env.WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: text } })
  });
}