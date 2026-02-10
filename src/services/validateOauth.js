/**
 * PROYECTO: WhatsApp Activity Control System
 * Lógica: Permite múltiples ACTIVIDADES tras un CHECKIN, hasta que se haga CHECKOUT.
 */

const OFICINA_LAT = -34.6037; 
const OFICINA_LNG = -58.3816;
const DISTANCIA_MAXIMA_METROS = 300;
const EMPLEADOS_PERMITIDOS = ["5491122334455", "5491166778899"];

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
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
        iss: env.GOOGLE_CLIENT_EMAIL,
        scope: "https://www.googleapis.com/auth/spreadsheets",
        aud: authUrl, exp: now + 3600, iat: now
    })).replace(/=/g, "");
    const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(`${header}.${claim}`));
    const jwt = `${header}.${claim}.${btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")}`;
    const response = await fetch(authUrl, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}` });
    const data = await response.json();
    return data.access_token;
}

// NUEVA LÓGICA: Verifica si la jornada está abierta (Hay Checkin pero no Checkout)
async function obtenerEstadoJornada(phone, env, token) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}/values/Sheet1!A:C`;
    const response = await fetch(url, { headers: { "Authorization": `Bearer ${token}` } });
    const data = await response.json();
    
    if (!data.values || data.values.length === 0) return { tieneCheckinHoy: false, tieneCheckoutHoy: false, jornadaAbiertaAyer: false };

    const hoy = new Date().toISOString().split('T')[0];
    let tieneCheckinHoy = false;
    let tieneCheckoutHoy = false;
    let ultimoCheckinSinCerrar = null;

    // Analizamos todo el historial del empleado
    for (const fila of data.values) {
        if (fila[0] === phone) {
            const accion = fila[1];
            const fecha = fila[2];

            if (accion === "CHECKIN") {
                if (fecha === hoy) tieneCheckinHoy = true;
                ultimoCheckinSinCerrar = fecha;
            } 
            if (accion === "CHECKOUT") {
                if (fecha === hoy) tieneCheckoutHoy = true;
                ultimoCheckinSinCerrar = null; // Se cerró la jornada
            }
        }
    }

    return {
        tieneCheckinHoy,
        tieneCheckoutHoy,
        jornadaAbiertaAyer: ultimoCheckinSinCerrar !== null && ultimoCheckinSinCerrar !== hoy,
        fechaJornadaPendiente: ultimoCheckinSinCerrar
    };
}

export default {
    async fetch(request, env) {
        try {
            if (request.method !== "POST") return new Response("Worker OK");
            const payload = await request.json();
            const { phone, text, lat, lng } = payload;
            const accessToken = await getGoogleToken(env);

            if (!EMPLEADOS_PERMITIDOS.includes(phone)) {
                return new Response(JSON.stringify({ status: "ERROR", message: "No autorizado" }), { status: 403 });
            }

            const estado = await obtenerEstadoJornada(phone, env, accessToken);
            const comando = text.toUpperCase();
            const distancia = getDistance(parseFloat(lat), parseFloat(lng), OFICINA_LAT, OFICINA_LNG);
            const estaEnRango = distancia <= DISTANCIA_MAXIMA_METROS;

            // --- LÓGICA DE VALIDACIÓN ---

            // 1. Si hay una jornada de otro día sin cerrar
            if (estado.jornadaAbiertaAyer && !comando.includes("CHECKOUT")) {
                return new Response(JSON.stringify({ 
                    status: "RECHAZADO", 
                    message: `Pendiente: CHECKOUT de la jornada ${estado.fechaJornadaPendiente}.` 
                }), { status: 400 });
            }

            // 2. Si intenta ACTIVIDAD o CHECKOUT sin haber hecho CHECKIN hoy
            if ((comando.includes("ACTIVIDAD") || comando.includes("CHECKOUT")) && !estado.tieneCheckinHoy && !estado.jornadaAbiertaAyer) {
                return new Response(JSON.stringify({ status: "RECHAZADO", message: "Primero debes hacer CHECKIN hoy." }), { status: 400 });
            }

            // 3. Si ya cerró el día e intenta hacer más cosas (excepto un nuevo checkin si fuera el caso)
            if (estado.tieneCheckoutHoy && !comando.includes("CHECKIN")) {
                return new Response(JSON.stringify({ status: "RECHAZADO", message: "Ya registraste tu salida (CHECKOUT) hoy." }), { status: 400 });
            }

            // 4. Doble Checkin
            if (comando.includes("CHECKIN") && estado.tieneCheckinHoy) {
                return new Response(JSON.stringify({ status: "RECHAZADO", message: "Ya hiciste CHECKIN hoy." }), { status: 400 });
            }

            // --- PROCESAR REGISTRO ---
            let action = "ACTIVIDAD";
            if (comando.includes("CHECKIN")) action = "CHECKIN";
            if (comando.includes("CHECKOUT")) action = "CHECKOUT";

            // Validar GPS solo para In/Out
            if ((action === "CHECKIN" || action === "CHECKOUT") && !estaEnRango) {
                return new Response(JSON.stringify({ status: "ERROR_GPS", message: "Fuera de rango." }), { status: 400 });
            }

            const now = new Date();
            const row = [phone, action, now.toISOString().split('T')[0], now.toLocaleTimeString('es-AR'), lat, lng, "OK", text];

            await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}/values/Sheet1!A:H:append?valueInputOption=USER_ENTERED`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" },
                body: JSON.stringify({ values: [row] })
            });

            return new Response(JSON.stringify({ status: "success", action }));

        } catch (error) {
            return new Response(JSON.stringify({ status: "error", message: error.message }), { status: 500 });
        }
    }
};