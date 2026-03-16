# 💸 Guía de Costos y Facturación: WhatsApp Business API & IA

[![Meta](https://img.shields.io/badge/Provider-Meta-0668E1?style=flat&logo=meta)](https://business.whatsapp.com/)
[![OpenAI](https://img.shields.io/badge/AI-GPT--4%20%2F%20Gemini-412991?style=flat&logo=openai)](https://openai.com/)
[![Documentation](https://img.shields.io/badge/Doc-Guía%20de%20Facturación-yellow?style=flat)](#)

Antes de implementar un Chatbot profesional, es fundamental entender el modelo de facturación de **Meta** y los consumos de **Inteligencia Artificial**. Esta guía detalla cómo optimizar tu inversión para evitar costos innecesarios.

---

## 💬 1. ¿Cómo cobra WhatsApp (Meta)?

Meta no cobra por mensaje individual, sino por **Ventanas de Conversación de 24 horas**.

* **¿Cuándo se abre?** Cuando el cliente escribe primero o cuando la empresa envía una plantilla aprobada.
* **¿Qué incluye?** Mensajes ilimitados durante 24 horas sin costo adicional.
* **Reapertura:** Si pasan más de 24 horas sin interacción, cualquier mensaje nuevo inicia una nueva ventana y genera un nuevo cargo.

### 💰 Tipos de Conversación (Estimados LATAM 2025)

| Tipo | Activador | Costo Estimado (USD) |
| :--- | :--- | :--- |
| **🟢 Servicio** | El cliente escribe primero | $0.02 – $0.04 |
| **🔵 Marketing** | La empresa inicia (promos/avisos) | $0.05 – $0.10 |
| **🟠 Autenticación** | Códigos OTP / Validaciones | $0.03 – $0.06 |

> [!NOTE]
> **¡Beneficio Gratuito!** Meta ofrece **1,000 conversaciones de servicio gratuitas** al mes por número verificado (siempre que las inicie el cliente).

---

## 🤖 2. Costos de Inteligencia Artificial (IA)

Si tu chatbot utiliza modelos avanzados (como GPT-4 o Gemini), el costo se calcula por **Tokens**.

* **¿Qué es un Token?** Aproximadamente 1 token ≈ 0.75 palabras.
* **Facturación:** Se cobran tanto los tokens de entrada (lo que dice el cliente) como los de salida (lo que responde la IA).

### 📊 Estimación de Consumo
* **Modelos Económicos:** Para atención básica. Costo aprox: **$5 – $20 USD/mes**.
* **Modelos Avanzados:** Para ventas y razonamiento complejo. Costo aprox: **$20 – $80 USD/mes**.

---

## 🚀 Estrategias para Reducir Costos

Para que tu sistema sea rentable, aplicamos las siguientes optimizaciones:

1.  **Aprovechamiento de Ventanas Gratuitas:** Incentivamos que el cliente inicie el chat mediante botones web o campañas *Click to WhatsApp* (que ofrecen 72 horas gratis).
2.  **Seguimiento Inteligente:** Automatizamos recordatorios dentro de las 24 horas activas para evitar pagar nuevas aperturas.
3.  **Gestión de Consentimiento (Opt-in):** Aseguramos que el marketing sea efectivo y aprobado, evitando bloqueos y gastos en mensajes no deseados.
4.  **Diseño de Flujo Eficiente:** Un bot bien configurado responde rápido y cierra la consulta sin disparar mensajes innecesarios, reduciendo el consumo de tokens entre un **30% y 50%**.

---

## 💡 Ejemplo Real de Facturación Mensual
Para un negocio con **300 chats de servicio** y **100 de marketing**:
* **Meta:** ~$16 USD.
* **IA (Tokens):** ~$10 USD (promedio).
* **Total Variable:** ~$26 USD + costo fijo del proveedor.

---

> [!IMPORTANT]
> **Transparencia Total:** Los cargos de Meta e IA se facturan directamente desde sus respectivas plataformas (Meta Business y Provider de IA). Mi servicio se enfoca en la configuración, optimización y mantenimiento de esta infraestructura para que pagues lo mínimo posible.
