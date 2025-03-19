import express from 'express';
import logToChatbase from '../connections/chatbase.js';

const router = express.Router();

const CHATBOT_ID = process.env.CHATBOT_ID_CATORIO;
const CHATBASE_API_KEY = process.env.CHATBASE_API_KEY_CARTORIO; 


router.get('/googlechat', (req, res) => {
    res.status(200).send("Teste de rota cartório")
})

router.post('/googlechat', async (req, res) => {
    console.log('Webhook recebido - Cartório');
    
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
        const registroSucesso = await logToChatbase(userMessage, botResponseText, userId, CHATBOT_ID);
        if (registroSucesso !== 'Error') {
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

export default router;