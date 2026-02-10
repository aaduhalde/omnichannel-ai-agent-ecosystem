/**
 * PROYECTO: WhatsApp Activity Control System
 * REGLA: No permite Checkout sin Checkin. Valida jornadas de días anteriores.
 */

const OFICINA_LAT = -12.0090; 
const OFICINA_LNG = -77.0811;
const DISTANCIA_MAXIMA_METROS = 500;

function getFechaActual() {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }); 
}

async function enviarWhatsApp(to, message, env) {
    let recipient = to;
    if (recipient.startsWith("549")) recipient = "54" + recipient.substring(3);
    try {
        await fetch(`https://graph.facebook.com/v21.0/${env.WHATSAPP_PHONE_ID}/messages`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${env.WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
            body: JSON.stringify({ messaging_product: "whatsapp", to: recipient, type: "text", text: { body: message } })
        });
    } catch (e) { console.error("Error WhatsApp:", e); }
}

async function getGoogleToken(env) {
    const authUrl = "https://oauth2.googleapis.com/token";
    let rawKey = env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
    const pemContents = rawKey.replace("-----BEGIN PRIVATE KEY-----", "").replace("-----END PRIVATE KEY-----", "").replace(/\s/g, "");
    const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
    const key = await crypto.subtle.importKey("pkcs8", binaryKey, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
    const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" })).replace(/=/g, "");
    const now = Math.floor(Date.now() / 1000);
    const claim = btoa(JSON.stringify({
        iss: env.GOOGLE_CLIENT_EMAIL, scope: "https://www.googleapis.com/auth/spreadsheets",
        aud: authUrl, exp: now + 3600, iat: now
    })).replace(/=/g, "");
    const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(`${header}.${claim}`));
    const jwt = `${header}.${claim}.${btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")}`;
    const response = await fetch(authUrl, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}` });
    const data = await response.json();
    return data.access_token;
}

async function obtenerHistorial(phone, env, token) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}/values/Sheet1!A:H`;
    const response = await fetch(url, { headers: { "Authorization": `Bearer ${token}` } });
    const data = await response.json();
    if (!data.values) return [];
    const altPhone = phone.startsWith("549") ? "54" + phone.substring(3) : phone;
    return data.values.filter(fila => fila[0] === phone || fila[0] === altPhone);
}

export default {
    async fetch(request, env) {
        if (request.method === "GET") return new Response(new URL(request.url).searchParams.get("hub.challenge"), { status: 200 });

        if (request.method === "POST") {
            try {
                const payload = await request.json();
                const msg = payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
                if (!msg) return new Response("OK");

                const phone = msg.from;
                const lat = msg.location?.latitude || null;
                const lng = msg.location?.longitude || null;
                const text = (msg.text?.body || "").toUpperCase().trim();

                const token = await getGoogleToken(env);
                const historial = await obtenerHistorial(phone, env, token);
                
                // Buscamos el último registro real (ignorando los estados PENDIENTES de la lógica conversacional)
                const historialReal = historial.filter(r => ["CHECKIN", "CHECKOUT", "ACTIVIDAD"].includes(r[1]));
                const ultimoReal = historialReal.length > 0 ? historialReal[historialReal.length - 1] : null;
                
                // Estado técnico (para saber en qué paso de la conversación estamos)
                const ultimoEstadoTecnico = historial.length > 0 ? historial[historial.length - 1][1] : null;

                const fechaHoy = getFechaActual();

                // --- LOGICA DE COMANDOS ---
                if (!lat && !lng) {
                    if (text === "CHECKIN") {
                        if (ultimoReal && ultimoReal[1] === "CHECKIN" && ultimoReal[2] === fechaHoy) {
                            await enviarWhatsApp(phone, "⚠️ Ya tienes un CHECKIN registrado hoy.", env);
                        } else {
                            await registrarEnSheet(phone, "PENDIENTE_IN", token, env, "Esperando GPS");
                            await enviarWhatsApp(phone, "📍 Envía tu ubicación para el CHECKIN.", env);
                        }
                        return new Response("OK");
                    }

                    if (text === "CHECKOUT") {
                        if (!ultimoReal || ultimoReal[1] === "CHECKOUT") {
                            await enviarWhatsApp(phone, "⚠️ No puedes hacer CHECKOUT sin un CHECKIN previo.", env);
                        } else {
                            if (ultimoReal[2] !== fechaHoy) {
                                await enviarWhatsApp(phone, `⚠️ Tienes un CHECKIN pendiente del día ${ultimoReal[2]}.`, env);
                            }
                            await registrarEnSheet(phone, "PENDIENTE_OUT", token, env, "Esperando GPS");
                            await enviarWhatsApp(phone, "📍 Envía tu ubicación para confirmar tu salida.", env);
                        }
                        return new Response("OK");
                    }

                    if (text === "ACTIVIDAD") {
                        if (!ultimoReal || ultimoReal[1] === "CHECKOUT" || ultimoReal[2] !== fechaHoy) {
                            await enviarWhatsApp(phone, "⚠️ Debes iniciar jornada (CHECKIN) hoy para registrar actividades.", env);
                        } else {
                            await registrarEnSheet(phone, "ESPERANDO_UBI_ACT", token, env, "Paso 1: Ubicación");
                            await enviarWhatsApp(phone, "📍 Envía la ubicación de la actividad.", env);
                        }
                        return new Response("OK");
                    }

                    // Procesar Comentario de Actividad
                    if (ultimoEstadoTecnico === "ESPERANDO_TEXTO_ACT") {
                        const tempLat = historial[historial.length - 1][4];
                        const tempLng = historial[historial.length - 1][5];
                        await registrarEnSheet(phone, "ACTIVIDAD", token, env, msg.text.body, tempLat, tempLng);
                        await enviarWhatsApp(phone, "✅ ACTIVIDAD registrada con éxito.", env);
                        return new Response("OK");
                    }
                }

                // --- LOGICA DE UBICACIÓN ---
                if (lat && lng) {
                    if (ultimoEstadoTecnico === "PENDIENTE_IN") {
                        await validarYRegistrar(phone, "CHECKIN", lat, lng, "Ingreso", token, env);
                    } else if (ultimoEstadoTecnico === "PENDIENTE_OUT") {
                        await validarYRegistrar(phone, "CHECKOUT", lat, lng, "Salida", token, env);
                    } else if (ultimoEstadoTecnico === "ESPERANDO_UBI_ACT") {
                        await registrarEnSheet(phone, "ESPERANDO_TEXTO_ACT", token, env, "Esperando comentario", lat, lng);
                        await enviarWhatsApp(phone, "📝 Ubicación recibida. Ahora escribe el detalle de la actividad.", env);
                    }
                }

                return new Response("OK");
            } catch (e) { return new Response("OK"); }
        }
    }
};

// ... (Las funciones validarYRegistrar y registrarEnSheet se mantienen igual al código anterior)
async function validarYRegistrar(phone, action, lat, lng, detalle, token, env) {
    const R = 6371e3;
    const dLat = (OFICINA_LAT - lat) * Math.PI / 180;
    const dLon = (OFICINA_LNG - lng) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat*Math.PI/180)*Math.cos(OFICINA_LAT*Math.PI/180)*Math.sin(dLon/2)**2;
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    if (dist > DISTANCIA_MAXIMA_METROS) {
        await enviarWhatsApp(phone, `❌ Fuera de rango (${Math.round(dist)}m).`, env);
    } else {
        await registrarEnSheet(phone, action, token, env, detalle, lat, lng);
        await enviarWhatsApp(phone, `✅ ${action} registrado con éxito.`, env);
    }
}

async function registrarEnSheet(phone, action, token, env, detalle, lat = "N/A", lng = "N/A") {
    const ahora = new Date();
    const hora = ahora.toLocaleTimeString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', hour12: false });
    const fecha = ahora.toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });
    const row = [phone, action, fecha, hora, lat, lng, "OK", detalle];
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}/values/Sheet1!A:H:append?valueInputOption=USER_ENTERED`, {
        method: "POST", headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ values: [row] })
    });
}