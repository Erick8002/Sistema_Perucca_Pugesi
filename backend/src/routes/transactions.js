import supabase from "../../services/supabase.js";
import express from "express";
import pool from "../db.js";
const router = express.Router();
import crypto from "crypto";

const supabaseClient = supabase?.storage ? supabase : supabase?.storage;

console.log("OBJETO SUPABASE IMPORTADO: ", !!supabaseClient?.storage);

function extractStoragePath(url) {
  if (!url || typeof url !== "string") return null;

  try {
    const decodedUrl = decodeURIComponent(url);
    const parts = decodedUrl.split("/public/");

    if (parts.length > 1) {
      const fullPath = parts[1]; // Ex: transaction_attachments/pasta/arquivo.pdf
      const pathSegments = fullPath.split("/");

      if (pathSegments.length >= 2) {
        const bucketName = pathSegments[0];
        const relativePath = pathSegments.slice(1).join("/");
        return { bucketName, relativePath };
      }
    }
  } catch (err) {
    console.error("Erro ao extrair caminho do storage:", err.message);
  }

  return null;
}

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
      const [year, month, day] = finalDueDate.split("-").map(Number);
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

// rota listar categoria
router.get("/categories", async (req, res) => {
  try {
    const result = await pool.query(`SELECT name FROM CATEGORIES ORDER BY name ASC`);

      return res.json(result.rows.map((row) => row.name));
  } catch (error) {
    console.error("ERro ao buscar categorias: ", error.message);
    return res.status(500).json({ error: "Erro interno ao buscar categorias" });
  }
});

// rota adicionar categoria
router.post("/categories", async (req, res) => {
  try {
    const { name } = req.body;

    if(!name || !name.trim()) {
      return res.status(400).json({ error: "O nome da categoria é obrigatório." });
    }

    const trimmedName = name.trim();

    const result = await pool.query(
      "INSERT INTO categories (name) VALUES ($1) RETURNING *",
      [trimmedName]
    );
    
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    if(error.code === "23505") {
      return res.status(409).json({ error: "Esta categoria já existe." });
    }

    console.error("Erro ao salvar categoria: ", error.message);
    return res.status(500).json({ error: "Erro interno do servidor ao salvar categoria" });
  }
});

// rota deletar categoria 
router.delete("/categories/:name", async (req, res) => {
  try {
    const { name } = req.params;

    if(!name) {
      return res.status(400).json({ error: "O nome da categoria é obrigatório" });
    }

    const result = await pool.query(
      `DELETE FROM categories WHERE LOWER(name) = LOWER($1) RETURNING *`,
      [decodeURIComponent(name)]
    );

    if(result.rowCount === 0) {
      return res.status(404).json({ error: "Categoria não encontrada na tabela" });
    }

    return res.status(200).json({
      message: "Categoria excluída com sucesso",
      deletedCategory: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao excluir categoria: ", error.message);
    return res.status(500).json({ error: "Erro ao excluir categoria"});
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

// 4. Rotas por ID (/:id) - PATCH, DELETE e PUT
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
    console.log("Supabase inicializado:", !!supabase);
    console.log("Storage disponível:", !!supabase?.storage);

    try {
      const { id } = req.params;

      const selectResult = await pool.query(
        `SELECT nfe_url, xml_url, boleto_url, receipt_url
        FROM transactions
        WHERE id = $1`,
        [id]
      );

      if (selectResult.rowCount === 0) {
        return res.status(404).json({ error: "Transação não encontrada" });
      }

      const transaction = selectResult.rows[0];

      const fileUrls = [
        transaction.nfe_url,
        transaction.xml_url,
        transaction.boleto_url,
        transaction.receipt_url,
      ].filter(Boolean);

      for (const url of fileUrls) {
        const checkResult = await pool.query(
          `SELECT COUNT(*) FROM transactions
          WHERE (nfe_url = $1 OR xml_url = $1 OR boleto_url = $1 OR receipt_url = $1)
          AND id != $2`,
          [url, id]
        );

        const isUsedElsewhere = parseInt(checkResult.rows[0].count, 10) > 0;

        if (!isUsedElsewhere) {
          // Extrai diretamente o objeto { bucketName, relativePath }
          const storageData = extractStoragePath(url);

          if (storageData) {
            const { bucketName, relativePath } = storageData;

            console.log(`TENTANDO DELETAR DO BUCKET "${bucketName}": ${relativePath}`);

            if (supabaseClient && supabaseClient.storage) {
              const { error: storageError } = await supabaseClient.storage
                .from(bucketName)
                .remove([relativePath]);

              if (storageError) {
                console.error(`Erro ao deletar arquivo (${relativePath}) do Supabase: `, storageError.message);
              } else {
                console.log(`Arquivo ${relativePath} deletado com sucesso do Supabase!`);
              }
            } else {
              console.log("Instância do Supabase ou Storage não está definida.");
            }
          } else {
            console.warn(`Não foi possível extrair caminho do storage da URL: ${url}`);
          }
        }
      }

      const result = await pool.query(
        `DELETE FROM transactions WHERE id = $1 RETURNING id`,
        [id]
      );

      return res.json({
        message: "Transação e arquivos associados excluídos com sucesso",
        id: result.rows[0].id,
      });
    } catch (error) {
      console.error("Erro ao excluir transação: ", error.message);
      return res.status(500).json({ error: "Erro ao excluir transação" });
    }
  })
  .put(async (req, res) => {
    console.log("BODY RECEBIDO NO BACKEND: ", req.body);
    
    const { id } = req.params;
    const { 
      due_date, 
      dataVencimento, 
      supplier, 
      fornecedor, 
      category, 
      categoria, 
      amount, 
      valor, 
      status,
      nfe_url,
      xml_url,
      boleto_url,
      receipt_url
    } = req.body;

    try {
      const numericId = parseInt(id, 10);

      // 1. Busca os arquivos atuais salvos no banco ANTES da atualização
      const currentTxResult = await pool.query(
        `SELECT nfe_url, xml_url, boleto_url, receipt_url FROM transactions WHERE id = $1`,
        [numericId]
      );

      if (currentTxResult.rowCount === 0) {
        return res.status(404).json({ error: "Transação não encontrada" });
      }

      const currentData = currentTxResult.rows[0];
      console.log("ARQUIVOS ATUAIS NO BANCO:", currentData);

      const finalNfeUrl = nfe_url ?? null;
      const finalXmlUrl = xml_url ?? null;
      const finalBoletoUrl = boleto_url ?? null;
      const finalReceiptUrl = receipt_url ?? null;

      const fileFields = [
        { oldUrl: currentData.nfe_url, newUrl: finalNfeUrl },
        { oldUrl: currentData.xml_url, newUrl: finalXmlUrl },
        { oldUrl: currentData.boleto_url, newUrl: finalBoletoUrl },
        { oldUrl: currentData.receipt_url, newUrl: finalReceiptUrl },
      ];

      // 2. Para cada campo, verifica se mudou ou foi removido
      for (const field of fileFields) {
        console.log(`Verificando campo -> Antigo: ${field.oldUrl} | Novo: ${field.newUrl}`);
        
        if (field.oldUrl && field.oldUrl !== field.newUrl) {
          console.log("O arquivo mudou ou foi removido! Verificando se é usado noutro lugar...");

          // Verifica se o arquivo antigo ainda é usado em OUTRA transação
          const checkResult = await pool.query(
            `SELECT COUNT(*) FROM transactions
            WHERE (nfe_url = $1 OR xml_url = $1 OR boleto_url = $1 OR receipt_url = $1)
            AND id != $2`,
            [field.oldUrl, numericId]
          );

          const isUsedElsewhere = parseInt(checkResult.rows[0].count, 10) > 0;
          console.log("É usado noutra transação?", isUsedElsewhere);

          if (!isUsedElsewhere) {
            try {
              // Extração segura do bucket e caminho relativo direto da URL do Supabase
              const urlObj = new URL(field.oldUrl);
              const pathSegments = urlObj.pathname.split('/').filter(Boolean);
              
              // Exemplo de pathname do Supabase: /storage/v1/object/public/transaction_attachments/documents/2026/09/...
              const publicIndex = pathSegments.indexOf('public');
              
              if (publicIndex !== -1 && pathSegments.length > publicIndex + 1) {
                const bucketName = pathSegments[publicIndex + 1];
                const relativePath = pathSegments.slice(publicIndex + 2).join('/');

                console.log(`Bucket identificado: ${bucketName} | Caminho relativo: ${relativePath}`);

                if (typeof supabase !== 'undefined' && supabase && supabase.storage) {
                  const { data, error: storageError } = await supabase.storage
                    .from(bucketName)
                    .remove([relativePath]);

                  if (storageError) {
                    console.error("❌ Erro retornado pelo Supabase Storage:", storageError.message);
                  } else {
                    console.log("✅ Arquivo deletado com sucesso do Supabase!", data);
                  }
                } else {
                  console.error("❌ ERRO: A variável 'supabase' não está definida ou importada neste ficheiro de rotas!");
                }
              } else {
                console.error("❌ Não foi possível encontrar o segmento 'public' na URL:", field.oldUrl);
              }
            } catch (urlErr) {
              console.error("❌ Erro ao fazer parsing da URL do Supabase:", urlErr.message);
            }
          }
        }
      }

      // 3. Executa o UPDATE no PostgreSQL
      const finalDueDate = due_date || dataVencimento;
      const finalSupplier = supplier || fornecedor;
      const finalCategory = category || categoria;
      const finalAmount = Number(amount || valor || 0);

      const result = await pool.query(
        `
        UPDATE transactions
        SET 
          due_date = $1,
          supplier = $2,
          category = $3,
          amount = $4,
          status = $5,
          nfe_url = $6,
          xml_url = $7,
          boleto_url = $8, 
          receipt_url = $9
        WHERE id = $10
        RETURNING *;
        `, 
        [
          finalDueDate, 
          finalSupplier, 
          finalCategory, 
          finalAmount, 
          status || "Pendente", 
          finalNfeUrl, 
          finalXmlUrl, 
          finalBoletoUrl, 
          finalReceiptUrl, 
          numericId
        ]
      );

      console.log("RESULTADO DO BANCO (RETURNING):", result.rows[0]);

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

export default router;