[![Cloudflare Workers](https://img.shields.io/badge/Edge-Cloudflare%20Workers-f38020?style=flat&logo=cloudflare)](https://workers.cloudflare.com/)

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