import React, { useState, useRef, useEffect } from "react";
import CustomSelect from "./CustomSelect";
import { DateInput } from "./DateInput";
import { ActionMenu } from "./ActionMenu";
import { NewTransactionModal } from "./NewTransactionModal";
import { TransactionDetailsDrawer } from "./TransactionDetailsDrawer";
import { Search, FileText, Plus, BetweenHorizonalEnd, FileCode, Barcode, Receipt } from "lucide-react";
import { createPortal } from "react-dom";

export default function TransactionsTable({
  filterTransactions,
  transactions,
  setTransactions,
  categoryTableHeader,
  setCategoryTableHeader,
  monthTableFilter,
  setMonthTableFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  categoryOptions,
  statusOptions,
  monthOptions,
  onPageDataChange,
  selectedAccount,
  categories,
  setCategories,
  handleDeleteCategory,
  isCategoryModalOpen,
  setIsCategoryModalOpen,
  handleCreateCategory,
  newCategoryName,
  setNewCategoryName
}) {
  const [currentPage, setCurrentPage] = useState(1); // Pega a página atual
  const [itemsPerPage, setItemsPerPage] = useState(10); // Pega a quantidade de items por página que o usuário quer
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const currentMonthIndex = monthOptions[new Date().getMonth() + 1];

  const isEditing = Boolean(editingTransaction?.id);
  const handleSaveTransaction = async (newTransaction) => {
    if (!selectedAccount) {
      alert("Selecione uma conta antes de criar uma transação.");
      return;
    }

    console.log("isEditing: " ,isEditing);
    const url = isEditing
      ? `http://localhost:3001/api/transactions/${editingTransaction.id}`
      : "http://localhost:3001/api/transactions/";

    const method = isEditing ? "PUT" : "POST";
    const rawDate = newTransaction.vencimento || newTransaction.dueDate;
    const validDate = rawDate
      ? rawDate
      : new Date().toISOString().split("T")[0];
      
      const totalInstallmentNum = parseInt(newTransaction.installment, 10) || 1;

      // console.log("Payload enviado para API:", {
      //   account_id: selectedAccount.id,
      //   due_date: validDate,
      //   total_installment: totalInstallmentNum,
      //   supplier: newTransaction.fornecedor,
      //   category: newTransaction.categoria,
      //   amount: newTransaction.valor,
      //   status: newTransaction.status || "Pendente",  
      //   nfe_url: newTransaction.nfe_url || null,
      //   xml_url: newTransaction.xml_url || null,
      //   boleto_url: newTransaction.boleto_url || null,
      //   receipt_url: newTransaction.receipt_url || null
      // });

      const payload = {
        account_id: selectedAccount.id,
        due_date: validDate,
        supplier: newTransaction.fornecedor,
        category: newTransaction.categoria,
        amount: Number(newTransaction.valor),
        status: newTransaction.status || "Pendente",
        ...(isEditing ? {} : { total_installment: totalInstallmentNum }),
        nfe_url: newTransaction.nfe_url || null,
        xml_url: newTransaction.xml_url || null,
        boleto_url: newTransaction.boleto_url || null,
        receipt_url: newTransaction.receipt_url || null
      }
      console.log("Payload enviado para API: ", payload);
      console.log("URL: ", url);
      console.log("Método: ", method)
      
      
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if(!response.ok) {
        throw new Error(`Erro na requisição: ${response.statusText}`);
      }

      const responseData = await response.json();

      if (isEditing) {
      const updatedFormatted = {
        id: responseData.id,
        accountId: responseData.account_id || selectedAccount.id,
        vencimento: responseData.due_date ? String(responseData.due_date).slice(0, 10) : validDate,
        fornecedor: responseData.supplier,
        categoria: responseData.category,
        valor: Number(responseData.amount),
        status: responseData.status,
        current_installment: responseData.current_installment,
        total_installment: responseData.total_installment,
        group_id: responseData.group_id,
        nfe_url: responseData.nfe_url,
        boleto_url: responseData.boleto_url,
        xml_url: responseData.xml_url,
        receipt_url: responseData.receipt_url
      };

      setTransactions((prev) =>
          prev.map((item) => (item.id === updatedFormatted.id ? updatedFormatted : item))
        );
      } else {
        const newItems = Array.isArray(responseData) ? responseData : [responseData];

        const formatedTransactions = newItems.map((item) => ({
          id: item.id,
          accountId: item.account_id || selectedAccount.id,
          vencimento: item.due_date ? String(item.due_date).slice(0, 10) : validDate,
          fornecedor: item.supplier,
          categoria: item.category,
          valor: Number(item.amount),
          status: item.status,
          current_installment: item.current_installment,
          total_installment: item.total_installment,
          group_id: item.group_id,
          nfe_url: item.nfe_url,
          boleto_url: item.boleto_url,
          xml_url: item.xml_url,
          receipt_url: item.receipt_url
        }));

        // Adiciona as novas parcelas no topo da lista
        setTransactions((prev) => [...formatedTransactions, ...prev]);
      }

      setIsModalOpen(false);
      setEditingTransaction(null);
      setCurrentPage(1);

    } catch (error) {
      console.error("Erro ao salvar transação: ", error);
      alert("Falha ao salvar a transação.");
    }
  };

  const handleDeleteTransaction = async (idToDelete) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/transactions/${idToDelete}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Não foi possível excluir a transação");
      }

      setTransactions((prev) => prev.filter((item) => item.id !== idToDelete));
    } catch (error) {
      console.error("Erro ao excluir transação: ", error.message);
    }
  };

  const handleMonthSelect = (selectedMonth) => {
    setMonthTableFilter(selectedMonth);
    setStartDate("");
    setEndDate("");
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    setMonthTableFilter(monthOptions[0]);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    setMonthTableFilter(monthOptions[0]);
  };

  const handleToggleStatus = async (transaction) => {
    const newStatus = transaction.status === "Pago" ? "Pendente" : "Pago";

    setTransactions((prevTransactions) =>
      prevTransactions.map((item) =>
        item.id === transaction.id ? { ...item, status: newStatus } : item,
      ),
    );

    try {
      const response = await fetch(
        `http://localhost:3001/api/transactions/${transaction.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (!response.ok) {
        throw new Error("Falha ao atualizar status no servidor");
      }
    } catch (error) {
      console.error("Erro na requisição: ", error);

      setTransactions((prevTransactions) =>
        prevTransactions.map((item) =>
          item.id === transaction.id ? { ...item, status: newStatus } : item,
        ),
      );
    }
  };

  const handleRowClick = (transaction) => {
    setSelectedTransaction(transaction);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleOpenCreateModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (transaction) => {
    console.log("1. Transação recebida na tabela:", transaction);
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  }

  const getInstallmentProgress = (transaction, allTransactions = []) => {
    if (!transaction) return "0/1";

    const total = transaction.total_installment || 1;
    const current = transaction.current_installment || 1;

    // Se é uma transação simples (1 parcela), retorna 1/1 ou 0/1 baseado no status
    if (total === 1) {
      return transaction.status === "Pago" ? "1/1" : "0/1";
    }

    if (transaction.group_id) {
      const sameGroupTransactions = allTransactions.filter((t) => t.group_id === transaction.group_id);

      // Conta quantas parcelas com número <= ao atual estão realmente marked como "Pago", e Math.min para não ultrapassar o total de parcelas.
      const paidCount = Math.min((sameGroupTransactions.filter((t) => t.status === "Pago").length), total);
      
      return `${paidCount}/${total}`;
    }

    //Fallback para transações antigas que não possuem group_id registrado
    const sameGroupFallBack = allTransactions.filter(
      (t) =>
        t.fornecedor === transaction.fornecedor &&
        t.total_installment === total
    );

    const paidCountFallback = Math.min((sameGroupFallBack.filter((t) => t.status === "Pago").length), total);

    return `${paidCountFallback}/${total}`;
  };

  useEffect(() => {
    const activeDate = startDate || endDate;
    const activeStartDateMonth = startDate ? startDate.split("-")[1] : false;
    const activeEndDateMonth = endDate ? endDate.split("-")[1] : false;

    if (activeDate) {
      const [, monthString] = activeDate.split("-");
      const monthIndex = parseInt(monthString, 10);
      const arrayMonthOptions = monthOptions[monthIndex];

      if (activeStartDateMonth && activeEndDateMonth) {
        if (activeStartDateMonth !== activeEndDateMonth) {
          setMonthTableFilter(monthOptions[0]);
        }
      } else if (arrayMonthOptions && monthTableFilter !== arrayMonthOptions) {
        setMonthTableFilter(arrayMonthOptions);
      }
    }
  }, [startDate, endDate, monthTableFilter, monthOptions, setMonthTableFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryTableHeader, monthTableFilter, startDate, endDate, searchTerm]);

  const dataToFilter = Array.isArray(filterTransactions)
    ? filterTransactions
    : transactions;
  const normalizedSearchTerm = searchTerm.trim().toLocaleLowerCase();
  const filteredTransactions = dataToFilter.filter((item) => {
    if (!normalizedSearchTerm) return true;

    return [
      item.fornecedor,
      item.categoria,
      item.vencimento,
      item.valor,
      item.status,
      item.total_installment,
    ].some((value) =>
      String(value ?? "")
        .toLocaleLowerCase()
        .includes(normalizedSearchTerm),
    );
  });

  const dataToSort = filteredTransactions;

  const formatCurrency = (value) => {
    const valueAsString = String(value ?? "0")
      .replace("R$", "")
      .replace(/\s/g, "")
      .trim();
    const normalizedValue = valueAsString.includes(",")
      ? valueAsString.replace(/\./g, "").replace(",", ".")
      : valueAsString;
    const numericValue = Number(normalizedValue) || 0;

    return numericValue.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const sortedTransactions = [...(dataToSort || [])].sort((b, a) => {
    if (!a?.vencimento || !b?.vencimento) return 0;
    return a.vencimento.localeCompare(b.vencimento);
  });

  const getTransactionStatus = (item) => {
    if (!item) return "Pendente";

    if (item.status === "Pago") return "Pago";

    const rawDate = item.vencimento;
    if (!rawDate) return "Pendente";

    try {
      const cleanDateStr = String(rawDate).split("T")[0];
      const parts = cleanDateStr.split("-");

      if (parts.length !== 3) return "Pendente";

      const [year, month, day] = parts.map(Number);
      const dueDate = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0); //Setando a hr, min, seg e ms para zero para ele fazer um comparativo apenas das datas

      if (dueDate < today) {
        return "Atrasado";
      }
    } catch (error) {
      console.error("Erro ao validar data de vencimento: ", error);
      return "Pendente";
    }

    return "Pendente";
  };

  const totalItems = sortedTransactions.length; // Pega a quantidade total de items que possui na tabela
  const startItems =
    totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1; // Serve para verificar quantas páginas inteiras já ficaram para trás, sempre retornando 1, 11, 21...
  const endItems = Math.min(currentPage * itemsPerPage, totalItems); // O Math.min compara o menor número entre os dois parâmetros dentro dele, se tornando uma "trava de segurança"
  const indexOfLastItem = currentPage * itemsPerPage; // Pega o índice do último item da página
  const indexOfFirstItem = indexOfLastItem - itemsPerPage; // Pega o índice do primeiro item da página
  const currentTransactions = sortedTransactions.slice(
    indexOfFirstItem,
    indexOfLastItem,
  ); // Pega as transações que estão na página atual
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);

  const previousPageDataRef = useRef("");

  useEffect(() => {
    if (!onPageDataChange) return;

    const serializedPageData = JSON.stringify(currentTransactions);

    if (serializedPageData !== previousPageDataRef.current) {
      previousPageDataRef.current = serializedPageData;
      onPageDataChange(currentTransactions);
    }
  }, [currentTransactions, onPageDataChange]);

  return (
    <>
      {/* Drawer mantida no topo, mas dentro da Fragment */}
      <TransactionDetailsDrawer
        transaction={selectedTransaction}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        getTransactionStatus={getTransactionStatus}
        getInstallmentProgress={getInstallmentProgress}
        transactions={transactions}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-6 space-y-reverse">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <h2 className="text-base font-bold text-gray-800 ">
            Todos os Gastos
          </h2>

          <div className="flex items-center gap-2 flex-1 max-w-3xl">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Pesquisar por fornecedor ou fatura..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-md pl-3 pr-8 py-1.5 text-xs focus:outline-none focus:border-purple-500"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2" />
            </div>

            <div className="p-2">
              <CustomSelect
                options={categoryOptions}
                selected={categoryTableHeader}
                onSelect={setCategoryTableHeader}
                onAddNew={() => setIsCategoryModalOpen(true)}
                addNewLabel="Nova Categoria"
                onDeleteCategory={handleDeleteCategory}
              />
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#4A2E56] hover:bg-[#382242] text-white font-medium px-3 py-1.5 rounded-md flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Novo Gasto
            </button>

            <NewTransactionModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSave={async (data) => {
                console.log("Dados recebidos no Pai para salvar: ", data);
                await handleSaveTransaction(data);
              }}
              categoryOptions={categoryOptions}
              statusOptions={statusOptions}
              editingTransaction={editingTransaction}
              isEditing={isEditing}
              setEditingTransaction={setEditingTransaction}
              categories={categories}
              setCategories={setCategories}
              handleDeleteCategory={handleDeleteCategory}
              isCategoryModalOpen={isCategoryModalOpen}
              setIsCategoryModalOpen={setIsCategoryModalOpen}
              handleCreateCategory={handleCreateCategory}
              newCategoryName={newCategoryName}
              setNewCategoryName={setNewCategoryName}
            />
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-3 text-xs text-gray-500 sm:flex-row sm:items-center">
          <div className="p-2">
            <CustomSelect
              options={monthOptions}
              selected={monthTableFilter}
              onSelect={handleMonthSelect}
              currentOption={currentMonthIndex}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <DateInput
                value={startDate}
                onChange={handleStartDateChange}
                placeholder={"Data Inicial"}
              />
              <DateInput
                value={endDate}
                onChange={handleEndDateChange}
                placeholder={"Data Final"}
              />
            </div>

            {(startDate || endDate || monthTableFilter !== monthOptions[0] || searchTerm) && (
              <button
                type="button"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setMonthTableFilter(monthOptions[0]);
                  setSearchTerm("");
                }}
                className="text-xs font-medium text-gray-500 hover:text-purple-600 transition-colors underline cursor-pointer"
              >
                Limpar datas
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border-gray-100">
          <table className="min-w-[720px] w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-medium">
                <th className="pb-3 pl-4 w-[15%] font-medium">Vencimento</th>
                <th className="pb-3 w-[30%] font-medium">Fornecedor</th>
                <th className="pb-3 w-[10%] font-medium">Categoria</th>
                <th className="pb-3 w-[10%] font-medium">Valor</th>
                <th className="pb-3 pl-2 w-[8%] font-medium">Parcelas</th>
                <th className="pb-3 w-[8%] font-medium text-center">Pago</th>
                <th className="pb-3 w-[7%] font-medium text-center"></th>
                <th className="pb-3 w-[6%] font-medium text-right pr-3">Ações</th>
              </tr>
            </thead>
            <tbody className=" divide-y divide-gray-50 text-gray-700">
              {currentTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-gray-400">
                    <FileText className="mx-auto mb-2 h-5 w-5" />
                    Nenhum lançamento encontrado.
                  </td>
                </tr>
              ) : (
                currentTransactions.map((item) => {
                  const currentStatus = getTransactionStatus(item);
                  const isOverdue =
                    currentStatus === "Atrasado" || currentStatus === "Vencido";

                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleRowClick(item)}
                      className={`
                      group cursor-pointer hover:bg-gray-50/50 
                      ${
                        isOverdue
                          ? "bg-rose-100/80 hover:bg-rose-100/60 border-rose-100"
                          : "hover:bg-gray-50/50 border-gray-100"
                      }
                    `}
                    >
                      <td
                        className={`py-3 pl-4 ${isOverdue ? "text-rose-700 font-medium" : ""}`}
                      >
                        {item.vencimento.split("-").reverse().join("/")}
                      </td>
                      <td
                        className={`py-3 font-medium ${isOverdue ? "text-rose-900" : "text-gray-900"}`}
                      >
                        {item.fornecedor}
                      </td>
                      <td
                        className={`py-3 ${isOverdue ? "text-rose-800/80" : "text-gray-500"}`}
                      >
                        {item.categoria}
                      </td>
                      <td
                        className={`py-3 text-left font-semibold ${isOverdue ? "text-rose-700" : ""}`}
                      >
                        R$ {formatCurrency(item.valor)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div 
                          onClick={(e) => {
                            e.stopPropagation()
                          }}
                          className="flex items-center"
                          >
                          <span className="bg-slate-100 text-slate-600 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-slate-200 whitespace-nowrap">
                            {getInstallmentProgress(item, transactions)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(item);
                          }}
                          title={
                            currentStatus === "Pago"
                              ? "Marcar como Pendente"
                              : "Marcar como Pago"
                          }
                          className="group relative inline-flex item-center justify-center p-1 focus:outline-none"
                        >
                          {currentStatus === "Pago" && (
                            <span className="absolute inset-2 rounded-full bg-emerald-400 animate-ping-once pointer-events-none" />
                          )}
                          <div
                            className={`
                            relative w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform active:scale-75 group-hover:scale-110
                            ${
                              currentStatus === "Pago"
                                ? "bg-emerald-500 border-emerald-500 shadow-md shadow-emerald-500/30"
                                : "border-neutral-300 bg-white group-hover:border-emerald-400 group-hover:bg-emerald-50/30"
                            }
                          `}
                          >
                            <svg
                              className={`
                              w-3.5 h-3.5 text-white
                              ${currentStatus === "Pago" ? "animate-pop-check" : "opacity-0 scale-0"}
                            `}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth="3"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 14l4 4L18 7"
                              />
                            </svg>
                          </div>
                        </button>
                      </td>
                      <td className="py-4 px-2">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5 justify-center flex-wrap">
                          
                          {/* NF-e */}
                          
                            {item.nfe_url && (<a 
                              href={item.nfe_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              title="Nota Fiscal (NF-e)"
                              className="p-1 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <FileText className="w-4 h-4" /> {/* Ícone Lucide-react */}
                            </a>
                          )}
                          

                          {/* XML */}
                          
                            {item.xml_url && (<a 
                              href={item.xml_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              title="Arquivo XML"
                              className="p-1 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <FileCode className="w-4 h-4" />
                            </a>
                          )}
                          

                          {/* Boleto */}
                          
                            {item.boleto_url && (<a 
                              href={item.boleto_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              title="Boleto"
                              className="p-1 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <Barcode className="w-4 h-4" />
                            </a>
                          )}

                          {/* Comprovante */}
                        
                            {item.receipt_url && (<a 
                              href={item.receipt_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              title="Comprovante de Pagamento"
                              className="p-1 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <Receipt className="w-4 h-4" />
                            </a>
                          )}

                        </div>
                      </td>
                      <td className="py-3 text-right pr-2">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <ActionMenu
                            item={item}
                            onDelete={handleDeleteTransaction}
                            onEdit={handleOpenEditModal}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-gray-400 pt-2 border-t border-gray-50">
          <span>
            Mostrando{" "}
            {sortedTransactions.length === 0 ? 0 : indexOfFirstItem + 1} -{" "}
            {Math.min(indexOfLastItem, sortedTransactions.length)} de{" "}
            {sortedTransactions.length} lançamentos
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 text-xs text-gray-500 disabled:opacity-30 hover:bg-gray-100 rounded"
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;
              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`px-2.5 py-1 text-xs rounded-ms transition-colors ${
                    currentPage === pageNumber
                      ? "bg-purple-600 text-white font-semibold rounded"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-2 py-1 text-xs text-gray-500 disabled:opacity-30 hover:bg-gray-100 rounded"
            >
              ›
            </button>
          </div>
          <div>
            Itens por página:{" "}
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-transparent border rounded text-[11px]"
            >
              <option value={1}>1</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>
      {isCategoryModalOpen && createPortal(
        <div 
          onClick={(e) => {
            e.stopPropagation();
            setIsCategoryModalOpen(false);
            setNewCategoryName("");
          }}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <div 
          onClick={(e) => {e.stopPropagation()}}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-gray-100"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-1">Nova Categoria</h3>
            <p className="text-xs text-gray-500 mb-4">
              Cadastre uma nova categoria para organizar seus lançamentos.
            </p>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ex: Combustível, Alimentação..."
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCategoryModalOpen(false);
                    setNewCategoryName("");
                  }}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                
                <button
                  type="submit"
                  disabled={!newCategoryName.trim()}
                  className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  Salvar Categoria
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body // Injeta diretamente no body, fora do modal pai
      )}
    </>
  );
}
