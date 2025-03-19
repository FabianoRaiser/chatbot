const express = require('express');
const axios = require('axios');
const app = express();

// Configurações do Chatbase
const CHATBASE_API_KEY = process.env.CHATBASE_API_KEY; // Substitua pela sua API Key
const CHATBOT_ID = process.env.CHATBOT_ID; // Substitua pelo ID do seu Chatbot

// Middleware para tratar JSON
app.use(express.json());

// Porta do servidor
const PORT = process.env.PORT || 8080;

// Função para registrar conversas no ChatBase
async function logToChatbase(userMessage, botResponseText, userId = 'default-user') {
    // Tentativa 1: API mais nova com cabeçalho de API Key
    console.log('Tentativa 1: API v1 com cabeçalho de API Key');
    try {
        const result = await axios.post(
            'https://www.chatbase.co/api/v1/chat',
            {
                messages: [
                    { content: userMessage, role: 'user' },
                    { content: botResponseText, role: 'assistant' }
                ],
                chatId: userId,
                chatbotId: CHATBOT_ID,
                stream: false
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CHATBASE_API_KEY}`
                }
            }
        );
        console.log(`Sucesso na tentativa 1! Status: ${result.status}`);
        return result.text;
    } catch (error) {
        console.error('Falha na tentativa 1:', error.message);
        if (error.response) {
            console.error('Detalhes:', error.response.status, error.response.data);
        }
        return false;
    }
}

// Rota de verificação de saúde
app.get('/', (req, res) => {
    res.send('Serviço de integração Google Chat-ChatBase está funcionando');
});

// Endpoint para receber mensagens do Google Chat
app.post('/webhook', async (req, res) => {
    console.log('Webhook recebido:', JSON.stringify(req.body));
    
    try {
        // Extrai os dados do evento do Google Chat
        const event = req.body;
        let userMessage, userId;
        
        // Analisa o formato do webhook do Google Chat
        if (event.type === 'MESSAGE' && event.message && event.message.text) {
            // Formato padrão do Google Chat
            userMessage = event.message.text;
            userId = event.user.name || event.user.displayName || 'anonymous';
        } else if (event.message) {
            // Formato simples (assumindo que é apenas o conteúdo da mensagem)
            userMessage = event.message;
            userId = event.userId || 'default-user';
        } else {
            // Fallback para qualquer outro formato
            userMessage = JSON.stringify(event);
            userId = 'unknown-user';
        }
        
        console.log(`Mensagem recebida de ${userId}: ${userMessage}`);
        
        // Resposta do bot (pode ser substituída pela integração com Dialogflow)
        let botResponseText = `Recebi sua mensagem: "${userMessage}". Estou processando...`;
        
        // Tenta registrar no ChatBase e exibe a mensagem de retorno
        const registroSucesso = await logToChatbase(userMessage, botResponseText, userId);
        if (registroSucesso) {
            botResponseText = `${registroSucesso}`;
            console.log('Mensagem registrada com sucesso no ChatBase.');
        } else {
            botResponseText = `Não consegui processar a sua mensagem`
            console.log('Falha ao registrar a mensagem no ChatBase.');
        }

        
        // Envia a resposta para o Google Chat
        res.json({
            text: botResponseText
        });
    } catch (error) {
        console.error('Erro ao processar webhook:', error);
        res.status(500).json({ 
            text: "Ocorreu um erro ao processar sua mensagem." 
        });
    }
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});