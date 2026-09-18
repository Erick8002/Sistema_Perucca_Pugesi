const express = require("express");
const pool = require("../db");
const router = express.Router();
const crypto = require("crypto");

// 1. GET / 
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
                t.group_id,
                t.nfe_url,
                t.xml_url,
                t.boleto_url,
                t.receipt_url
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
  console.log("REQ.BODY RECEBIDO NO BACKEND: ", req.body);
  const {
    account_id,
    due_date,
    dataVencimento,
    supplier,
    fornecedor,
    category,
    categoria,
    amount,
    valor,
    status,
    total_installment,
    nfe_url = null,
    xml_url = null,
    boleto_url = null,
    receipt_url = null
  } = req.body;

  try {
    const finalDueDate = due_date || dataVencimento;
    const finalSupplier = supplier || fornecedor || null;
    const finalCategory = category || categoria || null;
    const finalAmount = Number(amount || valor || 0);

    if(!finalDueDate) {
      return res.status(400).json({ error: "A data de vencimento é obrigatória." });
    }

    const groupId = crypto.randomUUID();
    const total = parseInt(total_installment, 10) || 1;
    const installmentValue = finalAmount / total;
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
                group_id,
                nfe_url,
                xml_url,
                boleto_url,
                receipt_url
                )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
          `,
        [
          account_id,
          baseDate,
          finalSupplier,
          finalCategory,
          installmentValue,
          status || "Pendente",
          i,
          total,
          groupId,
          nfe_url,
          xml_url,
          boleto_url,
          receipt_url
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
        `, 
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