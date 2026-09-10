import React, { useState, useRef, useEffect } from "react";
import CustomSelect from "./CustomSelect";
import { DateInput } from "./DateInput";
import { ActionMenu } from "./ActionMenu";
import { NewTransactionModal } from "./NewTransactionModal";
import { Search, FileText, Plus, BetweenHorizonalEnd } from "lucide-react";

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
  monthOptions,
  onPageDataChange,
}) {
  const [currentPage, setCurrentPage] = useState(1); // Pega a página atual
  const [itemsPerPage, setItemsPerPage] = useState(10); // Pega a quantidade de items por página que o usuário quer
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentMonthIndex = monthOptions[new Date().getMonth() + 1];

  const handleSaveTransaction = (newTransaction) => {
    const rawDate = newTransaction.vencimento || newTransaction.dueDate;
    const validDate = rawDate ? rawDate : new Date().toISOString().split("T")[0];
    
    const maxId = transactions.length > 0
      ? Math.max(...transactions.map((item) => Number(item.id) || 0))
      : 0;

    const createdTransaction = {
      id: maxId + 1,
      vencimento: validDate,
      fornecedor: newTransaction.fornecedor || newTransaction.provider,
      categoria: newTransaction.categoria || newTransaction.categoryOptions,
      valor: newTransaction.valor ?? newTransaction.value ?? 0,
      status: newTransaction.status === "Pago" || newTransaction.status === "paid" ? "Pago" : "Pendente",
    };

    setTransactions((prev) => [createdTransaction, ...prev]);
    setIsModalOpen(false);
    setCurrentPage(1);
  }

  const handleDeleteTransaction = (idToDelete) => {
    setTransactions((prev) => prev.filter((item) => item.id !== idToDelete));
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
    setMonthTableFilter(monthOptions[0])
  };

  useEffect(() => {
    const activeDate = startDate || endDate;
    const activeStartDateMonth = startDate? startDate.split("-")[1] : false;
    const activeEndDateMonth = endDate? endDate.split("-")[1] : false;

    if(activeDate) {
      const [, monthString] = activeDate.split("-");
      const monthIndex = parseInt(monthString, 10);
      const arrayMonthOptions = monthOptions[monthIndex];

      if(activeStartDateMonth && activeEndDateMonth) {
        if(activeStartDateMonth !== activeEndDateMonth) {
          setMonthTableFilter(monthOptions[0]);
        }
      } else if(arrayMonthOptions && monthTableFilter !== arrayMonthOptions){
        setMonthTableFilter(arrayMonthOptions);
      }
    }
  }, [startDate, endDate, monthTableFilter, monthOptions, setMonthTableFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryTableHeader, monthTableFilter, startDate, endDate, filterTransactions, searchTerm]);

  const dataToFilter = Array.isArray(filterTransactions) ? filterTransactions : transactions;
  const normalizedSearchTerm = searchTerm.trim().toLocaleLowerCase();
  const filteredTransactions = dataToFilter.filter((item) => {
    if (!normalizedSearchTerm) return true;

    return [
      item.fornecedor,
      item.fatura,
      item.categoria,
      item.vencimento,
      item.valor,
      item.status,
    ].some((value) =>
      String(value ?? "").toLocaleLowerCase().includes(normalizedSearchTerm)
    );
  });

  const dataToSort = filteredTransactions;

  const formatCurrency = (value) => {
    const valueAsString = String(value ?? "0").replace("R$", "").replace(/\s/g, "").trim();
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
    if(!a?.vencimento || !b?.vencimento) return 0;
    return a.vencimento.localeCompare(b.vencimento);
  });

  const STATUS_STYLES = {
    Pago: "bg-emerald-100 text-emerald-700",
    Pendente: "bg-amber-100 text-amber-700",
    Atrasado: "bg-rose-100 text-rose-700",
  };

  const getTransactionStatus = (item) => {
    if (item.status === "Pago") return "Pago";

    const today = new Date();
    today.setHours(0, 0, 0, 0); //Setando a hr, min, seg e ms para zero para ele fazer um comparativo apenas das datas

    const [year, month, day] = item.vencimento.split("-"); // Utilizando o split('/') para tirar a barra do texto e guardar apenas o número da data
    const dueDate = new Date(year, month - 1, day); // criando o objeto da data de vencimento, o "month-1" pois o js conta os meses do (0)

    // console.log(
    //   "Data do item:",
    //   item.vencimento,
    //   "=> Convertida para:",
    //   dueDate,
    // );

    if (dueDate < today) {
      return "Atrasado";
    }

    return "Pendente";
  };

  const totalItems = sortedTransactions.length; // Pega a quantidade total de items que possui na tabela
  const startItems = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1; // Serve para verificar quantas páginas inteiras já ficaram para trás, sempre retornando 1, 11, 21...
  const endItems = Math.min(currentPage * itemsPerPage, totalItems); // O Math.min compara o menor número entre os dois parâmetros dentro dele, se tornando uma "trava de segurança"
  const indexOfLastItem = currentPage * itemsPerPage; // Pega o índice do último item da página
  const indexOfFirstItem = indexOfLastItem - itemsPerPage; // Pega o índice do primeiro item da página
  const currentTransactions = sortedTransactions.slice(indexOfFirstItem, indexOfLastItem); // Pega as transações que estão na página atual
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
            />
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#4A2E56] hover:bg-[#382242] text-white font-medium px-3 py-1.5 rounded-md flex items-center gap-1 shrink-0">
            <Plus className="w-3.5 h-3.5" /> Novo Gasto
          </button>

          <NewTransactionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveTransaction}
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

          {(startDate || endDate || monthTableFilter !== monthOptions[0]) && (
            <button
              type="button"
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setMonthTableFilter(monthOptions[0]);
              }}
              className="text-xs font-medium text-gray-500 hover:text-purple-600 transition-colors underline cursor-pointer"
            >
              Limpar datas
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="min-w-[720px] w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-100 text-gray-400 font-medium">
              <th className="pb-3 w-1/6 font-medium">Vencimento</th>
              <th className="pb-3 w-2/6 font-medium">Fornecedor</th>
              <th className="pb-3 w-1/6 font-medium">Categoria</th>
              <th className="pb-3 w-1/6 font-medium">Valor</th>
              <th className="pb-3 w-1/6 font-medium">Status</th>
              <th className="pb-3 font-medium text-right pr-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-gray-700">
            {currentTransactions.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-10 text-center text-gray-400">
                  <FileText className="mx-auto mb-2 h-5 w-5" />
                  Nenhum lançamento encontrado.
                </td>
              </tr>
            ) : currentTransactions.map((item) => {
              const currentStatus = getTransactionStatus(item);

              return (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="py-3">
                    {item.vencimento.split("-").reverse().join("/")}
                  </td>
                  <td className="py-3 font-medium text-gray-900">
                    {item.fornecedor}
                  </td>
                  <td className="py-3 text-gray-500">{item.categoria}</td>
                  <td className="py-3 font-semibold">R$ {formatCurrency(item.valor)}</td>
                  <td className="py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${
                        STATUS_STYLES[currentStatus] ||
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {currentStatus}
                    </span>
                  </td>
                  <td className="py-3 text-right pr-2">
                    <ActionMenu item={item} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-gray-400 pt-2 border-t border-gray-50">
        <span>Mostrando {sortedTransactions.length === 0 ? 0: indexOfFirstItem + 1} - {Math.min(indexOfLastItem, sortedTransactions.length)} de {sortedTransactions.length} lançamentos</span>
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
            )
          })}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-2 py-1 text-xs text-gray-500 disabled:opacity-30 hover:bg-gray-100 rounded"
          >
            ›
          </button>
        </div>
        <div>
          Itens por página:{" "}
          <select
            value={itemsPerPage}onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}            
            className="bg-transparent border rounded text-[11px]">
            <option value={1}>1</option>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
    </div>
  );
}
