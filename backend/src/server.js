const express = require('express'); // Importa a biblioteca express
const cors = require('cors');
require('dotenv').config(); // Carrega o arquivo .env e o .config() ativa o carregamento

const app = express(); // Aqui ele cria o servidor
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'Bem-vindo à API de Finanças! 💰' });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});