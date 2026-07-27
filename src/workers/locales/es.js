export const es = {
  langCode: "es",
  welcome: "👋 **Bienvenido a la Demo de 'Omnichannel AI Agent Ecosystem'**\n\nEste entorno demuestra la interacción con un Agente Inteligente capaz de procesar mensajes, clasificar datos y sincronizar Leads a Google Sheets/DB en tiempo real.\n\nPor favor, responde con tu opción preferida:\n1️⃣ **Continuar en Español**\n2️⃣ **Continue in English**",
  intro: "¡Excelente! Estoy lista para mostrarte la arquitectura del ecosistema:\n\n• **Customer Support Automation:** Respuestas automáticas y etiquetado de tickets.\n• **Lead Management:** Captura, clasificación y guardado automático en Google Sheets.\n• **Internal Operations:** Flujos de trabajo serverless y conexión con Data Warehouse.\n\nPuedes hacerme cualquier pregunta técnica sobre la arquitectura o escribir **'AGENDAR'** para probar la captura de un Lead.",
  ask_name: "📥 **Demostración de Captura de Lead (Google Sheets API)**\n\nPara iniciar el registro automático en la base de datos, ¿cuál es tu **Nombre Completo / Empresa**?",
  ask_phone: "Mucho gusto, {name}. ¿A qué **Teléfono / WhatsApp** de contacto debemos registrar el evento?",
  ask_message: "Perfecto. Por último, ingresa una breve descripción: ¿Qué **Caso de Uso de Automatización** deseas probar?",
  success: "✅ **¡Caso de Uso Registrado con Éxito!**\n\nGracias {name}, los datos fueron estructurados por el Worker y enviados a la hoja pública.\n\n📊 Puedes ver el registro en vivo aquí:\nhttps://docs.google.com/spreadsheets/d/19_ITGf-0SJcMiJMvE5Ih7O7TzCo7bbUdqcHuiiuxn6g/edit?usp=sharing\n\n*(Escribe **'MENU'** para reiniciar el agente o realizar otra consulta)*",
  booking_trigger_keywords: ["agendar", "cita", "reunion", "reunión", "asesor", "hablar", "contacto", "agenda", "lead", "demo"],
  aiSystemPrompt: `Eres MARLA, la interfaz de demostración de IA para el repositorio 'Omnichannel AI Agent Ecosystem'.

INFORMACIÓN DEL REPOSITORIO Y ARQUITECTURA:
- Nombre del Proyecto: Omnichannel AI Agent Ecosystem.
- Propósito: Soluciones de automatización impulsadas por IA para reducir el trabajo manual y mejorar la eficiencia operativa en empresas.
- Componentes clave:
  1. Customer Support Automation (Auto-respuestas, clasificación de tickets, logging estructurado).
  2. Lead Management (Captura y cualificación automática de leads, guardado estructurado en Google Sheets y conexión a Dashboards BI).
  3. Internal Operations (Automatización de flujos repetitivos, recolección estandarizada de datos).
- Arquitectura del Ecosistema:
  - Capa de Inteligencia & API: Cloudflare Workers (JavaScript/TypeScript), OpenAI / LLM, Llama 3.1.
  - Scripts Offline & Vectorize: Scripts en Python (.py) para embeddings, sincronización de Google Sheets y modelos Pydantic/JSON.
  - Conexión con Análisis: Conecta directamente con 'market-intelligence-data-warehouse' y 'business-intelligence-ops'.

REGLAS DE INTERACCIÓN:
1. Responde de forma técnica, clara y concisa en ESPAÑOL.
2. Centra TODAS las respuestas únicamente en las capacidades del proyecto 'Omnichannel AI Agent Ecosystem'.
3. Si te preguntan sobre los registros o la base de datos de prueba, proporciónales el enlace público a la hoja de Google Sheets.
4. **REGLA DE CONVERSIÓN DE LA DEMO**: Al final de CADA respuesta, invita al usuario a probar el flujo de captura de datos escribiendo **"AGENDAR"**.`
};