import ReactDOM from "react-dom";
import {
  X,
  Calendar,
  Tag,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Layers,
} from "lucide-react";

export function TransactionDetailsDrawer({
  transaction,
  isOpen,
  onClose,
  getTransactionStatus,
  getInstallmentProgress,
  transactions = []
}) {
  if (!transaction) return null;

  const currentStatus = getTransactionStatus(transaction);

  const renderStatusBadge = () => {
    switch (currentStatus) {
      case "Pago":
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Pago
          </span>
        );
      case "Atrasado":
        return (
          <span className="bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Atrasado
          </span>
        );
      case "Pendente":
      default:
        return (
          <span className="bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Pendente
          </span>
        );
    }
  };

  return ReactDOM.createPortal(
    <>
      {/* Backdrop (Fundo escurecido) com Fade-In */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Painel Lateral (Slide vindo da direita, ocupando 30% da tela) */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[400px] md:w-[30%] bg-white shadow-2xl border-l border-slate-200 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Detalhes da Transação
            </h2>
            <p className="text-xs text-slate-400">ID: #{transaction.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Card de Valor Principal */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Valor Total
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              R${" "}
              {Number(transaction.valor || 0).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </div>
            <div className="mt-3 inline-flex items-center gap-1.5">
              {renderStatusBadge()}
            </div>
          </div>

          {/* Detalhes da Fatura */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Fornecedor</p>
                <p className="text-sm font-semibold text-slate-800">
                  {transaction.fornecedor}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Data de Vencimento</p>
                <p className="text-sm font-semibold text-slate-800">
                  {transaction.vencimento
                    ? new Date(transaction.vencimento).toLocaleDateString(
                        "pt-BR",
                      )
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Categoria / Tipo</p>
                <p className="text-sm font-semibold text-slate-800">
                  {transaction.categoria || "Geral"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100/80">
              <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Parcelamento</p>
                <p className="text-sm font-semibold text-slate-800">
                  {getInstallmentProgress(transaction, transactions)} parcelas pagas
                  <span className="text-xs font-normal text-slate-500 ml-1.5">
                    (Parcela {transaction?.current_installment || 1} de {" "}
                    {transaction?.total_installment || 1})
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>,
    document.body,
  );
}
