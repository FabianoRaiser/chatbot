import express from 'express';
import axios from 'axios';
import botsRoutes from './src/botsRoutes/index.js';

const app = express();
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