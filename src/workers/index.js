// =========================================================================
// CONFIGURACIÓN GLOBAL (Cambia el modelo o parámetros en un solo lugar)
// =========================================================================
const AI_MODEL = "@cf/google/gemma-4-26b-a4b-it"; // Alternativas: "@cf/qwen/qwen3.8-27b", "@cf/deepseek-ai/deepseek-v4.1-flash-1017"
const PUBLIC_GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/19_ITGf-0SJcMiJMvE5Ih7O7TzCo7bbUdqcHuiiuxn6g/edit?usp=sharing";
const INACTIVITY_LIMIT_SEC = 300; // 5 minutos exactos de inactividad
const KV_HARD_TTL_SEC = 86400;    // 24 horas en KV para poder detectar y avisar la expiración

// =========================================================================
// DICCIONARIOS DE IDIOMA INCORPORADOS
// =========================================================================
const locales = {
  es: {
    langCode: "es",
    welcome: "👋 **Bienvenido a la Demo de 'Omnichannel AI Agent Ecosystem'**\n\nEste entorno demuestra la interacción con un Agente Inteligente capaz de procesar mensajes, clasificar datos y sincronizar Leads en tiempo real.\n\nPor favor, responde con tu opción preferida:\n1️⃣ **Continuar en Español**\n2️⃣ **Continue in English**",
    intro: "¡Excelente! Estoy lista para mostrarte la arquitectura del ecosistema:\n\n• **Customer Support Automation:** Respuestas automáticas y etiquetado de tickets.\n• **Lead Management:** Captura, clasificación y guardado automático.\n• **Internal Operations:** Flujos de trabajo serverless.\n\nPuedes hacerme cualquier pregunta técnica sobre el ecosistema o escribir **'AGENDAR'** para probar el registro de un Lead.",
    aiSystemPrompt: `Eres MARLA, la interfaz de demostración técnica para el repositorio 'Omnichannel AI Agent Ecosystem'.
REGLAS ESTRICTAS:
1. Responde de forma técnica, clara y concisa en ESPAÑOL.
2. SOLO responde preguntas relacionadas con automatización de procesos, agentes de IA, ingeniería de datos, arquitectura serverless o este repositorio. Si te preguntan temas filosóficos, personales o fuera de contexto (ej. clima, fin del mundo, cocina), declina amablemente y redirige la charla hacia las capacidades del ecosistema.
3. Al final de CADA respuesta, invita al usuario a escribir "AGENDAR" para probar el flujo de captura de datos.`
  },
  en: {
    langCode: "en",
    welcome: "👋 **Welcome to the 'Omnichannel AI Agent Ecosystem' Live Demo**\n\nThis environment showcases an Intelligent AI Agent processing user inputs and syncing Leads in real time.\n\nPlease select your preferred option:\n1️⃣ **Continuar en Español**\n2️⃣ **Continue in English**",
    intro: "Awesome! I am ready to demonstrate the core architecture:\n\n• **Customer Support Automation:** Auto-responses and ticket classification.\n• **Lead Management:** Capture, qualification, and structured logging.\n• **Internal Operations:** Serverless workflows.\n\nFeel free to ask any technical question about the ecosystem or type **'SCHEDULE'** to test the Lead Capture workflow.",
    aiSystemPrompt: `You are MARLA, the technical demo interface for the 'Omnichannel AI Agent Ecosystem' repository.
STRICT RULES:
1. Respond technically, clearly, and concisely in ENGLISH.
2. ONLY answer questions related to process automation, AI agents, data engineering, serverless architecture, or this repository. If asked off-topic questions, politely decline and steer back to the ecosystem capabilities.
3. At the end of EVERY response, invite the user to type "SCHEDULE" to test the data capture workflow.`
  }
};

// =========================================================================
// FUNCIONES DE VALIDACIÓN ESTRICTA (QA)
// =========================================================================
function validateField(step, value, lang) {
  const v = (value || "").trim();
  const isEn = lang === "en";

  switch (step) {
    case 1: // Nombre (2 a 100 caracteres)
      if (v.length < 2 || v.length > 100) {
        return isEn ? "⚠️ Name must be between 2 and 100 characters. Please try again:" : "⚠️ El nombre debe tener entre 2 y 100 caracteres. Inténtalo de nuevo:";
      }
      break;
    case 2: // Email (Regex estricto, 5 a 150 caracteres)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (v.length < 5 || v.length > 150 || !emailRegex.test(v)) {
        return isEn ? "⚠️ Please enter a valid email address (5-150 characters):" : "⚠️ Por favor ingresa un correo electrónico válido (5-150 caracteres):";
      }
      break;
    case 3: // Teléfono (Mínimo 7 dígitos numéricos reales)
      const digitsOnly = v.replace(/\D/g, "");
      if (digitsOnly.length < 7 || digitsOnly.length > 18 || v.length > 25) {
        return isEn ? "⚠️ Please enter a valid phone number (minimum 7 digits):" : "⚠️ Por favor ingresa un número de teléfono válido (mínimo 7 dígitos):";
      }
      break;
    case 4: // Empresa (1 a 100 caracteres)
      if (v.length < 1 || v.length > 100) {
        return isEn ? "⚠️ Company name must be between 1 and 100 characters:" : "⚠️ El nombre de la empresa debe tener entre 1 y 100 caracteres:";
      }
      break;
    case 5: // País (2 a 60 caracteres)
      if (v.length < 2 || v.length > 60) {
        return isEn ? "⚠️ Please enter a valid Country name (2-60 characters):" : "⚠️ Por favor ingresa un país válido (2-60 caracteres):";
      }
      break;
    case 6: // Mensaje del Proyecto (Máximo 600 caracteres)
      if (v.length === 0 || v.length > 600) {
        return isEn ? `⚠️ Project message must be between 1 and 600 characters (Current: ${v.length}):` : `⚠️ El mensaje debe tener entre 1 y 600 caracteres (Actual: ${v.length}):`;
      }
      break;
  }
  return null;
}

// =========================================================================
// HELPERS DE IA, KV Y RESPUESTAS HTTP
// =========================================================================
function extractAIResponse(aiResult) {
  if (!aiResult) return "";

  // Soporta formato nuevo OpenAI-compatible (Gemma 4 / Qwen 3.8 / DeepSeek) y formato clásico (.response)
  const rawText =
    aiResult?.choices?.[0]?.message?.content ||
    aiResult?.response ||
    (typeof aiResult === "string" ? aiResult : "");

  return rawText.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}

async function saveState(env, key, state, now) {
  await env.CHAT_STATE_DEMO.put(key, JSON.stringify({ state, timestamp: now }), { expirationTtl: KV_HARD_TTL_SEC });
}

function jsonResponse(payload, corsHeaders, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

function buildFinalReview(userState) {
  const ld = userState.leadData;
  if (userState.lang === "en") {
    return `📋 **Final Review of your Lead Data:**\n\n- **Name:** ${ld.name}\n- **Email:** ${ld.email}\n- **Phone:** ${ld.phone}\n- **Company:** ${ld.company}\n- **Country:** ${ld.country}\n- **Message:** ${ld.message}\n\nDo you want to confirm and send this data?\n7️⃣ **Confirm and Send**\n8️⃣ **Cancel / Modify**`;
  }
  return `📋 **Revisión Final de tus Datos:**\n\n- **Nombre:** ${ld.name}\n- **Correo:** ${ld.email}\n- **Teléfono:** ${ld.phone}\n- **Empresa:** ${ld.company}\n- **País:** ${ld.country}\n- **Mensaje:** ${ld.message}\n\n¿Deseas confirmar y registrar estos datos?\n7️⃣ **Confirmar y Enviar**\n8️⃣ **Cancelar / Modificar**`;
}

// =========================================================================
// HANDLER PRINCIPAL DEL WORKER
// =========================================================================
export default {
  async fetch(request, env, ctx) {
    const appsScriptUrl = env.GOOGLE_APPS_SCRIPT_WEBAPP_URL;

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const body = await request.json().catch(() => ({}));
      const { message, userId, lang: requestedLang } = body;
      const input = (message || "").trim();
      const sessionKey = `user_state:${userId || 'default_user'}`;
      const now = Math.floor(Date.now() / 1000);

      // 1. PROTECCIÓN CONTRA MENSAJES VACÍOS EN EL ARRANQUE
      if (!input) {
        const defaultLang = requestedLang || "es";
        const freshState = {
          step: 0,
          lang: defaultLang,
          history: [],
          hasAutoSummary: false,
          leadData: { name: "", email: "", phone: "", company: "", country: "", message: "", language: defaultLang }
        };
        await saveState(env, sessionKey, freshState, now);
        return jsonResponse({ reply: locales[defaultLang].welcome }, corsHeaders);
      }

      let rawData = await env.CHAT_STATE_DEMO.get(sessionKey, { type: "json" });
      let userState = rawData?.state;
      const lastAccess = rawData?.timestamp || 0;

      // 6. CONTROL DE INACTIVIDAD MEJORADO (5 minutos / 300s)
      if (userState && (userState.step > 0 || (userState.history && userState.history.length > 0)) && (now - lastAccess > INACTIVITY_LIMIT_SEC)) {
        const expiredLang = userState.lang || "es";
        const tExpired = locales[expiredLang];

        const resetState = {
          step: 0,
          lang: expiredLang,
          history: [],
          hasAutoSummary: false,
          leadData: { name: "", email: "", phone: "", company: "", country: "", message: "", language: expiredLang }
        };
        await saveState(env, sessionKey, resetState, now);

        const expiredMsg = expiredLang === "en"
          ? `⏱️ **Inactivity Timeout (5 min):** Your session was reset due to inactivity.\n\n${tExpired.welcome}`
          : `⏱️ **Tiempo de Inactividad Agotado (5 min):** Tu sesión se reinició por inactividad.\n\n${tExpired.welcome}`;

        return jsonResponse({ reply: expiredMsg }, corsHeaders);
      }

      if (!userState) {
        userState = {
          step: 0,
          lang: requestedLang || "es",
          history: [],
          hasAutoSummary: false,
          leadData: { name: "", email: "", phone: "", company: "", country: "", message: "", language: requestedLang || "es" }
        };
      }

      const inputUpper = input.toUpperCase();
      let t = locales[userState.lang] || locales.es;

      // ===================================================================
      // A. FLUJO DEL FORMULARIO GUIADO (step > 0)
      // ===================================================================
      if (userState.step > 0) {

        if (["CANCELAR", "CANCEL", "EXIT", "MENU"].includes(inputUpper)) {
          userState.step = 0;
          userState.hasAutoSummary = false;
          await saveState(env, sessionKey, userState, now);
          const cancelReply = userState.lang === "en"
            ? "Process cancelled cleanly. You can continue asking questions or type **'SCHEDULE'** anytime."
            : "Proceso cancelado limpiamente. Puedes seguir haciendo consultas o escribir **'AGENDAR'** cuando gustes.";
          return jsonResponse({ reply: cancelReply }, corsHeaders);
        }

        // --- PASO 0.5: APROBACIÓN DEL RESUMEN IA ---
        if (userState.step === 0.5) {
          if (["1", "SÍ", "SI", "YES"].includes(inputUpper)) {
            userState.hasAutoSummary = true;
            userState.step = 1;
            await saveState(env, sessionKey, userState, now);
            const askName = userState.lang === "en"
              ? "Great, summary saved! Now, what is your **Full Name**?"
              : "¡Excelente, resumen guardado! Ahora, ¿cuál es tu **Nombre Completo**?";
            return jsonResponse({ reply: askName }, corsHeaders);
          } else if (["2", "NO"].includes(inputUpper)) {
            userState.hasAutoSummary = false;
            userState.leadData.message = "";
            userState.step = 1;
            await saveState(env, sessionKey, userState, now);
            const askNameManual = userState.lang === "en"
              ? "No problem, you will write it manually at the end. First, what is your **Full Name**?"
              : "Sin problema, lo escribirás manualmente al final. Primero, ¿cuál es tu **Nombre Completo**?";
            return jsonResponse({ reply: askNameManual }, corsHeaders);
          } else {
            const retrySummary = userState.lang === "en"
              ? "Please select an option:\n1️⃣ **Approve summary**\n2️⃣ **Write it manually later**"
              : "Por favor selecciona una opción:\n1️⃣ **Aprobar resumen**\n2️⃣ **Escribirlo manualmente después**";
            return jsonResponse({ reply: retrySummary }, corsHeaders);
          }
        }

        // --- PASO 1: CAPTURA DE NOMBRE ---
        if (userState.step === 1) {
          const err = validateField(1, input, userState.lang);
          if (err) {
            await saveState(env, sessionKey, userState, now);
            return jsonResponse({ reply: err }, corsHeaders);
          }

          userState.leadData.name = input;
          userState.step = 2;
          await saveState(env, sessionKey, userState, now);

          const reply = userState.lang === "en"
            ? `Great, **${input}**. What is your **Email Address**?`
            : `Mucho gusto, **${input}**. ¿Cuál es tu **Correo Electrónico**?`;
          return jsonResponse({ reply }, corsHeaders);
        }

        // --- PASO 2: CAPTURA DE EMAIL ---
        if (userState.step === 2) {
          const err = validateField(2, input, userState.lang);
          if (err) {
            await saveState(env, sessionKey, userState, now);
            return jsonResponse({ reply: err }, corsHeaders);
          }

          userState.leadData.email = input;
          userState.step = 2.5;
          await saveState(env, sessionKey, userState, now);

          const reply = userState.lang === "en"
            ? `You entered: **${input}**\nIs this correct?\n1️⃣ **Yes**\n2️⃣ **No (Correct it)**`
            : `Ingresaste: **${input}**\n¿Es correcto?\n1️⃣ **Sí**\n2️⃣ **No (Corregir)**`;
          return jsonResponse({ reply }, corsHeaders);
        }

        // --- PASO 2.5: DOBLE VERIFICACIÓN DE EMAIL ---
        if (userState.step === 2.5) {
          if (["1", "SÍ", "SI", "YES"].includes(inputUpper)) {
            userState.step = 3;
            await saveState(env, sessionKey, userState, now);
            const askPhone = userState.lang === "en"
              ? "Confirmed. What is your **Phone Number / WhatsApp** (min. 7 digits)?"
              : "Confirmado. ¿Cuál es tu **Teléfono / WhatsApp** (mínimo 7 dígitos)?";
            return jsonResponse({ reply: askPhone }, corsHeaders);
          } else if (["2", "NO"].includes(inputUpper)) {
            userState.step = 2;
            await saveState(env, sessionKey, userState, now);
            const retryEmail = userState.lang === "en"
              ? "Let's fix it. Please enter your **Email Address** again:"
              : "Corrijámoslo. Ingresa tu **Correo Electrónico** nuevamente:";
            return jsonResponse({ reply: retryEmail }, corsHeaders);
          } else {
            await saveState(env, sessionKey, userState, now);
            const promptVerify = userState.lang === "en" ? "Please confirm your email: 1️⃣ Yes / 2️⃣ No" : "Por favor confirma tu correo: 1️⃣ Sí / 2️⃣ No";
            return jsonResponse({ reply: promptVerify }, corsHeaders);
          }
        }

        // --- PASO 3: CAPTURA DE TELÉFONO ---
        if (userState.step === 3) {
          const err = validateField(3, input, userState.lang);
          if (err) {
            await saveState(env, sessionKey, userState, now);
            return jsonResponse({ reply: err }, corsHeaders);
          }

          userState.leadData.phone = input;
          userState.step = 3.5;
          await saveState(env, sessionKey, userState, now);

          const reply = userState.lang === "en"
            ? `You entered phone: **${input}**\nIs this correct?\n1️⃣ **Yes**\n2️⃣ **No (Correct it)**`
            : `Ingresaste el teléfono: **${input}**\n¿Es correcto?\n1️⃣ **Sí**\n2️⃣ **No (Corregir)**`;
          return jsonResponse({ reply }, corsHeaders);
        }

        // --- PASO 3.5: DOBLE VERIFICACIÓN DE TELÉFONO ---
        if (userState.step === 3.5) {
          if (["1", "SÍ", "SI", "YES"].includes(inputUpper)) {
            userState.step = 4;
            await saveState(env, sessionKey, userState, now);
            const askCompany = userState.lang === "en"
              ? "Confirmed. What is your **Company / Organization** name?"
              : "Confirmado. ¿Cuál es el nombre de tu **Empresa / Organización**?";
            return jsonResponse({ reply: askCompany }, corsHeaders);
          } else if (["2", "NO"].includes(inputUpper)) {
            userState.step = 3;
            await saveState(env, sessionKey, userState, now);
            const retryPhone = userState.lang === "en"
              ? "Let's fix it. Please enter your **Phone Number** again:"
              : "Corrijámoslo. Ingresa tu **Número de Teléfono** nuevamente:";
            return jsonResponse({ reply: retryPhone }, corsHeaders);
          } else {
            await saveState(env, sessionKey, userState, now);
            const promptVerify = userState.lang === "en" ? "Please confirm your phone: 1️⃣ Yes / 2️⃣ No" : "Por favor confirma tu teléfono: 1️⃣ Sí / 2️⃣ No";
            return jsonResponse({ reply: promptVerify }, corsHeaders);
          }
        }

        // --- PASO 4: CAPTURA DE EMPRESA ---
        if (userState.step === 4) {
          const err = validateField(4, input, userState.lang);
          if (err) {
            await saveState(env, sessionKey, userState, now);
            return jsonResponse({ reply: err }, corsHeaders);
          }

          userState.leadData.company = input;
          userState.step = 5;
          await saveState(env, sessionKey, userState, now);

          const reply = userState.lang === "en" ? "What **Country** are you located in?" : "¿De qué **País** nos escribes?";
          return jsonResponse({ reply }, corsHeaders);
        }

        // --- PASO 5: CAPTURA DE PAÍS ---
        if (userState.step === 5) {
          const err = validateField(5, input, userState.lang);
          if (err) {
            await saveState(env, sessionKey, userState, now);
            return jsonResponse({ reply: err }, corsHeaders);
          }

          userState.leadData.country = input;

          if (userState.hasAutoSummary && userState.leadData.message) {
            userState.step = 7;
            await saveState(env, sessionKey, userState, now);
            return jsonResponse({ reply: buildFinalReview(userState) }, corsHeaders);
          }

          userState.step = 6;
          await saveState(env, sessionKey, userState, now);

          const reply = userState.lang === "en"
            ? "Finally, describe your **Automation Use Case / Project** (Max 600 chars):"
            : "Por último, describe brevemente tu **Caso de Uso / Proyecto** (Máx. 600 caracteres):";
          return jsonResponse({ reply }, corsHeaders);
        }

        // --- PASO 6: CAPTURA MANUAL DE MENSAJE DEL PROYECTO ---
        if (userState.step === 6) {
          const err = validateField(6, input, userState.lang);
          if (err) {
            await saveState(env, sessionKey, userState, now);
            return jsonResponse({ reply: err }, corsHeaders);
          }

          userState.leadData.message = input;
          userState.step = 7;
          await saveState(env, sessionKey, userState, now);

          return jsonResponse({ reply: buildFinalReview(userState) }, corsHeaders);
        }

        // --- PASO 7: REVISIÓN FINAL Y CIERRE (7️⃣ Confirmar / 8️⃣ Cancelar) ---
        if (userState.step === 7) {
          if (["7", "CONFIRMAR", "ENVIAR", "CONFIRM", "SEND"].includes(inputUpper)) {

            if (env.DB) {
              try {
                await env.DB.prepare(
                  `INSERT INTO leads (name, email, phone, company, country, message, language, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`
                ).bind(
                  userState.leadData.name,
                  userState.leadData.email,
                  userState.leadData.phone,
                  userState.leadData.company,
                  userState.leadData.country,
                  userState.leadData.message,
                  userState.leadData.language
                ).run();
              } catch (dbErr) {
                console.error("D1 Insert Error:", dbErr.message);
              }
            }

            if (appsScriptUrl) {
              ctx.waitUntil(
                fetch(appsScriptUrl, {
                  method: "POST",
                  headers: { "Content-Type": "text/plain;charset=utf-8" },
                  body: JSON.stringify(userState.leadData),
                  redirect: "follow"
                }).catch(e => console.error("Google Sheets Sync Error:", e))
              );
            }

            userState.step = 0;
            userState.hasAutoSummary = false;
            await saveState(env, sessionKey, userState, now);

            const successMsg = userState.lang === "en"
              ? `✅ **Lead Successfully Logged!**\n\nThank you **${userState.leadData.name}**! Your details have been saved to D1 and synced with Google Sheets.\n\n📊 **View live Google Sheet:**\n${PUBLIC_GOOGLE_SHEET_URL}\n\n*(Type **'MENU'** to restart or keep asking technical questions)*`
              : `✅ **¡Lead Registrado con Éxito!**\n\n¡Gracias **${userState.leadData.name}**! Tus datos han sido guardados en D1 y sincronizados con Google Sheets.\n\n📊 **Ver hoja de cálculo en vivo:**\n${PUBLIC_GOOGLE_SHEET_URL}\n\n*(Escribe **'MENU'** para reiniciar o sigue haciendo consultas técnicas)*`;

            return jsonResponse({ reply: successMsg }, corsHeaders);

          } else if (["8", "CANCELAR", "CANCEL", "MODIFICAR"].includes(inputUpper)) {
            userState.step = 0;
            userState.hasAutoSummary = false;
            await saveState(env, sessionKey, userState, now);

            const cancelMsg = userState.lang === "en"
              ? "🚫 **Registration cancelled.** We haven't lost our chat thread—feel free to keep asking questions or type **'SCHEDULE'** whenever you're ready."
              : "🚫 **Registro cancelado.** No hemos perdido el hilo de nuestra charla; puedes seguir haciendo consultas o escribir **'AGENDAR'** cuando estés listo.";
            return jsonResponse({ reply: cancelMsg }, corsHeaders);

          } else {
            await saveState(env, sessionKey, userState, now);
            const promptChoice = userState.lang === "en"
              ? "⚠️ Invalid option. Please reply with:\n7️⃣ **Confirm and Send**\n8️⃣ **Cancel / Modify**"
              : "⚠️ Opción no válida. Por favor responde con:\n7️⃣ **Confirmar y Enviar**\n8️⃣ **Cancelar / Modificar**";
            return jsonResponse({ reply: promptChoice }, corsHeaders);
          }
        }
      }

      // ===================================================================
      // B. MENÚ GENERAL Y CONSULTAS IA (step === 0)
      // ===================================================================

      if (["LANG ES", "ESPAÑOL", "SPANISH", "/ES"].includes(inputUpper)) {
        userState.lang = "es";
      } else if (["LANG EN", "ENGLISH", "INGLES", "/EN"].includes(inputUpper)) {
        userState.lang = "en";
      }

      userState.leadData.language = userState.lang;
      t = locales[userState.lang];

      // 4. BIFURCACIÓN INTELIGENTE AL AGENDAR
      if (["TEST", "DEMO", "AGENDAR", "SCHEDULE"].includes(inputUpper)) {
        let generatedSummary = "";

        if (userState.history && userState.history.length >= 2 && env.AI_DEMO) {
          try {
            const summarySystemPrompt = userState.lang === "en"
              ? "Summarize ONLY the user's software automation, AI, or data engineering needs from the conversation into a single concise paragraph in FIRST PERSON ('I am looking to...'). Ignore off-topic banter. Strictly under 500 characters. No bullet points."
              : "Resume ÚNICAMENTE las necesidades técnicas de automatización, IA o datos del usuario de esta conversación en un solo párrafo breve en PRIMERA PERSONA ('Busco implementar...'). Ignora temas fuera de contexto. Estrictamente menos de 500 caracteres. Sin viñetas.";

            const aiSummary = await env.AI_DEMO.run(AI_MODEL, {
              messages: [
                { role: "system", content: summarySystemPrompt },
                ...userState.history
              ]
            });

            const extractedSummary = extractAIResponse(aiSummary);
            if (extractedSummary) {
              generatedSummary = extractedSummary.slice(0, 580);
            }
          } catch (e) {
            console.error("AI Summary Error:", e);
          }
        }

        if (generatedSummary) {
          userState.leadData.message = generatedSummary;
          userState.step = 0.5;
          await saveState(env, sessionKey, userState, now);

          const approvalMsg = userState.lang === "en"
            ? `📥 **Lead Capture Demo**\n\nBased on our chat, I drafted this project summary for your request:\n> *"${generatedSummary}"*\n\nWould you like to use this summary?\n1️⃣ **Yes, use this summary**\n2️⃣ **No, I'll write it myself**`
            : `📥 **Demostración de Captura de Lead**\n\nBasado en nuestra charla, redacté este resumen para tu solicitud:\n> *"${generatedSummary}"*\n\n¿Deseas usar este resumen?\n1️⃣ **Sí, aprobar resumen**\n2️⃣ **No, prefiero escribirlo manualmente**`;

          return jsonResponse({ reply: approvalMsg }, corsHeaders);
        }

        userState.step = 1;
        userState.hasAutoSummary = false;
        await saveState(env, sessionKey, userState, now);

        const directMsg = userState.lang === "en"
          ? "📥 **Lead Capture Demo (Google Sheets & D1)**\n\nWhat is your **Full Name**?"
          : "📥 **Demostración de Captura de Lead (Google Sheets & D1)**\n\nPara comenzar con el registro, ¿cuál es tu **Nombre Completo**?";

        return jsonResponse({ reply: directMsg }, corsHeaders);
      }

      // Opciones del Menú Principal
      let reply = "";
      if (inputUpper === "MENU") {
        userState.history = [];
        reply = t.welcome;
      } else if (input === "1" || inputUpper === "ES") {
        userState.lang = "es";
        userState.leadData.language = "es";
        reply = locales.es.intro;
      } else if (input === "2" || inputUpper === "EN") {
        userState.lang = "en";
        userState.leadData.language = "en";
        reply = locales.en.intro;
      } else {
        if (!userState.history) userState.history = [];
        userState.history.push({ role: "user", content: input });
        if (userState.history.length > 6) userState.history.shift();

        const aiResponse = await env.AI_DEMO.run(AI_MODEL, {
          messages: [
            { role: "system", content: `${t.aiSystemPrompt}\n\nHoja pública de consulta: ${PUBLIC_GOOGLE_SHEET_URL}` },
            ...userState.history
          ],
        });

        const cleanedText = extractAIResponse(aiResponse) || "⚠️ No se pudo generar una respuesta en este momento.";
        reply = `🤖 **MARLA:** ${cleanedText}`;
        userState.history.push({ role: "assistant", content: cleanedText });
      }

      await saveState(env, sessionKey, userState, now);
      return jsonResponse({ reply }, corsHeaders);

    } catch (err) {
      console.error("Worker Global Error:", err);
      return jsonResponse({ reply: "Error procesando la solicitud en el Worker. ⚠️" }, corsHeaders, 500);
    }
  }
};