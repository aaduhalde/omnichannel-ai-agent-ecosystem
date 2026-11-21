# Omnichannel AI Agent Ecosystem
### Automatización con IA, Chatbots y Flujos de Trabajo Basados en Datos para Operaciones Empresariales

![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Cloudflare D1](https://img.shields.io/badge/Cloudflare_D1-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![Google Sheets](https://img.shields.io/badge/Google_Sheets-34A853?style=for-the-badge&logo=googlesheets&logoColor=white)
![n8n & Chatwoot Ready](https://img.shields.io/badge/n8n_%26_Chatwoot-Ready-EA4B71?style=for-the-badge)

---

## 🎯 Visión General: De Demo Funcional a Ecosistema Empresarial Escalable

Este repositorio implementa la **arquitectura base (Demo / MVP)** de un **Ecosistema Omnicanal de Agentes de IA** (*Omnichannel AI Agent Ecosystem*) diseñado para gestionar interacciones bilingües con clientes, generar resúmenes automáticos de proyectos mediante IA, capturar *leads* validados y sincronizar datos en tiempo real mediante computación *serverless* en el borde (*edge*).

> **💡 Núcleo Modular y Escalable:** Aunque esta implementación actúa como una demostración funcional autocontenida (conectada a Cloudflare D1 y Google Sheets), su arquitectura basada en webhooks y APIs REST está diseñada como un **motor extensible** capaz de escalar hacia operaciones empresariales complejas: integración con **Chatwoot** para atención omnicanal (WhatsApp, Instagram, Web, Telegram), orquestación de flujos avanzados en **n8n**, sistemas **multi-agente especializados** y sincronización con CRMs corporativos.

**Experiencia Interactiva:** Carga `index.html` para interactuar en vivo con **MARLA** (*Multi-lingual Agentic Responsive Lead Assistant*), realizar consultas técnicas sobre la arquitectura y ejecutar una inserción automatizada directamente en nuestra base de datos en vivo de [Google Sheets](https://docs.google.com/spreadsheets/d/19_ITGf-0SJcMiJMvE5Ih7O7TzCo7bbUdqcHuiiuxn6g/edit?usp=sharing).

---

## Problema de Negocio

Muchas organizaciones enfrentan dificultades con:
- Flujos de soporte al cliente manuales y tiempos de respuesta lentos across múltiples canales.
- Requerimientos entrantes no estructurados provenientes de chats, mensajería y formularios.
- Captura de *leads* fragmentada sin validación estricta de calidad (QA) ni persistencia automática en bases de datos.
- Falta de conexión entre los asistentes de IA, las bandejas de agentes humanos y las herramientas de automatización interna.

---

## Solución y Flujo de Trabajo Actual (Base Demo)

Un *pipeline* automatizado y *serverless* que gestiona el contexto conversacional y la ingesta de *leads* de principio a fin:

1. **Entrada del Usuario:** El usuario interactúa a través de la interfaz web (`index.html`) en **Español** o **Inglés** (con cambio dinámico mediante comandos u opciones de menú).
2. **Máquina de Estados en el Borde y Control de Inactividad:** Cloudflare Workers orquesta los estados conversacionales de múltiples pasos mediante **Cloudflare KV** (`CHAT_STATE_DEMO`), incorporando un reinicio estricto por **inactividad de 5 minutos (300s)** y un TTL máximo de 24 horas.
3. **Inferencia de IA y Auto-Resumen:** Las consultas técnicas abiertas y el contexto de la charla se procesan mediante **Cloudflare Workers AI** utilizando **Gemma 4 26B** (`@cf/google/gemma-4-26b-a4b-it`, compatible con salidas de razonamiento estilo OpenAI). Al iniciar el flujo de registro (`AGENDAR` / `SCHEDULE`), MARLA redacta automáticamente un resumen del proyecto en primera persona basado en el historial del chat.
4. **Validación Estricta de QA y Doble Verificación:** Una máquina de estados guiada captura y valida **Nombre, Correo Electrónico (con doble confirmación), Teléfono/WhatsApp (con doble confirmación), Empresa, País y Caso de Uso del Proyecto**.
5. **Persistencia Dual y Sincronización Asíncrona:** Tras la confirmación final, los *leads* se insertan directamente en **Cloudflare D1** (`env.DB`) y se envían de forma asíncrona mediante `ctx.waitUntil()` a un **Webhook de Google Apps Script** para añadir filas en **Google Sheets** sin añadir latencia al usuario.

---

## Arquitectura Actual y Ruta de Escalabilidad

```text
┌─────────────────────────┐          ┌─────────────────────────────────┐          ┌───────────────────────────┐
│  Frontend Demo (Web)    │  HTTPS   │    Cloudflare Workers API       │   AI API │    Cloudflare Workers AI  │
│  (O Canales Chatwoot)   │ ───────> │  (Router, Estado KV y QA)       │ ───────> │  (Gemma 4 / Multi-Agente) │
└─────────────────────────┘          └───────┬─────────────────┬───────┘          └───────────────────────────┘
                                             │                 │
                       Estado KV y TTL       │                 │ Inserción SQLite (`env.DB`)
                      (`CHAT_STATE_DEMO`)    ▼                 ▼
                                     ┌───────────────┐ ┌───────────────────────┐
                                     │ Cloudflare KV │ │ Base de Datos D1      │
                                     └───────────────┘ └───────────────────────┘
                                             │
                                             │ Webhooks Asíncronos (`ctx.waitUntil`)
                                             ├──────────────────────────────────────────┐
                                             ▼                                          ▼
                             ┌─────────────────────────────┐            ┌───────────────────────────────┐
                             │    Google Apps Script API   │            │   🚀 Escalabilidad Enterprise  │
                             │   (Google Sheets Live Sync) │            │  • n8n (Flujos Automáticos)   │
                             └─────────────────────────────┘            │  • Chatwoot (Handoff Humano)  │
                                                                        │  • CRMs (HubSpot / Salesforce)│
                                                                        └───────────────────────────────┘
```

---

## 🚀 Potencial de Escalabilidad y Evolución Empresarial

Este proyecto sienta las bases técnicas para evolucionar hacia una plataforma empresarial completa mediante integraciones desacopladas:

* **💬 Omnicanalidad Real con Chatwoot:** Al conectar este Worker como un *Agent Bot* en **Chatwoot**, el mismo motor de IA puede atender simultáneamente **WhatsApp Business, Instagram DM, Facebook Messenger, Telegram y Webchat**, permitiendo además el escalamiento fluido (*human handoff*) hacia agentes humanos en una bandeja unificada.
* **⚡ Orquestación de Flujos Automáticos con n8n:** El webhook asíncrono (`ctx.waitUntil`) permite reemplazar o complementar Google Apps Script conectando directamente con **n8n** para disparar automatizaciones complejas: envío de correos transaccionales, notificaciones en Slack/Teams, creación de tratos en CRMs (HubSpot, Pipedrive, Salesforce) y agendamiento automático en Google Calendar o Cal.com.
* **🧠 Arquitectura Multi-Agente Especializada:** El enrutador del Worker puede expandirse para delegar tareas a distintos sub-agentes especializados según la intención del usuario:
  * *Agente de Calificación (SDR):* Enriquecimiento de datos de empresas y *lead scoring*.
  * *Agente de Soporte Técnico (RAG):* Consulta sobre documentación interna mediante **Cloudflare Vectorize**.
  * *Agente de Operaciones / Cotizaciones:* Generación dinámica de propuestas comerciales y enlaces de pago.
* **📊 Analítica y Auditoría Avanzada:** Aprovechamiento de **Cloudflare D1** y **Analytics Engine** para medir tasas de conversión, tiempos de respuesta, intenciones frecuentes y rendimiento por canal.

---

## Estructura del Repositorio

```text
omnichannel-ai-agent-ecosystem/
├── index.html              # Interfaz de chat interactiva en el frontend (Demo UI)
├── package.json            # Dependencias y scripts del proyecto
├── README.md               # Documentación técnica y hoja de ruta
├── src/
│   └── workers/
│       └── index.js        # Cloudflare Worker (IA, Máquina de Estados, D1 y Webhooks)
└── wrangler.toml           # Configuración de bindings de Cloudflare Workers, AI y KV
```

---

## Características Principales (Implementación Actual)

* **Ejecución Serverless Nativa en el Borde:** Impulsada por Cloudflare Workers (`compatibility_date = "2026-06-01"`) para tiempos de respuesta ultrarrápidos a nivel global.
* **Agente de IA Bilingüe de Nueva Generación (MARLA):** Potenciado por `@cf/google/gemma-4-26b-a4b-it` (intercambiable por Qwen 3.8 o DeepSeek V4.1) con reglas estrictas de dominio y limpieza automática de etiquetas `<think>`.
* **Resumen de Leads Asistido por IA:** Sintetiza automáticamente el historial de conversación en una descripción concisa del proyecto en primera persona al iniciar la captura del *lead*, permitiendo al usuario aprobarlo o escribirlo manualmente.
* **Validación Estricta de Campos (QA) y Doble Verificación:** Aplica límites de longitud, validación regex para correos, conteo mínimo de dígitos numéricos reales para teléfonos y pasos interactivos de confirmación (`1️⃣ Sí / 2️⃣ No`) en datos críticos de contacto.
* **Gestión Inteligente de Sesiones e Inactividad:** Monitorea marcas de tiempo en `CHAT_STATE_DEMO` (KV) para reiniciar sesiones inactivas tras 5 minutos, soportando comandos limpios de cancelación (`CANCELAR`, `CANCEL`, `MENU`).
* **Persistencia Dual en Base de Datos y Webhook:** Combina almacenamiento relacional en el borde (**Cloudflare D1**) con sincronización no bloqueante hacia **Google Sheets** (o **n8n**) mediante `ctx.waitUntil()`.

---

## Configuración y Despliegue (`wrangler.toml`)

Asegúrate de configurar tus *bindings* y secretos en Cloudflare antes de desplegar:

```toml
name = "demo1-chatbot"
main = "src/workers/index.js"
compatibility_date = "2026-06-01"

[ai]
binding = "AI_DEMO"

[[kv_namespaces]]
binding = "CHAT_STATE_DEMO"
id = "TU_ID"

# Opcional: Vincula tu base de datos D1 para persistencia SQL
# [[d1_databases]]
# binding = "DB"
# database_name = "leads_db"
# database_id = "<TU_D1_DATABASE_ID>"
```

### Variables de Entorno / Secretos

Configura la URL de tu webhook (Google Apps Script o webhook de **n8n**) como un secreto del Worker:

```bash
npx wrangler secret put GOOGLE_APPS_SCRIPT_WEBAPP_URL
```