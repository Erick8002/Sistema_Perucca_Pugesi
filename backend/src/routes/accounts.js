const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        // Manda essa query para o banco de dados que o "pool" fez a conexão
        const result = await pool.query(` 
            SELECT id, name, document, document_type, created_at
            FROM accounts
            ORDER BY name;
        `);

        res.json(result.rows); //Transforma o resultado em json
    } catch (error) {
        console.error('Erro ao buscar contas: ', error.message);
        res.status(500).json({error: 'Erro ao buscar contas'});;
    }
});

module.exports = router;