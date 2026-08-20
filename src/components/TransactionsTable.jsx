import React, { useState, useRef, useEffect } from "react";
import CustomSelect from "./CustomSelect";
import { DateInput } from "./DateInput";
import { Search, FileText, Plus } from "lucide-react";
import {ActionMenu} from "./ActionMenu";

export default function TransactionsTable({
  filterTransactions,
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
}) {
  const currentMonthIndex = monthOptions[new Date().getMonth() + 1];

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

  const sortedTransactions = [...filterTransactions].sort((b, a) => {
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6 space-y-reverse">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <h2 className="text-base font-bold text-gray-800 ">
          Todos os Gastos do Mês
        </h2>

        <div className="flex items-center gap-2 flex-1 max-w-3xl">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Pesquisar por fornecedor ou fatura..."
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

          <button className="bg-[#4A2E56] hover:bg-[#382242] text-white font-medium px-3 py-1.5 rounded-md flex items-center gap-1 shrink-0">
            <Plus className="w-3.5 h-3.5" /> Novo Gasto
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-500">
        <div className="p-2">
          <CustomSelect
            options={monthOptions}
            selected={monthTableFilter}
            onSelect={handleMonthSelect}
            currentOption={currentMonthIndex}
          />
        </div>
        <div className="flex items-center gap-2">
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

      <div>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-100 text-gray-400 font-medium">
              <th className="pb-3 font-medium">Vencimento</th>
              <th className="pb-3 font-medium">Fornecedor</th>
              <th className="pb-3 font-medium">Categoria</th>
              <th className="pb-3 font-medium">Valor</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium text-right pr-4">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-gray-700">
            {sortedTransactions.map((item) => {
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
                  <td className="py-3 font-semibold">{item.valor}</td>
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

      <div className="flex justify-between items-center text-[11px] text-gray-400 pt-2 border-t border-gray-50">
        <span>Mostrando 1-10 de {sortedTransactions.length} lançamentos</span>
        <div className="flex items-center gap-1">
          <span>‹</span> <span className="font-bold text-gray-700">1</span>{" "}
          <span>2</span> <span>3</span> <span>›</span>
        </div>
        <div>
          Itens por página:{" "}
          <select className="bg-transparent border rounded text-[11px]">
            <option>10</option>
          </select>
        </div>
      </div>
    </div>
  );
}
