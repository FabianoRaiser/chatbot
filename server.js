const express = require('express');
const axios = require('axios'); // Biblioteca para requisições HTTP
const app = express();

// Configurações do Chatbase
const CHATBASE_API_KEY = process.env.CHATBASE_API_KEY; // Substitua pela sua API Key
const CHATBOT_ID = process.env.CHATBOT_ID; // Substitua pelo ID do seu Chatbot

// Middleware para tratar JSON
app.use(express.json());

// Porta do servidor
const PORT = 8080;

// Função para enviar dados para o Chatbase
function sendToChatbase(userMessage, botResponse, intentName, isHandled) {
    const userPayload = {
        api_key: CHATBASE_API_KEY,
        chatbot_id: CHATBOT_ID,
        type: 'user',
        platform: 'Dialogflow',
        message: userMessage,
        intent: intentName,
        version: '1.0',
        not_handled: !isHandled,
        user_id: 'default-session'
    };

    const botPayload = {
        api_key: CHATBASE_API_KEY,
        chatbot_id: CHATBOT_ID,
        type: 'agent',
        platform: 'Dialogflow',
        message: botResponse,
        intent: intentName,
        version: '1.0',
        not_handled: false,
        user_id: 'default-session'
    };

    // Envia as mensagens para o Chatbase
    axios.post('https://chatbase.com/api/message', userPayload)
        .then(() => console.log('Mensagem do usuário enviada ao Chatbase.'))
        .catch((error) => console.error('Erro ao enviar mensagem do usuário:', error.message));

    axios.post('https://chatbase.com/api/message', botPayload)
        .then(() => console.log('Resposta do bot enviada ao Chatbase.'))
        .catch((error) => console.error('Erro ao enviar resposta do bot:', error.message));
}

// Endpoint para receber mensagens do Google Chat
app.post('/webhook', (req, res) => {
    const userMessage = req.body.message || "Mensagem vazia"; // Mensagem do usuário
    const intentName = req.body.intent || "default-intent"; // Nome da intent
    const botResponse = "Resposta automática do bot"; // Resposta do bot

    // Envia dados ao Chatbase
    sendToChatbase(userMessage, botResponse, intentName, true);

    // Retorna a resposta para o Google Chat
    res.json({ text: botResponse });
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});