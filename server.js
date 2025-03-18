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

// Função para enviar dados para o Chatbase
async function sendToChatbase(userMessage, botResponseText, userId = 'default-user', intentName = 'default-intent') {
    try {
        // Mensagem do usuário
        const userPayload = {
            api_key: CHATBASE_API_KEY,
            type: 'user',
            platform: 'Dialogflow',
            message: userMessage,
            intent: intentName,
            version: '1.0',
            user_id: userId,
            time_stamp: Date.now()
        };

        // Resposta do bot
        const botPayload = {
            api_key: CHATBASE_API_KEY,
            type: 'agent',
            platform: 'Dialogflow',
            message: botResponseText,
            intent: intentName,
            version: '1.0',
            user_id: userId,
            time_stamp: Date.now()
        };

        // Envia a mensagem do usuário para o ChatBase
        console.log('Enviando mensagem do usuário para o ChatBase...');
        const userResult = await axios.post('https://api.chatbase.com/message', userPayload, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        console.log('Mensagem do usuário enviada ao ChatBase com sucesso:', userResult.status);

        // Envia a resposta do bot para o ChatBase
        console.log('Enviando resposta do bot para o ChatBase...');
        const botResult = await axios.post('https://api.chatbase.com/message', botPayload, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        console.log('Resposta do bot enviada ao ChatBase com sucesso:', botResult.status);

        return true;
    } catch (error) {
        console.error('Erro ao enviar mensagens para o ChatBase:', error.message);
        if (error.response) {
            console.error('Detalhes do erro:', error.response.data);
            console.error('Status do erro:', error.response.status);
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
        
        // Verifica se é uma mensagem de texto
        if (event.type === 'MESSAGE' && event.message && event.message.text) {
            const userMessage = event.message.text;
            const userId = event.user.name || event.user.displayName || 'anonymous';
            const spaceId = event.space.name || 'default-space';
            
            console.log(`Mensagem recebida de ${userId}: ${userMessage}`);
            
            // Aqui você pode adicionar lógica para processar a mensagem
            // ou chamar um serviço externo para obter uma resposta
            
            // Por enquanto, vamos usar uma resposta simples
            const botResponseText = `Recebi sua mensagem: "${userMessage}". Estou processando...`;
            
            // Envia os dados para o ChatBase
            await sendToChatbase(userMessage, botResponseText, userId);
            
            // Envia a resposta para o Google Chat
            res.json({
                text: botResponseText
            });
        } else {
            res.json({ text: "Desculpe, só posso processar mensagens de texto." });
        }
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