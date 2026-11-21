# Omnichannel AI Agent Ecosystem
### AI Automation, Chatbots & Data-Driven Workflows for Business Operations

![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Google Sheets](https://img.shields.io/badge/Google_Sheets-34A853?style=for-the-badge&logo=googlesheets&logoColor=white)
![Serverless](https://img.shields.io/badge/Serverless-FF4F00?style=for-the-badge&logo=serverless&logoColor=white)

---

## 🎯 Overview: From Functional Demo to Scalable Enterprise Ecosystem

This repository implements the core foundation (**Demo / MVP**) of an **Omnichannel AI Agent Ecosystem** designed to handle bilingual customer interactions, generate automated AI project summaries, capture validated leads, and sync data in real time via serverless edge computing.

> 💡 **Modular & Scalable Core:** While this implementation operates as a self-contained functional demo (connected to Cloudflare D1 and Google Sheets), its webhook- and REST API-driven architecture is built as an extensible engine capable of scaling into complex enterprise operations: integration with **Chatwoot** for true omnichannel support (WhatsApp, Instagram, Web, Telegram), advanced workflow orchestration in **n8n**, specialized **multi-agent systems**, and synchronization with corporate CRMs.

**Interactive Experience:** Load `index.html` to interact live with **MARLA** (*Multi-lingual Agentic Responsive Lead Assistant*), ask technical questions about the architecture, and execute an automated insertion directly into our live Google Sheets database.

---

## Business Problem

Many organizations struggle with:
- Manual customer support workflows and slow response times across multiple channels.
- Unstructured incoming requirements from chats, messaging apps, and forms.
- Fragmented lead capture lacking strict quality assurance (QA) validation and automatic database persistence.
- Disconnection between AI assistants, human agent inboxes, and internal automation tools.

---

## Current Solution & Workflow (Demo Core)

An automated, serverless pipeline that manages conversational context and lead ingestion from end to end:

1. **User Input:** The user interacts through the web interface (`index.html`) in Spanish or English (with dynamic switching via commands or menu options).
2. **Edge State Machine & Inactivity Control:** Cloudflare Workers orchestrates multi-step conversational states via Cloudflare KV (`CHAT_STATE_DEMO`), enforcing a strict 5-minute (300s) inactivity reset and a 24-hour hard TTL.
3. **AI Inference & Auto-Summary:** Open technical queries and chat context are processed through Cloudflare Workers AI using **Gemma 4 26B** (`@cf/google/gemma-4-26b-a4b-it`, compatible with OpenAI-style reasoning outputs). Upon triggering the registration flow (`AGENDAR` / `SCHEDULE`), MARLA automatically drafts a first-person project summary based on the chat history.
4. **Strict QA Validation & Double Verification:** A guided state machine captures and validates Name, Email Address (with double confirmation), Phone/WhatsApp (with double confirmation), Company, Country, and Project Use Case.
5. **Dual Persistence & Asynchronous Sync:** Upon final confirmation, leads are inserted directly into Cloudflare D1 (`env.DB`) and dispatched asynchronously via `ctx.waitUntil()` to a Google Apps Script Webhook to append rows in Google Sheets without adding latency for the user.

---

## Current Architecture & Scalability Path

```text
┌─────────────────────────┐          ┌─────────────────────────────────┐          ┌───────────────────────────┐
│  Frontend Demo (Web)    │  HTTPS   │    Cloudflare Workers API       │   AI API │    Cloudflare Workers AI  │
│  (Or Chatwoot Channels) │ ───────> │  (Router, KV State & QA)        │ ───────> │  (Gemma 4 / Multi-Agent)  │
└─────────────────────────┘          └───────┬─────────────────┬───────┘          └───────────────────────────┘
                                             │                 │
                       KV State & TTL        │                 │ SQLite Insert (`env.DB`)
                      (`CHAT_STATE_DEMO`)    ▼                 ▼
                                     ┌───────────────┐ ┌───────────────────────┐
                                     │ Cloudflare KV │ │ D1 Database           │
                                     └───────────────┘ └───────────────────────┘
                                             │
                                             │ Async Webhooks (`ctx.waitUntil`)
                                             ├──────────────────────────────────────────┐
                                             ▼                                          ▼
                             ┌─────────────────────────────┐            ┌───────────────────────────────┐
                             │    Google Apps Script API   │            │   🚀 Enterprise Scalability   │
                             │   (Google Sheets Live Sync) │            │  • n8n (Automated Workflows)  │
                             └─────────────────────────────┘            │  • Chatwoot (Human Handoff)   │
                                                                        │  • CRMs (HubSpot / Salesforce)│
                                                                        └───────────────────────────────┘
```

---

## 🚀 Scalability Potential & Enterprise Evolution

This project lays the technical groundwork to evolve into a full-fledged enterprise platform through decoupled integrations:

- 💬 **True Omnichannel Support with Chatwoot:** By connecting this Worker as an *Agent Bot* in Chatwoot, the exact same AI engine can simultaneously serve WhatsApp Business, Instagram DM, Facebook Messenger, Telegram, and Webchat, while enabling seamless *human handoff* to live agents in a unified inbox.
- ⚡ **Automated Workflow Orchestration with n8n:** The asynchronous webhook (`ctx.waitUntil`) allows replacing or complementing Google Apps Script by connecting directly to **n8n** to trigger complex automations: transactional emails, Slack/Teams notifications, deal creation in CRMs (HubSpot, Pipedrive, Salesforce), and automated scheduling in Google Calendar or Cal.com.
- 🧠 **Specialized Multi-Agent Architecture:** The Worker's router can be expanded to delegate tasks to distinct specialized sub-agents based on user intent:
  - **Qualification Agent (SDR):** Company data enrichment and lead scoring.
  - **Technical Support Agent (RAG):** Internal documentation querying via Cloudflare Vectorize.
  - **Operations / Quoting Agent:** Dynamic generation of commercial proposals and payment links.
- 📊 **Advanced Analytics & Auditing:** Leveraging Cloudflare D1 and Analytics Engine to measure conversion rates, response times, frequent intents, and channel performance.

---

## Repository Structure

```text
omnichannel-ai-agent-ecosystem/
├── index.html              # Interactive frontend chat interface (Demo UI)
├── package.json            # Project dependencies and scripts
├── README.md               # Technical documentation and roadmap
├── src/
│   └── workers/
│       └── index.js        # Cloudflare Worker (AI, State Machine, D1 & Webhooks)
└── wrangler.toml           # Cloudflare Workers, AI, and KV bindings configuration
```

---

## Key Features (Current Implementation)

- **Edge-Native Serverless Execution:** Powered by Cloudflare Workers (`compatibility_date = "2026-06-01"`) for ultra-low latency global response times.
- **Next-Gen Bilingual AI Agent (MARLA):** Powered by `@cf/google/gemma-4-26b-a4b-it` (swappable with Qwen 3.8 or DeepSeek V4.1) with strict domain guardrails and automatic `<think>` tag stripping.
- **AI-Assisted Lead Summarization:** Automatically synthesizes conversation history into a concise, first-person project description upon initiating lead capture, allowing the user to approve it or write it manually.
- **Strict Field Validation (QA) & Double Verification:** Enforces character length limits, regex validation for emails, minimum real numeric digit counts for phone numbers, and interactive confirmation steps (`1️⃣ Yes` / `2️⃣ No`) on critical contact details.
- **Smart Session & Inactivity Management:** Tracks timestamps in `CHAT_STATE_DEMO` (KV) to reset inactive sessions after 5 minutes, supporting clean cancellation commands (`CANCELAR`, `CANCEL`, `MENU`).
- **Dual Database & Webhook Persistence:** Combines relational edge storage (Cloudflare D1) with non-blocking synchronization to Google Sheets (or n8n) via `ctx.waitUntil()`.

---

## Configuration & Deployment (`wrangler.toml`)

Make sure to configure your bindings and secrets in Cloudflare before deploying:

```toml
name = "demo1-chatbot"
main = "src/workers/index.js"
compatibility_date = "2026-06-01"

[ai]
binding = "AI_DEMO"

[[kv_namespaces]]
binding = "CHAT_STATE_DEMO"
id = "YOUR_ID"

# Optional: Bind your D1 database for SQL persistence
# [[d1_databases]]
# binding = "DB"
# database_name = "leads_db"
# database_id = "<YOUR_D1_DATABASE_ID>"
```

### Environment Variables / Secrets

Set your webhook URL (Google Apps Script or n8n webhook) as a Worker secret:

```bash
npx wrangler secret put GOOGLE_APPS_SCRIPT_WEBAPP_URL
```