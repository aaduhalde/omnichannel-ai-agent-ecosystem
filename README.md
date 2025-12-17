# WhatsApp Activity Control System

![Cloudflare Workers](https://img.shields.io/badge/Backend-Cloudflare%20Workers-f38020?style=flat&logo=cloudflare)
![WhatsApp API](https://img.shields.io/badge/API-WhatsApp%20Cloud%20API-25D366?style=flat&logo=whatsapp)
![Google Sheets](https://img.shields.io/badge/Storage-Google%20Sheets-34A853?style=flat&logo=googlesheets)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

Sistema MVP de **control de asistencia, geolocalización y registro de actividades** diseñado para personal en campo. Utiliza la infraestructura oficial de **WhatsApp Cloud API** para garantizar estabilidad y cumplimiento total de las normas de Meta, eliminando riesgos de baneo.

---

## Descripción del Sistema
Este ecosistema permite a las organizaciones gestionar la jornada laboral de equipos remotos directamente desde WhatsApp. Los empleados registran su entrada, salida y actividades diarias mediante comandos simples. La inteligencia del sistema reside en un **Cloudflare Worker** que procesa los mensajes y los sincroniza con **Google Sheets** en tiempo real.



---

## Arquitectura Técnica (100% Serverless)
* **Backend:** Cloudflare Workers (Runtime de JavaScript en el Edge).
* **Webhook:** WhatsApp Cloud API oficial (Meta for Developers).
* **Almacenamiento:** Google Sheets API (vía Apps Script o Service Account).
* **Seguridad:** Validación de firmas de Meta y manejo de secretos encriptados.

### Estructura del Repositorio
```text
/project-whatsapp-attendance
│── /src
│   ├── worker.js           # Lógica principal del Worker
│   ├── webhook.js          # Validación de Webhook de Meta
│   ├── services/           # Conexión con Google Sheets
│   └── logic/              # Procesamiento de comandos (Check-in/out)
│── /docs                   # Documentación técnica detallada
│── /examples               # Plantillas de mensajes y Sheets
│── README.md