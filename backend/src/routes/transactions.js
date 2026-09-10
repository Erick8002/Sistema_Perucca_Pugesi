const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                a.name AS nome,
                t.id,
                t.account_id AS account_id,
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

router.post('/', async (req, res) => {
    try {
        const {
            account_id,
            due_date,
            supplier,
            category,
            amount,
            status
        } = req.body;

        const result = await pool.query(`
            INSERT INTO transactions (
                account_id,
                due_date,
                supplier,
                category,
                amount,
                status
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING
                id,
                account_id,
                due_date,
                supplier,
                category,
                amount,
                status;
        `, [
            account_id,
            due_date,
            supplier,
            category,
            amount,
            status
        ]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar transação: ', error.message);
        res.status(500).json({ error: 'Erro ao criar transação' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM transactions where id = $1 RETURNING id`,
            [id]
        );

        if(result.rowCount === 0) {
            return res.status(404).json({ error: 'Transação não encontrada' });
        }

        res.json({
            message: 'Transação excluída com sucesso',
            id: result.rows[0].id
        });
    } catch (error) {
        console.error('Erro ao excluir transação: ', error.message);
        res.status(500).json({ error: 'Erro ao excluir transação' });
    }
});

module.exports = router;