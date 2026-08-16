# Omnichannel AI Agent Ecosystem
### AI Automation, Chatbots & Data-Driven Workflows for Business Operations

![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Google Sheets](https://img.shields.io/badge/Google_Sheets-34A853?style=for-the-badge&logo=googlesheets&logoColor=white)
![Serverless](https://img.shields.io/badge/Serverless-FF4F00?style=for-the-badge&logo=serverless&logoColor=white)

---

## Live Demo & Project Overview

This repository implements an **Omnichannel AI Agent Ecosystem** designed to handle multi-lingual customer interactions, capture structured leads, and sync data directly to operational data stores in real time via serverless edge computing.

**Interactive Experience:** Load `index.html` to interact live with **MARLA** (Multi-lingual Agentic Responsive Lead Assistant), test AI processing, and execute an automated insertion directly into our live Google Sheets database.

This project connects directly with the broader data stack:
- `market-intelligence-data-warehouse` → Centralized storage foundation
- `business-intelligence-ops` → Dashboards & analytics reporting
- `omnichannel-ai-agent-ecosystemV2` → Automation & AI Edge Agents (this repo)

---

## Business Problem

Many companies struggle with:
- Manual customer support workflows and slow response times.
- Unstructured incoming data from chats, messaging, and forms.
- Fragmented lead capture with no automatic database persistence.
- Time-consuming manual data entry processes.

---

## Solution & Workflow

An automated, serverless pipeline that handles interactions from end to end:

1. **User Input:** Client interacts through the web UI (`index.html`) in Spanish or English.
2. **Edge Processing:** Cloudflare Workers coordinate state machines (`CHAT_STATE_DEMO`) and session management.
3. **AI Inference:** Requests are processed using **Llama 3.1 8B Instruct** (`@cf/meta/llama-3.1-8b-instruct-fp8`) for natural language understanding and response generation.
4. **Data Structuring:** Multi-turn workflows prompt the user for key lead details (Name, Phone, Use Case).
5. **Persistence & Integration:** Structured payloads are sent via HTTP POST to a Google Apps Script Webhook, appending rows instantly to Google Sheets.

---

## Architecture

```text
┌─────────────────────────┐          ┌─────────────────────────────────┐          ┌───────────────────────────┐
│  Client Frontend (UI)   │  HTTPS   │    Cloudflare Workers API       │   AI API │    Cloudflare Workers AI  │
│  (Tailwind CSS / JS)    │ ───────> │  (JavaScript / ES Modules)      │ ───────> │  (Llama 3.1 8B Instruct)  │
└─────────────────────────┘          └──────────────┬──────────────────┘          └───────────────────────────┘
                                                    │
                                                    │ KV State Management (`CHAT_STATE_DEMO`)
                                                    ▼
                                     ┌─────────────────────────────┐
                                     │    Google Apps Script API   │
                                     └──────────────┬──────────────┘
                                                    │
                                                    ▼
                                     ┌─────────────────────────────┐
                                     │   Google Sheets Data Store  │
                                     │   (Live Lead Sync & Log)    │
                                     └─────────────────────────────┘
```
---

## Repository Structure

```text
omnichannel-ai-agent-ecosystemV2/
├── index.html          # Web frontend / Live chat UI (Tailwind CSS)
├── package.json        # Node.js dependencies and wrangler scripts
├── README.md           # Project documentation and architecture guide
├── src/
│   └── workers/
│       ├── index.js    # Cloudflare Worker entry point & state machine
│       └── locales/
│           ├── en.js   # English localization & AI system prompts
│           └── es.js   # Spanish localization & AI system prompts
└── wrangler.toml       # Cloudflare Workers configuration & KV bindings
```
---

## Key Features

Edge-native Serverless Execution: Powered by Cloudflare Workers for sub-millisecond response times.

Multilingual AI Agents (MARLA): Integrated with Llama 3.1 to answer technical ecosystem queries in Spanish and English.

Persistent Conversational State: Managed via Cloudflare Workers KV bindings (CHAT_STATE_DEMO).

Real-Time Database Sync: Automated lead ingestion into Google Sheets via Google Apps Script Webhooks.

Interactive Web Interface: Modern, responsive chat component built with Tailwind CSS and FontAwesome.

--- 

## 💬 Example Conversation & Demo Flow
Initialization & Language Selection
User: /EN

MARLA:

Awesome! I am ready to demonstrate the core architecture of this ecosystem:
• Customer Support Automation: Auto-responses and ticket classification.
• Lead Management: Capture, qualification, and structured logging in Google Sheets.
• Internal Operations: Serverless workflows and integration with Data Warehouses.

Feel free to ask any technical question about the repo or type 'SCHEDULE' to test the Lead Capture workflow.

---

## Triggering the Lead Workflow
User: SCHEDULE

MARLA:

📥 Lead Capture Demo (Google Sheets API)

What is your Full Name / Company?

Successful Execution & Persistence
User: Alejandro Duhalde -> +51999888777 -> Omnichannel AI Support Integration

MARLA:
✅ Lead successfully logged!

Your details have been saved to our live Google Sheet.

📊 View inserted record:
Google Sheets Live Log

---

## Tech Stack

- Compute & Routing: Cloudflare Workers (wrangler)
- AI Inference: Cloudflare Workers AI (Llama 3.1 8B Instruct)
- State Storage: Cloudflare Workers KV
- Database & Backend Integration: Google Apps Script Web App & Google Sheets API
- Frontend UI: HTML5, Tailwind CSS, JavaScript (ES6+)