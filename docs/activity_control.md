# 📍 Sistema de Control de Actividades por WhatsApp

[![WhatsApp API](https://img.shields.io/badge/Interfaz-WhatsApp-25D366?style=flat&logo=whatsapp)](https://business.whatsapp.com/)
[![Google Sheets](https://img.shields.io/badge/Data-Google%20Sheets-34A853?style=flat&logo=googlesheets)](https://www.google.com/sheets/about/)
[![Status](https://img.shields.io/badge/Estado-Listo%20para%20Usar-brightgreen?style=flat)](#)
[![Deployment](https://img.shields.io/badge/Supervisión-Tiempo%20Real-blue?style=flat)](#)

Solución digital diseñada para el **control de asistencia, reporte de actividades y geolocalización** de personal operativo. Elimina la necesidad de aplicaciones externas o capacitaciones complejas, utilizando WhatsApp como única interfaz de usuario.

---

## 🚀 Funcionalidades Principales

El sistema permite una gestión transparente y organizada de equipos en campo o remotos:

* **⏱️ Registro de Jornada:** Marcación de entrada y salida con un solo mensaje.
* **📝 Reporte de Actividades:** Carga de tareas diarias realizadas de forma estructurada.
* **📍 Ubicación y Tiempo:** Cada registro se asocia automáticamente con fecha, hora exacta y coordenadas de ubicación.
* **📊 Centralización Automática:** Toda la información se organiza en una planilla online (Google Sheets) accesible para la administración.
* **📱 Cero Curva de Aprendizaje:** El personal opera 100% desde su cuenta personal de WhatsApp.

---

## 🛠️ Arquitectura de la Solución

El sistema está construido para ser ligero y confiable, garantizando que no se pierda ningún registro:

1.  **Capa de Entrada (WhatsApp):** Recepción de mensajes y ubicación mediante la API.
2.  **Procesador Lógico:** Motor en Node.js que valida el formato y la identidad del empleado.
3.  **Almacenamiento (Cloud):** Sincronización inmediata con bases de datos en la nube para visualización administrativa.

---

## 📈 Potencial de Escalabilidad (Mejoras Disponibles)

Este sistema base puede evolucionar según las necesidades de supervisión:

### 📊 Reportes y Visualización
* **Dashboard de Asistencia:** Gráficos de puntualidad y horas trabajadas por empleado.
* **Mapa de Calor:** Visualización geográfica de dónde se encuentran los equipos en tiempo real.
* **Exportación de PDF:** Generación automática de reportes de actividad semanales o mensuales.

### 🔗 Integraciones de Alto Nivel
* **Notificaciones de Alerta:** Avisos automáticos si un empleado no registra su entrada a la hora prevista.
* **n8n / Workflows:** Conexión con sistemas de planillas o recursos humanos.
* **Cloudflare Workers:** Optimización de la recepción de datos para soportar equipos de cientos de personas simultáneamente.

---

## 🎯 Perfil de Aplicación

* **Personal en Campo:** Técnicos, instaladores y repartidores.
* **Equipos Remotos:** Consultores y personal de ventas.
* **Supervisión Operativa:** Control de rondas y mantenimientos.
* **PYMES:** Organizaciones que buscan digitalizar procesos sin costos de software complejos.

---

> [!TIP]
> **Integración con otros módulos:**
> Este sistema de control puede conectarse con el **Chatbot Profesional** para gestionar consultas internas o con el módulo de **Booking** para asignar tareas específicas por horarios.

---