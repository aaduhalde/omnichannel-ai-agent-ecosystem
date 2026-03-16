const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: { encrypt: false, trustServerCertificate: true }
};

async function saveLead(leadData) {
    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('name', sql.VarChar, leadData.name)
            .input('channel', sql.VarChar, 'whatsapp')
            .input('status', sql.VarChar, 'new')
            .query('INSERT INTO staging.leads (customer_name, source_channel, status, created_at) VALUES (@name, @channel, @status, GETDATE())');
        console.log('Database: Lead saved to staging.');
    } catch (err) {
        console.error('Database Error:', err);
    }
}

module.exports = { saveLead };