const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                a.name AS nome,
                t.id,
                t.due_date AS data_vencimento,
                t.supplier AS fornecedor,
                t.category AS categoria,
                t.amount AS valor,
                t.status
            FROM accounts a
            JOIN transactions t
            ON t.account_id = a.id
            ORDER BY t.due_date;
        `);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar contas: ', error.message);
        res.status(500).json({error: 'Erro ao buscar transações'});
    }
});

module.exports = router;