import express from 'express';
import axios from 'axios';
import botsRoutes from './src/botsRoutes/index.js';
import authRoutes from './src/authRoutes.js';
import { refreshTokenIfNeeded } from './src/connections/auth.js';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;

// Middleware para verificar tokens antes de cada requisição
app.use(async (req, res, next) => {
    // Não verifica autenticação para rotas de autenticação
    if (req.path.startsWith('/auth') || req.path === '/') {
        return next();
    }
    
    // Verifica e renova o token se necessário
    const isTokenValid = await refreshTokenIfNeeded();
    if (!isTokenValid) {
        return res.status(401).json({ 
            error: 'Autenticação expirada', 
            authUrl: '/auth'
        });
    }
    
    next();
});

// Rota de verificação de saúde
app.get('/', (req, res) => {
    res.send('Serviço de integração Google Chat-ChatBase está funcionando');
});

// Rotas de autenticação OAuth
app.use('/', authRoutes);

// Endpoint para receber mensagens do Google Chat
app.use('/webhook', botsRoutes);

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Para autenticar, acesse: http://localhost:${PORT}/auth`);
});