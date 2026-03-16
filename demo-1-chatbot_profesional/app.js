const express = require('express');
const { handleMessage } = require('./botController');
require('dotenv').config();

const app = express();
app.use(express.json());

app.post('/webhook', async (req, res) => {
    const { body, from, name } = req.body;

    if (!body || !from) {
        return res.status(400).send('Invalid payload');
    }

    try {
        const responseText = await handleMessage(body, name);
        
        // En produccion, aqui se llamaria a la API de WhatsApp para enviar el mensaje
        console.log(`[Outbound to ${from}]: ${responseText}`);
        
        res.status(200).send({ status: 'success', response: responseText });
    } catch (error) {
        res.status(500).send({ status: 'error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));