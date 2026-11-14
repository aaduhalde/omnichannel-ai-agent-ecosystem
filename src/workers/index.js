// =========================================================================
// 🌐 DICCIONARIOS DE IDIOMA INCORPORADOS
// =========================================================================
const locales = {
  es: {
    langCode: "es",
    welcome: "👋 **Bienvenido a la Demo de 'Omnichannel AI Agent Ecosystem'**\n\nEste entorno demuestra la interacción con un Agente Inteligente capaz de procesar mensajes, clasificar datos y sincronizar Leads en tiempo real.\n\nPor favor, responde con tu opción preferida:\n1️⃣ **Continuar en Español**\n2️⃣ **Continue in English**",
    intro: "¡Excelente! Estoy lista para mostrarte la arquitectura del ecosistema:\n\n• **Customer Support Automation:** Respuestas automáticas y etiquetado de tickets.\n• **Lead Management:** Captura, clasificación y guardado automático.\n• **Internal Operations:** Flujos de trabajo serverless.\n\nPuedes hacerme cualquier pregunta técnica o escribir **'AGENDAR'** para probar el registro de un Lead.",
    aiSystemPrompt: `Eres MARLA, la interfaz de demostración de IA para el repositorio 'Omnichannel AI Agent Ecosystem'. Responde de forma técnica, clara y concisa en ESPAÑOL. Al final de CADA respuesta, invita al usuario a escribir "AGENDAR" para probar el flujo.`
  },
  en: {
    langCode: "en",
    welcome: "👋 **Welcome to the 'Omnichannel AI Agent Ecosystem' Live Demo**\n\nThis environment showcases an Intelligent AI Agent processing user inputs and syncing Leads in real time.\n\nPlease select your preferred option:\n1️⃣ **Continuar en Español**\n2️⃣ **Continue in English**",
    intro: "Awesome! I am ready to demonstrate the core architecture:\n\n• **Customer Support Automation:** Auto-responses and ticket classification.\n• **Lead Management:** Capture, qualification, and structured logging.\n• **Internal Operations:** Serverless workflows.\n\nFeel free to ask any technical question or type **'SCHEDULE'** to test the Lead Capture workflow.",
    aiSystemPrompt: `You are MARLA, the interactive AI Demo interface for the 'Omnichannel AI Agent Ecosystem'. Respond professionally in ENGLISH. At the end of EVERY response, invite the user to type "SCHEDULE" to test the workflow.`
  }
};

const PUBLIC_GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/19_ITGf-0SJcMiJMvE5Ih7O7TzCo7bbUdqcHuiiuxn6g/edit?usp=sharing";
const SESSION_TTL = 300; // 5 minutos de inactividad (en segundos)

// =========================================================================
// 🛡️ FUNCIONES DE VALIDACIÓN ESTRICTA (QA)
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
    case 3: // Teléfono (Mínimo 7 dígitos numéricos/símbolos de teléfono)
      const phoneClean = v.replace(/[\s\-\+\(\)]/g, "");
      if (phoneClean.length < 7 || phoneClean.length > 20) {
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
        return isEn ? "⚠️ Project message cannot be empty and must be under 600 characters:" : "⚠️ El mensaje no puede estar vacío y debe tener un máximo de 600 caracteres:";
      }
      break;
  }
  return null; // Sin errores
}

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

      // ===================================================================
      // 1. PROTECCIÓN CONTRA MENSAJES VACÍOS EN EL ARRANQUE
      // ===================================================================
      let rawData = await env.CHAT_STATE_DEMO.get(sessionKey, { type: "json" });
      let userState = rawData?.state;
      const lastAccess = rawData?.timestamp || 0;
      const now = Math.floor(Date.now() / 1000);

      // ===================================================================
      // 6. CONTROL DE INACTIVIDAD MEJORADO (5 minutos / 300s)
      // ===================================================================
      if (userState && userState.step > 0 && (now - lastAccess > SESSION_TTL)) {
        await env.CHAT_STATE_DEMO.delete(sessionKey);
        const expiredLang = userState.lang || "es";
        const t = locales[expiredLang];
        const expiredMsg = expiredLang === "en"
          ? "⏱️ **Session Expired:** Your session was closed due to 5 minutes of inactivity. Let's start over:\n\n" + t.welcome
          : "⏱️ **Sesión Expirada:** Tu sesión se cerró por 5 minutos de inactividad. Volvamos a empezar:\n\n" + t.welcome;

        return new Response(JSON.stringify({ reply: expiredMsg }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // Si no hay estado previo o el input está vacío al inicio
      if (!userState) {
        userState = {
          step: 0,
          lang: requestedLang || "es",
          history: [],
          leadData: { name: "", email: "", phone: "", company: "", country: "", message: "", language: "es" }
        };
      }

      // Actualizar timestamp de actividad
      await env.CHAT_STATE_DEMO.put(sessionKey, JSON.stringify({ state: userState, timestamp: now }), { expirationTtl: SESSION_TTL });

      const inputUpper = input.toUpperCase();
      let t = locales[userState.lang] || locales.es;

      // ===================================================================
      // A. FLUJO DEL FORMULARIO GUIADO (step > 0)
      // ===================================================================
      if (userState.step > 0) {
        
        // Comando de salida o cancelación limpia (Opción 8 en pasos de confirmación o cancelar general)
        if (["CANCELAR", "CANCEL", "EXIT", "MENU", "8"].includes(inputUpper) && userState.step >= 7) {
          await env.CHAT_STATE_DEMO.delete(sessionKey);
          return new Response(JSON.stringify({ 
            reply: userState.lang === "en" ? "Flow cancelled cleanly.\n\n" + t.welcome : "Proceso cancelado limpiamente.\n\n" + t.welcome 
          }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        if (["CANCELAR", "CANCEL", "EXIT", "MENU"].includes(inputUpper)) {
          await env.CHAT_STATE_DEMO.delete(sessionKey);
          return new Response(JSON.stringify({ 
            reply: userState.lang === "en" ? "Flow cancelled.\n\n" + t.welcome : "Proceso cancelado.\n\n" + t.welcome 
          }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        // 3. DOBLE VERIFICACIÓN INTERMEDIA (Correo y Teléfono)
        // Pasos de confirmación temporal (ej: tras pedir email [paso 2] o teléfono [paso 3])
        if (userState.step === 2.5 || userState.step === 3.5) {
          if (["1", "SÍ", "SI", "YES"].includes(inputUpper)) {
            // Confirmado, avanzar al siguiente paso real
            userState.step = userState.step === 2.5 ? 3 : 4;
          } else if (["2", "NO"].includes(inputUpper)) {
            // Rechazado, retroceder para reescribir
            userState.step = userState.step === 2.5 ? 2 : 3;
            const retryMsg = userState.lang === "en" ? "Let's fix it. Enter it again:" : "Corrijámoslo. Ingrésalo nuevamente:";
            await env.CHAT_STATE_DEMO.put(sessionKey, JSON.stringify({ state: userState, timestamp: now }), { expirationTtl: SESSION_TTL });
            return new Response(JSON.stringify({ reply: retryMsg }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
          } else {
            const promptVerify = userState.lang === "en" ? "Please confirm: 1️⃣ Yes / 2️⃣ No" : "Por favor confirma: 1️⃣ Sí / 2️⃣ No";
            return new Response(JSON.stringify({ reply: promptVerify }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }
        }

        // PASO 1: Captura de Nombre
        if (userState.step === 1) {
          const err = validateField(1, input, userState.lang);
          if (err) return new Response(JSON.stringify({ reply: err }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
          
          userState.leadData.name = input;
          userState.step = 2; // Siguiente: Email
          await env.CHAT_STATE_DEMO.put(sessionKey, JSON.stringify({ state: userState, timestamp: now }), { expirationTtl: SESSION_TTL });

          const reply = userState.lang === "en"
            ? `Great, **${input}**. What is your **Email Address**?`
            : `Mucho gusto, **${input}**. ¿Cuál es tu **Correo Electrónico**?`;
          return new Response(JSON.stringify({ reply }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        // PASO 2: Captura de Email + Doble Verificación (2.5)
        else if (userState.step === 2) {
          const err = validateField(2, input, userState.lang);
          if (err) return new Response(JSON.stringify({ reply: err }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

          userState.leadData.email = input;
          userState.step = 2.5; // Estado de verificación de Email
          await env.CHAT_STATE_DEMO.put(sessionKey, JSON.stringify({ state: userState, timestamp: now }), { expirationTtl: SESSION_TTL });

          const reply = userState.lang === "en"
            ? `You entered: **${input}**\nIs this correct?\n1️⃣ **Yes**\n2️⃣ **No (Change it)**`
            : `Ingresaste: **${input}**\n¿Es correcto?\n1️⃣ **Sí**\n2️⃣ **No (Corregir)**`;
          return new Response(JSON.stringify({ reply }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        // PASO 3: Captura de Teléfono + Doble Verificación (3.5)
        else if (userState.step === 3) {
          const err = validateField(3, input, userState.lang);
          if (err) return new Response(JSON.stringify({ reply: err }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

          userState.leadData.phone = input;
          userState.step = 3.5; // Estado de verificación de Teléfono
          await env.CHAT_STATE_DEMO.put(sessionKey, JSON.stringify({ state: userState, timestamp: now }), { expirationTtl: SESSION_TTL });

          const reply = userState.lang === "en"
            ? `You entered phone: **${input}**\nIs this correct?\n1️⃣ **Yes**\n2️⃣ **No (Change it)**`
            : `Ingresaste el teléfono: **${input}**\n¿Es correcto?\n1️⃣ **Sí**\n2️⃣ **No (Corregir)**`;
          return new Response(JSON.stringify({ reply }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        // PASO 4: Captura de Empresa
        else if (userState.step === 4) {
          const err = validateField(4, input, userState.lang);
          if (err) return new Response(JSON.stringify({ reply: err }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

          userState.leadData.company = input;
          userState.step = 5; // Siguiente: País
          await env.CHAT_STATE_DEMO.put(sessionKey, JSON.stringify({ state: userState, timestamp: now }), { expirationTtl: SESSION_TTL });

          const reply = userState.lang === "en" ? "What **Country** are you located in?" : "¿De qué **País** nos escribes?";
          return new Response(JSON.stringify({ reply }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        // PASO 5: Captura de País -> Lleva al Mensaje del Proyecto
        else if (userState.step === 5) {
          const err = validateField(5, input, userState.lang);
          if (err) return new Response(JSON.stringify({ reply: err }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

          userState.leadData.country = input;
          userState.step = 6; // Siguiente: Mensaje / Caso de Uso
          await env.CHAT_STATE_DEMO.put(sessionKey, JSON.stringify({ state: userState, timestamp: now }), { expirationTtl: SESSION_TTL });

          const reply = userState.lang === "en"
            ? "Finally, describe your **Automation Use Case / Project** (Max 600 chars):"
            : "Por último, describe brevemente tu **Caso de Uso / Proyecto** (Máx. 600 caracteres):";
          return new Response(JSON.stringify({ reply }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        // PASO 6: Recepción del Mensaje / Bifurcación con IA (Resumen Automático)
        else if (userState.step === 6) {
          let projectMessage = input;

          // Si el usuario venía conversando y presionó AGENDAR, el sistema generó un resumen previo.
          // Validamos longitud estricta del mensaje resultante (máx 600 caracteres)
          const err = validateField(6, projectMessage, userState.lang);
          if (err) {
            userState.step = 6;
            await env.CHAT_STATE_DEMO.put(sessionKey, JSON.stringify({ state: userState, timestamp: now }), { expirationTtl: SESSION_TTL });
            return new Response(JSON.stringify({ reply: err }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }

          userState.leadData.message = projectMessage;
          userState.step = 7; // Paso 7: Revisión final previa a guardar en D1
          await env.CHAT_STATE_DEMO.put(sessionKey, JSON.stringify({ state: userState, timestamp: now }), { expirationTtl: SESSION_TTL });

          const ld = userState.leadData;
          const reviewMsg = userState.lang === "en"
            ? `📋 **Final Review of your Lead Data:**\n\n- **Name:** ${ld.name}\n- **Email:** ${ld.email}\n- **Phone:** ${ld.phone}\n- **Company:** ${ld.company}\n- **Country:** ${ld.country}\n- **Message:** ${ld.message}\n\nDo you want to confirm and send this data?\n7️⃣ **Confirm and Send**\n8️⃣ **Cancel / Modify**`
            : `📋 **Revisión Final de tus Datos:**\n\n- **Nombre:** ${ld.name}\n- **Correo:** ${ld.email}\n- **Teléfono:** ${ld.phone}\n- **Empresa:** ${ld.company}\n- **País:** ${ld.country}\n- **Mensaje:** ${ld.message}\n\n¿Deseas confirmar y registrar estos datos?\n7️⃣ **Confirmar y Enviar**\n8️⃣ **Cancelar / Modificar**`;

          return new Response(JSON.stringify({ reply: reviewMsg }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        // PASO 7 y 8: Cierre y Control del Lead (Guardado en D1 y Google Sheets en segundo plano)
        else if (userState.step === 7) {
          if (["7", "CONFIRMAR", "ENVIAR", "CONFIRM", "SEND"].includes(inputUpper)) {
            let insertStatus = "success";
            let errorMessage = "";

            // 1. Guardar en Base de Datos D1 (Si está configurada en env.DB)
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
                console.error("D1 Error:", dbErr.message);
                // No detenemos el flujo principal si D1 falla, pero registramos el warning
              }
            }

            // 2. Sincronización en segundo plano con Google Sheets (ctx.waitUntil)
            if (appsScriptUrl) {
              ctx.waitUntil(
                fetch(appsScriptUrl, {
                  method: "POST",
                  headers: { "Content-Type": "text/plain;charset=utf-8" },
                  body: JSON.stringify(userState.leadData),
                  redirect: "follow"
                }).catch(e => console.error("Google Sheets Background Sync Error:", e))
              );
            }

            // Limpiar estado de sesión
            await env.CHAT_STATE_DEMO.delete(sessionKey);

            const successMsg = userState.lang === "en"
              ? `✅ **Lead Successfully Logged!**\n\nThank you! Your details have been saved securely.\n\n📊 **View live Google Sheet:**\n${PUBLIC_GOOGLE_SHEET_URL}\n\n*(Type **'MENU'** to restart)*`
              : `✅ **¡Lead Registrado con Éxito!**\n\n¡Gracias! Tus datos han sido guardados de forma segura.\n\n📊 **Ver hoja de cálculo en vivo:**\n${PUBLIC_GOOGLE_SHEET_URL}\n\n*(Escribe **'MENU'** para reiniciar)*`;

            return new Response(JSON.stringify({ reply: successMsg }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

          } else if (["8", "CANCELAR", "CANCEL", "MODIFICAR"].includes(inputUpper)) {
            await env.CHAT_STATE_DEMO.delete(sessionKey);
            return new Response(JSON.stringify({ 
              reply: userState.lang === "en" ? "Process cancelled. Type 'SCHEDULE' to start over." : "Proceso cancelado. Escribe 'AGENDAR' para iniciar nuevamente." 
            }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
          } else {
            const promptChoice = userState.lang === "en" ? "Please choose: 7️⃣ Confirm and Send / 8️⃣ Cancel" : "Por favor elige: 7️⃣ Confirmar y Enviar / 8️⃣ Cancelar";
            return new Response(JSON.stringify({ reply: promptChoice }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }
        }
      }

      // ===================================================================
      // B. MENÚ GENERAL Y CONSULTAS IA (step === 0)
      // ===================================================================

      // Cambio manual de idioma
      if (["LANG ES", "ESPAÑOL", "SPANISH", "/ES", "1"].includes(inputUpper) && !input.includes("AGENDAR")) {
        userState.lang = "es";
      } else if (["LANG EN", "ENGLISH", "INGLES", "/EN", "2"].includes(inputUpper)) {
        userState.lang = "en";
      }

      userState.leadData.language = userState.lang;
      t = locales[userState.lang];

      // 4. BIFURCACIÓN INTELIGENTE AL AGENDAR
      if (["TEST", "DEMO", "AGENDAR", "SCHEDULE"].includes(inputUpper)) {
        userState.step = 1; // Iniciar paso 1 (Nombre)
        
        let initialMessage = "";
        // Si hay historial técnico previo con la IA, usamos Llama 3.1 para resumir la charla en primera persona (< 600 chars)
        if (userState.history && userState.history.length > 2 && env.AI_DEMO) {
          try {
            const summaryPrompt = [
              { role: "system", content: "Summarize the user's technical questions and automation interests from this chat history into a concise first-person project description (under 500 characters)." },
              ...userState.history
            ];
            const aiSummary = await env.AI_DEMO.run("@cf/meta/llama-3.1-8b-instruct-fp8", { messages: summaryPrompt });
            if (aiSummary?.response) {
              initialMessage = aiSummary.response.trim();
            }
          } catch (e) {
            console.error("AI Summary Error:", e);
          }
        }

        if (initialMessage) {
          // Si se autogeneró un resumen técnico exitoso, lo pre-cargamos y pasamos directo a pedir los datos de contacto
          userState.leadData.message = initialMessage;
        }

        await env.CHAT_STATE_DEMO.put(sessionKey, JSON.stringify({ state: userState, timestamp: now }), { expirationTtl: SESSION_TTL });

        const reply = userState.lang === "en"
          ? `📥 **Lead Capture Demo**\n${initialMessage ? `_Auto-generated project summary from our chat:_ "${initialMessage}"\n\n` : ""}What is your **Full Name / Company**?`
          : `📥 **Demostración de Captura de Lead**\n${initialMessage ? `_Resumen de tu proyecto basado en el chat:_ "${initialMessage}"\n\n` : ""}¿Cuál es tu **Nombre Completo / Empresa**?`;

        return new Response(JSON.stringify({ reply }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Manejo de Menú Principal / Bienvenida
      let reply = "";
      if (!input || inputUpper === "MENU") {
        reply = t.welcome;
      } else if (input === "1" || inputUpper === "ES") {
        userState.lang = "es";
        await env.CHAT_STATE_DEMO.put(sessionKey, JSON.stringify({ state: userState, timestamp: now }), { expirationTtl: SESSION_TTL });
        reply = t.intro;
      } else if (input === "2" || inputUpper === "EN") {
        userState.lang = "en";
        await env.CHAT_STATE_DEMO.put(sessionKey, JSON.stringify({ state: userState, timestamp: now }), { expirationTtl: SESSION_TTL });
        reply = t.intro;
      } else {
        // Guardar historial temporal de la conversación para la memoria de Llama 3.1
        if (!userState.history) userState.history = [];
        userState.history.push({ role: "user", content: input });
        if (userState.history.length > 6) userState.history.shift(); // Mantener últimos 6 mensajes

        const aiResponse = await env.AI_DEMO.run("@cf/meta/llama-3.1-8b-instruct-fp8", {
          messages: [
            { role: "system", content: `${t.aiSystemPrompt}\n\nHoja pública de consulta: ${PUBLIC_GOOGLE_SHEET_URL}` },
            ...userState.history
          ],
        });

        reply = `🤖 **MARLA:** ${aiResponse.response}`;
        userState.history.push({ role: "assistant", content: aiResponse.response });
      }

      await env.CHAT_STATE_DEMO.put(sessionKey, JSON.stringify({ state: userState, timestamp: now }), { expirationTtl: SESSION_TTL });

      return new Response(JSON.stringify({ reply }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } catch (err) {
      console.error("Worker Global Error:", err);
      return new Response(JSON.stringify({ reply: "Error procesando la solicitud en el Worker. ⚠️" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }
};