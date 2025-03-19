import axios from 'axios';

const CHATBASE_API_KEY = process.env.CHATBASE_API_KEY; 

async function logToChatbase(userMessage, botResponseText, userId = 'default-user', chatbotId) {
    try {
        const result = await axios.post(
            'https://www.chatbase.co/api/v1/chat',
            {
                messages: [
                    { content: userMessage, role: 'user' },
                    { content: botResponseText, role: 'assistant' }
                ],
                chatId: userId,
                chatbotId: chatbotId,
                stream: false
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CHATBASE_API_KEY}`
                }
            }
        );
        console.log(`Sucesso na Mensagem. Status: ${result.status}`);
        return result.data.text;
    } catch (error) {
        console.error('Falha na Mensagem: ', error.message);
        if (error.response) {
            console.error('Detalhes:', error.response.status, error.response.data);
        }
        return 'Error';
    }
}

export default logToChatbase;