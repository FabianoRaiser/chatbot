import express from 'express';
import { getAuthUrl, getTokens, setCredentials } from './connections/auth.js';

const router = express.Router();

// Armazenar tokens (em produção, use um banco de dados seguro)
let storedTokens = null;

// Rota para iniciar o fluxo de autorização
router.get('/auth', (req, res) => {
  const authUrl = getAuthUrl();
  res.redirect(authUrl);
});

// Callback para receber o código de autorização
router.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).send('Código de autorização ausente');
  }
  
  try {
    // Troca o código pelo token de acesso e refresh token
    const tokens = await getTokens(code);
    storedTokens = tokens;
    
    // Configura as credenciais no cliente OAuth
    setCredentials(tokens);
    
    res.send('Autenticação realizada com sucesso! Você pode fechar esta janela.');
  } catch (error) {
    console.error('Erro ao obter tokens:', error);
    res.status(500).send('Erro ao processar autorização');
  }
});

// Rota para verificar o status da autenticação
router.get('/auth/status', (req, res) => {
  if (storedTokens && storedTokens.access_token) {
    res.json({ authenticated: true, expires_at: storedTokens.expiry_date });
  } else {
    res.json({ authenticated: false });
  }
});

export default router;
export { storedTokens }; 