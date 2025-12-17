# WhatsApp Activity Control System (WACS)

Sistema de nivel MVP para el control de asistencia, registro de actividades y seguimiento de empleados en campo, utilizando la **API oficial de WhatsApp Cloud**. Una solución robusta, gratuita y 100% segura contra bloqueos.

---

## Descripción del Sistema
WACS permite a las empresas gestionar la actividad de su personal remoto directamente a través de WhatsApp. El sistema transforma mensajes de chat en registros estructurados en una base de datos (Google Sheets), permitiendo auditoría en tiempo real de:
* **Asistencia:** Check-in y Check-out con marca de tiempo.
* **Geolocalización:** Registro de ubicación GPS enviada por el empleado.
* **Actividades:** Bitácora de tareas realizadas durante la jornada.

---

## Arquitectura Técnica
El sistema utiliza una arquitectura **Serverless** para garantizar disponibilidad sin costos de mantenimiento:

1.  **Frontend:** WhatsApp Business App (Interfaz de usuario).
2.  **Backend:** Cloudflare Workers (Procesamiento de lógica y webhooks).
3.  **Base de Datos:** Google Sheets (Almacenamiento y visualización administrativa).
4.  **Conectividad:** WhatsApp Cloud API (Meta) como canal de comunicación oficial.

---

## ⚙️ Instrucciones de Configuración

### 1. WhatsApp Cloud API (Meta)
1.  Ve a [Meta for Developers](https://developers.facebook.com/).
2.  Crea una App de tipo **Business**.
3.  Agrega el producto **WhatsApp** a tu App.
4.  Configura el **Webhook** apuntando a la URL que obtendrás de Cloudflare (paso siguiente).
5.  Obtén tu `Access Token` temporal y el `Phone Number ID`.

### 2. Despliegue en Cloudflare Workers
1.  Crea una cuenta en [Cloudflare](https://dash.cloudflare.com/).
2.  Crea un nuevo **Worker**.
3.  Copia el código de `/src/worker.js` de este repositorio en el editor de Cloudflare.
4.  Configura las Variables de Entorno (`Secret Vars`):
    * `WHATSAPP_TOKEN`
    * `GOOGLE_SHEET_URL`
5.  Haz clic en **Save and Deploy**.

### 3. Conexión con Google Sheets
1.  Crea una nueva hoja en Google Sheets.
2.  Ve a `Extensiones > Apps Script`.
3.  Pega el contenido de `/src/services/googleSheets.js`.
4.  Implementa como **Aplicación Web** y otorga acceso a "Cualquier persona".
5.  Copia la URL resultante y colócala en tu Cloudflare Worker.

---

## Ejemplos de Comandos
El bot interpreta comandos clave enviados por el usuario:

* **`Check-in`**: Inicia la jornada laboral.
* **`Check-out`**: Finaliza la jornada y genera el resumen.
* **`Actividad: [Descripción]`**: Registra una tarea específica (ej: *Actividad: Entrega de pedido cliente Pérez*).
* **[Enviar Ubicación]**: El sistema detecta el mensaje de tipo `location` y guarda las coordenadas automáticamente.

---

## Roadmap de Mejoras
- [ ] Integración con Google Maps para visualizar rutas de empleados.
- [ ] Reportes automáticos en PDF enviados por correo al finalizar la semana.
- [ ] Panel de administración (Dashboard) en GitHub Pages usando Chart.js.
- [ ] Alertas automáticas si un empleado no realiza el check-in a la hora prevista.

---

##