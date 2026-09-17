const express = require("express");
const pool = require("../db");
const router = express.Router();
const crypto = require("crypto");

// 1. GET / - Ajustado os parâmetros para (req, res)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT 
                a.name AS nome,
                t.id,
                t.account_id AS account_id,
                t.due_date AS data_vencimento,
                t.supplier AS fornecedor,
                t.category AS categoria,
                t.total_installment AS total_installment,
                t.current_installment AS current_installment,
                t.amount AS valor,
                t.status,
                t.created_at,
                t.group_id
            FROM accounts a
            JOIN transactions t
            ON t.account_id = a.id
            ORDER BY t.due_date DESC;
        `);

    return res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar contas: ", error.message);
    return res.status(500).json({ error: "Erro ao buscar transações" });
  }
});

// 2. POST / - Criação de transações e parcelas
router.post("/", async (req, res) => {
  const {
    account_id,
    due_date,
    supplier,
    category,
    amount,
    status,
    total_installment,
  } = req.body;

  try {
    const groupId = crypto.randomUUID();
    const total = parseInt(total_installment, 10) || 1;
    const installmentValue = Number(amount) / total;
    const createdTransactions = [];

    for (let i = 1; i <= total; i++) {
      const [year, month, day] = due_date.split("-").map(Number);
      const baseDate = new Date(year, month - 1 + (i - 1), day);

      const result = await pool.query(
        `
            INSERT INTO transactions (
                account_id,
                due_date,
                supplier,
                category,
                amount,
                status,
                current_installment,
                total_installment,
                group_id
                )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
          `,
        [
          account_id,
          baseDate,
          supplier,
          category,
          installmentValue,
          status,
          i,
          total,
          groupId,
        ]
      );

      createdTransactions.push(result.rows[0]);
    }

    return res.status(201).json(createdTransactions);
  } catch (error) {
    console.error("Erro ao criar transação: ", error.message);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.put("/group/:groupId", async (req, res) => {
  const { groupId } = req.params;
  const { supplier, category } = req.body;

  try {
    const result = await pool.query(
      `
        UPDATE transactions
        SET
          supplier = $1,
          category = $2
        WHERE group_id = $3
        RETURNING *;
        `,
      [supplier, category, groupId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Nenhuma transação encontrada para esse grupo." });
    }

    return res.json(result.rows);
  } catch (error) {
    console.error("Erro ao atualizar grupo de transações: ", error.message);
    return res
      .status(500)
      .json({ error: "Erro interno ao atualizar o grupo." });
  }
});

// 4. Rotas por ID (/ :id) - PATCH, DELETE e PUT
router
  .route("/:id")
  .patch(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    try {
      const result = await pool.query(
        "UPDATE transactions SET status = $1 WHERE id = $2 RETURNING *",
        [status, id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Transação não encontrada" });
      }

      return res.status(200).json({
        message: "Status atualizado com sucesso",
        data: result.rows[0],
      });
    } catch (error) {
      console.error("❌ Erro no PostgreSQL:", error);
      return res.status(500).json({
        error: "Erro interno ao atualizar no banco",
        detail: error.message,
      });
    }
  })
  .delete(async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `DELETE FROM transactions WHERE id = $1 RETURNING id`,
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Transação não encontrada" });
      }

      return res.json({
        message: "Transação excluída com sucesso",
        id: result.rows[0].id,
      });
    } catch (error) {
      console.error("Erro ao excluir transação: ", error.message);
      return res.status(500).json({ error: "Erro ao excluir transação" });
    }
  })
  .put(async (req, res) => {
    const { id } = req.params;
    const { due_date, supplier, category, amount, status } = req.body;

    try {
      const result = await pool.query(
        `
        UPDATE transactions
        SET 
          due_date = $1,
          supplier = $2,
          category = $3,
          amount = $4,
          status = $5
        WHERE id = $6
        RETURNING *;
        `, // 👈 Removida a vírgula antes do WHERE
        [due_date, supplier, category, amount, status, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Transação não encontrada" });
      }

      return res.json(result.rows[0]);
    } catch (error) {
      console.error("Erro no PUT individual: ", error.message);
      return res
        .status(500)
        .json({ error: "Erro interno ao atualizar transação" });
    }
  });

module.exports = router;