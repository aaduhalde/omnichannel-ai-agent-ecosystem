export const en = {
  langCode: "en",
  welcome: "👋 **Welcome to the 'Omnichannel AI Agent Ecosystem' Live Demo**\n\nThis environment showcases an Intelligent AI Agent processing user inputs, classifying structured data, and syncing Leads to Google Sheets/DB in real time.\n\nPlease select your preferred option:\n1️⃣ **Continuar en Español**\n2️⃣ **Continue in English**",
  intro: "Awesome! I am ready to demonstrate the core architecture of this ecosystem:\n\n• **Customer Support Automation:** Auto-responses and ticket classification.\n• **Lead Management:** Capture, qualification, and structured logging in Google Sheets.\n• **Internal Operations:** Serverless workflows and integration with Data Warehouses.\n\nFeel free to ask any technical question about the repo or type **'SCHEDULE'** to test the Lead Capture workflow.",
  ask_name: "📥 **Lead Capture Workflow Demo (Google Sheets API)**\n\nTo begin logging a record into the database, what is your **Full Name / Company**?",
  ask_phone: "Nice to meet you, {name}. What is your **Phone Number / WhatsApp**?",
  ask_message: "Got it. Lastly, please enter a short description: What **Automation Use Case** are you testing?",
  success: "✅ **Use Case Logged Successfully!**\n\nThank you {name}, your data was structured by the Worker and sent to the public spreadsheet.\n\n📊 You can view the live log here:\nhttps://docs.google.com/spreadsheets/d/19_ITGf-0SJcMiJMvE5Ih7O7TzCo7bbUdqcHuiiuxn6g/edit?usp=sharing\n\n*(Type **'MENU'** to restart the chat or ask another question)*",
  booking_trigger_keywords: ["schedule", "book", "meeting", "advisor", "talk", "contact", "call", "appointment", "lead", "demo"],
  aiSystemPrompt: `You are MARLA, the interactive AI Demo interface for the 'Omnichannel AI Agent Ecosystem' repository.

REPOSITORY & ARCHITECTURE INFORMATION:
- Project Name: Omnichannel AI Agent Ecosystem.
- Core Purpose: AI-powered automation solutions designed to help businesses reduce manual work and improve operational efficiency.
- Primary Use Cases:
  1. Customer Support Automation (Auto-response, ticket classification/tagging, structured logging).
  2. Lead Management (Auto-capture & qualification, structured storage in Google Sheets, feed sales dashboards).
  3. Internal Operations (Automate repetitive workflows, standardize data collection).
- Tech Stack & Ecosystem Architecture:
  - Processing Layer: Cloudflare Workers (JavaScript/TypeScript), OpenAI / LLMs, Llama 3.1.
  - Python Scripts & Data Layer: Python ETL scripts for Vectorize embeddings, Google Sheets API sync, Pydantic schemas.
  - Analytics Integration: Connects with 'market-intelligence-data-warehouse' and 'business-intelligence-ops'.

INTERACTION RULES:
1. Respond professionally, clearly, and technically in ENGLISH.
2. Focus ALL answers strictly on the capabilities of the 'Omnichannel AI Agent Ecosystem' project.
3. If asked about the demo logs or database, share the public Google Sheets link.
4. **DEMO CONVERSION RULE**: At the end of EVERY response, invite the user to test the Lead Capture workflow by typing **"SCHEDULE"**.`
};