# WhatsApp Business Ecosystem 🚀

[![Cloudflare Workers](https://img.shields.io/badge/Edge-Cloudflare%20Workers-f38020?style=flat&logo=cloudflare)](https://workers.cloudflare.com/)
[![WhatsApp API](https://img.shields.io/badge/API-WhatsApp%20Cloud%20API-25D366?style=flat&logo=whatsapp)](https://business.whatsapp.com/)
[![Node.js](https://img.shields.io/badge/Runtime-Node.js-339933?style=flat&logo=nodedotjs)](https://nodejs.org/)
[![JavaScript](https://img.shields.io/badge/Language-JavaScript-F7DF1E?style=flat&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![n8n](https://img.shields.io/badge/Workflow-n8n-FF6D5A?style=flat&logo=n8n)](https://n8n.io/)
[![Chatwoot](https://img.shields.io/badge/CRM-Chatwoot-1F2937?style=flat&logo=chatwoot)](https://www.chatwoot.com/)
[![Google Sheets](https://img.shields.io/badge/Storage-Google%20Sheets-34A853?style=flat&logo=googlesheets)](https://www.google.com/sheets/about/)

Este repositorio centraliza la arquitectura técnica y funcional de un ecosistema integral de automatización para **WhatsApp Business**. El sistema está diseñado para escalar operaciones comerciales mediante el uso de tecnologías de borde (Edge Computing) y flujos de trabajo inteligentes.

---

## 🏗️ Arquitectura del Ecosistema

La solución integra tres pilares fundamentales que conviven en una infraestructura de alta disponibilidad:

### Diagrama de Flujo Técnico
```mermaid
graph TD
    A[WhatsApp Cloud API] -->|Webhooks| B(Cloudflare Workers)
    B -->|Filtrado y Seguridad| C{Core Node.js Engine}
    C -->|Módulo 1| D[Activity Control]
    C -->|Módulo 2| E[Lead Automation]
    C -->|Módulo 3| F[Booking System]
    D & E & F --> G[n8n Orquestador]
    G --> H[CRM / Google Sheets]
    C --> I[Chatwoot Inbox]