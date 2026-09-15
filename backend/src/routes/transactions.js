const express = require("express");
const pool = require("../db");
const router = express.Router();

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
                t.amount AS valor,
                t.status
            FROM accounts a
            JOIN transactions t
            ON t.account_id = a.id
            ORDER BY t.due_date;
        `);

    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar contas: ", error.message);
    res.status(500).json({ error: "Erro ao buscar transações" });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      account_id,
      due_date,
      supplier,
      category,
      amount,
      total_installment,
      status,
    } = req.body;

    const total = parseInt(total_installment, 10) || 1;
    console.log("Total de parcelas recebido no Backend: ", total);

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
                current_installment,
                total_installment,
                supplier,
                category,
                amount,
                status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING
                id,
                account_id,
                due_date,
                supplier,
                category,
                amount,
                status,
                current_installment,
                total_installment;
                `,
        [account_id, baseDate, i, total, supplier, category, installmentValue, status],
      );

      createdTransactions.push(result.rows[0]);
    }

    return res.status(201).json(createdTransactions);
  } catch (error) {
    console.error("Erro ao criar transação: ", error.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router
  .route("/:id")
  .patch(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    try {
      const result = await pool.query(
        "UPDATE transactions SET status = $1 WHERE id = $2 RETURNING *",
        [status, id],
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
        `DELETE FROM transactions where id = $1 RETURNING id`,
        [id],
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Transação não encontrada" });
      }

      res.json({
        message: "Transação excluída com sucesso",
        id: result.rows[0].id,
      });
    } catch (error) {
      console.error("Erro ao excluir transação: ", error.message);
      res.status(500).json({ error: "Erro ao excluir transação" });
    }
  });

module.exports = router;
