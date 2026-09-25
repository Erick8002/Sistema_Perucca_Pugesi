import express from 'express'; // Importa a biblioteca express
import cors from 'cors';
import pool from './db.js';
import accountsRoutes from './routes/accounts.js';
import transactionsRoutes from './routes/transactions.js';
import dotenv from 'dotenv';
dotenv.config(); // Carrega o arquivo .env e o .config() ativa o carregamento

const app = express(); // Aqui ele cria o servidor
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/api/accounts', accountsRoutes);
app.use('/api/transactions', transactionsRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'Bem-vindo à API de Finanças! 💰' });
});

pool.query('select now()')
  .then((result) => {
    console.log('Conexão com o banco funcionando!')
    console.log('Horário do banco: ', result.rows[0].now);
  }) 
  .catch((error) => {
    console.error('Erro ao conectar com o banco: ', error.message);
  });

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});