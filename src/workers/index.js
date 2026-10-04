import { es } from "./locales/es.js";
import { en } from "./locales/en.js";

const PUBLIC_GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/19_ITGf-0SJcMiJMvE5Ih7O7TzCo7bbUdqcHuiiuxn6g/edit?usp=sharing";

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
      const { message, userId, lang: requestedLang } = await request.json();
      const input = (message || "").trim();
      const sessionKey = `user_state:${userId || 'default_user'}`;

      // 1. Obtener estado previo desde KV (CHAT_STATE_DEMO)
      let userState = await env.CHAT_STATE_DEMO.get(sessionKey, { type: "json" });

      if (!userState) {
        userState = {
          step: 0,
          lang: requestedLang || "es",
          leadData: { name: "", phone: "", message: "", language: "es" }
        };
      }

      const inputUpper = input.toUpperCase();

      // =========================================================
      // A. FLUJO DEL FORMULARIO (step > 0)
      // =========================================================
      if (userState.step > 0) {

        if (["CANCELAR", "CANCEL", "EXIT", "MENU"].includes(inputUpper)) {
          await env.CHAT_STATE_DEMO.delete(sessionKey);
          let t = (userState.lang === "en") ? en : es;
          return new Response(JSON.stringify({ 
            reply: userState.lang === "en" ? "Flow cancelled.\n\n" + t.welcome : "Proceso cancelado.\n\n" + t.welcome 
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        // Paso 1: Captura de Nombre -> Solicitar Teléfono
        if (userState.step === 1) {
          userState.leadData.name = input;
          userState.step = 2;
          await env.CHAT_STATE_DEMO.put(sessionKey, JSON.stringify(userState));

          const reply = userState.lang === "en"
            ? `Great, **${input}**. What is your **Phone Number / WhatsApp**?`
            : `Mucho gusto, **${input}**. ¿A qué **Teléfono / WhatsApp** de contacto debemos registrar el Lead?`;

          return new Response(JSON.stringify({ reply }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        // Paso 2: Captura de Teléfono -> Solicitar Caso de Uso
        if (userState.step === 2) {
          userState.leadData.phone = input;
          userState.step = 3;
          await env.CHAT_STATE_DEMO.put(sessionKey, JSON.stringify(userState));

          const reply = userState.lang === "en"
            ? "Got it. Lastly, enter a short description: What **Automation Use Case** are you testing?"
            : "Perfecto. Por último, ingresa una breve descripción: ¿Qué **Caso de Uso de Automatización** deseas probar?";

          return new Response(JSON.stringify({ reply }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        // Paso 3: Captura de Caso de Uso -> Enviar a Google Apps Script y Retornar Estado Real
        if (userState.step === 3) {
          userState.leadData.message = input;

          let insertStatus = "success";
          let errorMessage = "";

          if (!appsScriptUrl) {
            insertStatus = "error";
            errorMessage = "Variable GOOGLE_APPS_SCRIPT_WEBAPP_URL no configurada.";
          } else {
            try {
              const res = await fetch(appsScriptUrl, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify(userState.leadData),
                redirect: "follow"
              });

              if (res.ok) {
                const resData = await res.json().catch(() => ({}));
                if (resData.status === "error") {
                  insertStatus = "error";
                  errorMessage = resData.error || "Error reportado por Google Apps Script.";
                }
              } else {
                insertStatus = "error";
                errorMessage = `HTTP Error ${res.status}: No se pudo completar la petición.`;
              }
            } catch (e) {
              insertStatus = "error";
              errorMessage = e.message || "Excepción de red al conectar con Google Sheets API.";
            }
          }

          // Eliminar el estado activo del usuario en KV
          await env.CHAT_STATE_DEMO.delete(sessionKey);

          // Construcción de respuesta en pantalla según el estado
          let confirmMsg = "";

          if (insertStatus === "success") {
            confirmMsg = userState.lang === "en"
              ? `✅ **Lead successfully logged!**\n\nYour details have been saved to our live Google Sheet.\n\n📊 **View inserted record:**\n${PUBLIC_GOOGLE_SHEET_URL}`
              : `✅ **¡Lead registrado con éxito!**\n\nTus datos han sido guardados en nuestra hoja de cálculo en vivo.\n\n📊 **Abre la hoja para ver el dato insertado:**\n${PUBLIC_GOOGLE_SHEET_URL}`;
          } else {
            confirmMsg = userState.lang === "en"
              ? `⚠️ **Error logging lead into Google Sheets:**\n\n\`${errorMessage}\`\n\nPlease verify the API integration or try again.`
              : `⚠️ **Error al insertar el registro en Google Sheets:**\n\n\`${errorMessage}\`\n\nPor favor verifica la integración de la API o reintenta nuevamente.`;
          }

          return new Response(JSON.stringify({ reply: confirmMsg }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
      }

      // =========================================================
      // B. MENÚ GENERAL Y CONSULTAS IA (step === 0)
      // =========================================================

      if (["LANG ES", "ESPAÑOL", "SPANISH", "/ES"].includes(inputUpper)) {
        userState.lang = "es";
      } else if (["LANG EN", "ENGLISH", "INGLES", "/EN"].includes(inputUpper)) {
        userState.lang = "en";
      }

      userState.leadData.language = userState.lang;
      let t = (userState.lang === "en") ? en : es;

      if (["TEST", "DEMO", "AGENDAR", "SCHEDULE"].includes(inputUpper)) {
        userState.step = 1;
        await env.CHAT_STATE_DEMO.put(sessionKey, JSON.stringify(userState));

        const reply = userState.lang === "en"
          ? "📥 **Lead Capture Demo (Google Sheets API)**\n\nWhat is your **Full Name / Company**?"
          : "📥 **Demostración de Captura de Lead (Google Sheets API)**\n\nPara comenzar con el registro en la base de datos, ¿cuál es tu **Nombre Completo / Empresa**?";

        return new Response(JSON.stringify({ reply }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      await env.CHAT_STATE_DEMO.put(sessionKey, JSON.stringify(userState));

      let reply = "";
      if (!input || inputUpper === "MENU") {
        reply = t.welcome;
      } else if (input === "1" || inputUpper === "ES") {
        userState.lang = "es";
        await env.CHAT_STATE_DEMO.put(sessionKey, JSON.stringify(userState));
        reply = es.intro;
      } else if (input === "2" || inputUpper === "EN") {
        userState.lang = "en";
        await env.CHAT_STATE_DEMO.put(sessionKey, JSON.stringify(userState));
        reply = en.intro;
      } else {
        const aiResponse = await env.AI_DEMO.run("@cf/meta/llama-3.1-8b-instruct-fp8", {
          messages: [
            { 
              role: "system", 
              content: `${t.aiSystemPrompt}\n\nHoja pública de consulta: ${PUBLIC_GOOGLE_SHEET_URL}` 
            },
            { role: "user", content: input }
          ],
        });

        reply = `🤖 **MARLA (AI Agent Ecosystem):** ${aiResponse.response}`;
      }

      return new Response(JSON.stringify({ reply }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } catch (err) {
      return new Response(JSON.stringify({ reply: "Error procesando la solicitud en el Worker. ⚠️" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }
};