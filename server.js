const express = require('express');
const axios = require('axios');
const app = express();
const botsRoutes = require('./src/botsRoutes/index');

app.use(express.json());

const PORT = process.env.PORT || 8080;

// Rota de verificação de saúde
app.get('/', (req, res) => {
    res.send('Serviço de integração Google Chat-ChatBase está funcionando');
});

// Endpoint para receber mensagens do Google Chat
app.use('/webhook', botsRoutes);

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});