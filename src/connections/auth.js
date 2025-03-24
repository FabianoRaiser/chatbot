import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Configurações OAuth 2.0
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:8080/oauth2callback';
const SCOPES = [
  'https://www.googleapis.com/auth/chat.bot',
  'https://www.googleapis.com/auth/chat.messages',
  'https://www.googleapis.com/auth/chat.messages.create'
];

// Criação do cliente OAuth2
const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Função para gerar URL de autorização
export function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'  // Para sempre obter um refresh_token
  });
}

// Função para obter tokens a partir do código de autorização
export async function getTokens(code) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

// Função para configurar credenciais no cliente
export function setCredentials(tokens) {
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
}

// Função para verificar e renovar token expirado
export async function refreshTokenIfNeeded() {
  if (oauth2Client.isTokenExpiring()) {
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);
      return true;
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      return false;
    }
  }
  return true;
}

// Função para obter um cliente autenticado para a API do Chat
export function getChatClient() {
  const chat = google.chat({ version: 'v1', auth: oauth2Client });
  return chat;
}

export default oauth2Client; 