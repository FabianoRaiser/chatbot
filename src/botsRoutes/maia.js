import express from 'express';
import logToChatbase from '../connections/chatbase.js';
import { getChatClient } from '../connections/auth.js';

const router = express.Router();

const CHATBOT_ID = process.env.CHATBOT_ID_MAIA;
const CHATBASE_API_KEY = process.env.CHATBASE_API_KEY_MAIA; 


router.get('/googlechat', (req, res) => {
    res.status(200).send("Teste de rota")
})

router.post('/googlechat', async (req, res) => {
    console.log('Webhook recebido - Maia');
    
    try {
        // Extrai os dados do evento do Google Chat
        const event = req.body;
        let userMessage, userId, spaceId;
        
        // Analisa o formato do webhook do Google Chat
        if (event.type === 'MESSAGE' && event.message && event.message.text) {
            // Formato padrão do Google Chat
            userMessage = event.message.text;
            userId = event.user.name || event.user.displayName || 'anonymous';
            spaceId = event.space.name;
        } else if (event.message) {
            // Formato simples (assumindo que é apenas o conteúdo da mensagem)
            userMessage = event.message;
            userId = event.userId || 'default-user';
            spaceId = event.space || 'default-space';
        } else {
            // Fallback para qualquer outro formato
            userMessage = JSON.stringify(event);
            userId = 'unknown-user';
            spaceId = 'unknown-space';
        }
        
        console.log(`Mensagem recebida de ${userId}: ${userMessage}`);
        
        // Resposta do bot (pode ser substituída pela integração com Dialogflow)
        let botResponseText = `Recebi sua mensagem: "${userMessage}". Estou processando...`;
        
        // Tenta registrar no ChatBase e exibe a mensagem de retorno
        const registroSucesso = await logToChatbase(userMessage, botResponseText, userId, CHATBOT_ID, CHATBASE_API_KEY);
        if (registroSucesso !== 'Error') {
            console.log(registroSucesso); 
            botResponseText = `${registroSucesso}`;
            console.log('Mensagem registrada com sucesso no ChatBase.');
        } else {
            botResponseText = `Não consegui processar a sua mensagem`;
            console.log('Falha ao registrar a mensagem no ChatBase.');
        }

        // Obtenha o cliente autenticado do Google Chat
        const chat = getChatClient();
        
        // Envie a resposta usando a API autenticada do Google Chat
        try {
            await chat.spaces.messages.create({
                parent: spaceId,
                requestBody: {
                    text: botResponseText
                }
            });
            
            // Responde ao webhook com status de sucesso
            res.status(200).end();
        } catch (chatError) {
            console.error('Erro ao enviar mensagem via API Chat:', chatError);
            
            // Fallback: envia a resposta diretamente como resposta ao webhook
            res.json({
                text: botResponseText
            });
        }
    } catch (error) {
        console.error('Erro ao processar webhook:', error);
        res.status(500).json({ 
            text: "Ocorreu um erro ao processar sua mensagem." 
        });
    }
});

export default router;