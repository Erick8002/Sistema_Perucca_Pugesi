import { CheckCircle2, AlertTriangle, ChartNoAxesCombined } from "lucide-react";

export default function KpiCards({
  totalExpenses = 0,
  expensesCount = 0,
  totalPaid = 0,
  paidCount = 0,
  totalPending = 0,
  pendingCount = 0,
  selectedCardStatus = "Todos",
  setSelectedCardStatus,
}) {
  //Vai receber o valor e vai formatar em real
  const formatCurrency = (val) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    // Conteiner with all KPI cards
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Card Total de Gastos */}
      <div
      onClick={() => setSelectedCardStatus("Todos")}
      className={`bg-white p-5 rounded-xl border-2 shadow-sm transition-all duration-300 hover:scale-[1.01] cursor-pointer ${
        selectedCardStatus === "Todos"
          ? "border-purple-600 shadow-md ring-1 ring-purple-400"
          : "border-transparent hover:border-purple-900/40"
       }`}
       >
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 font-medium w-fit">
            <p className="cursor-text">Total de Gastos na Tabela</p>
          </span>
          <ChartNoAxesCombined className="w-4 h-4 text-purple-600" />
        </div>
        <div className="text-2xl font-bold text-gray-900 mt-1 w-fit">
          <p className="cursor-text">{formatCurrency(totalExpenses)}</p>
        </div>
        <span className="text-xs text-gray-400 mt-2 block w-fit">
          <p className="cursor-text">{expensesCount} faturas no total</p>
        </span>
      </div>

      {/* Card Contas Pagas */}
      <div
        onClick={() => setSelectedCardStatus("Pago")}
        className={`bg-white p-5 rounded-xl border-2 shadow-sm transition-all duration-300 hover:scale-[1.01] cursor-pointer ${
          selectedCardStatus === "Pago"
            ? "border-emerald-600 shadow-md ring-1 ring-emerald-400"
            : "border-transparent hover:border-emerald-600/40"
        }`}
        >
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 font-medium w-fit">
            <p className="cursor-text">Contas Pagas</p>
          </span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-2xl font-bold text-gray-900 mt-1 w-fit">
          <p className="cursor-text">{formatCurrency(totalPaid)}</p>
        </div>
        <span className="text-xs text-emerald-600 font-medium mt-2 block w-fit">
          <p className="cursor-text">{paidCount} fatura(s) pagas</p>
        </span>
      </div>

      {/* Card Contas Pendentes*/}
      <div
        onClick={() => setSelectedCardStatus("Pendente")}
        className={`bg-white p-5 rounded-xl border-2 shadow-sm transition-all duration-300 hover:scale-105 cursor-pointer ${
          selectedCardStatus === "Pendente"
            ? "border-amber-600 shadow-md "
            : "border-transparent hover:border-amber-600/40"
      }`}
      >
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 font-medium w-fit">
            <p className="cursor-text">Contas Pendentes</p>
          </span>
          <AlertTriangle className="w-4 h-4 text-amber-600" />
        </div>
        <div className="text-2xl font-bold text-gray-900 mt-1 w-fit">
          <p className="cursor-text">{formatCurrency(totalPending)}</p>
        </div>
        <span className="text-xs text-amber-600 font-medium mt-2 block w-fit">
          <p className="cursor-text">{pendingCount} Fatura(s) a pagar</p>
        </span>
      </div>
    </div>
  );
}
