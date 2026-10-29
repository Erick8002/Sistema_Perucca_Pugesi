import express from 'express';
import pool from '../db.js';
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
        res.status(500).json({error: 'Erro ao buscar contas'});
    }
});

router.post('/', async (req, res) => {
    const { name, document_type, document } = req.body;

    if (
        typeof name !== 'string' ||
        !name.trim() ||
        typeof document_type !== 'string' ||
        !document_type.trim() ||
        typeof document !== 'string' ||
        !document.trim()
    ) {
        return res.status(400).json({ error: 'Informe nome, tipo de conta e CPF/CNPJ.' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO accounts (name, document_type, document)
             VALUES ($1, $2, $3)
             RETURNING id, name, document, document_type, created_at`,
            [name.trim(), document_type.trim(), document.trim()]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar conta: ', error.message);
        res.status(500).json({ error: 'Erro ao criar conta.' });
    }
});

export default router;