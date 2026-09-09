import React, { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const parseCurrency = (value) => {
  const normalizedValue = String(value ?? '0')
    .replace(/\s/g, '')
    .trim();

  return Number(normalizedValue) || 0;
};

const formatCurrency = (value) => {
  const numericValue = typeof value === 'number' ? value : parseCurrency(value);

  return (numericValue || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const formatBrazilianNumber = (value) => {
  return (Number(value) || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function PastelCards({ transactions = [] }) {
  const [thresholdValue, setThresholdValue] = useState(3000);
  const [expandedCard, setExpandedCard] = useState(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextWeekDate = new Date(today);
  nextWeekDate.setDate(today.getDate() + 7);

  const upcomingTransactions = useMemo(
    () =>
      transactions.filter((item) => {
        const status = item.status;
        if (status === 'Pago') return false;

        const rawDate = item.vencimento;
        if (!rawDate) return false;

        const date = new Date(`${rawDate}T00:00:00`);
        if (Number.isNaN(date.getTime())) return false;

        return date >= today && date <= nextWeekDate;
      }),
    [transactions, today, nextWeekDate]
  );

  const highValueTransactions = useMemo(
    () => transactions.filter((item) => parseCurrency(item.valor) > Number(thresholdValue || 0)),
    [transactions, thresholdValue]
  );

  const employeeTransactions = useMemo(
    () =>
      transactions.filter((item) =>
        String(item.categoria ?? '')
          .toLowerCase()
          .includes('func')
      ),
    [transactions]
  );

  const monthlyTransactions = useMemo(
    () =>
      transactions.filter((item) => {
        const rawDate = item.vencimento;
        if (!rawDate) return false;

        const date = new Date(`${rawDate}T00:00:00`);
        if (Number.isNaN(date.getTime())) return false;

        return (
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear()
        );
      }),
    [transactions, today]
  );

  const cards = [
    {
      title: 'A Vencer na Semana',
      value: upcomingTransactions.reduce(
        (acc, item) => acc + parseCurrency(item.valor),
        0
      ),
      subtitle: `${upcomingTransactions.length} faturas nos próximos 7 dias`,
      style: 'amber',
      badge: null,
      details: upcomingTransactions,
    },
    {
      title: 'Contas Acima de R$',
      value: highValueTransactions.reduce(
        (acc, item) => acc + parseCurrency(item.valor),
        0
      ),
      subtitle: `${highValueTransactions.length} faturas com valor acima de R$ ${formatBrazilianNumber(thresholdValue)}`,
      style: 'purple',
      badge: null,
      editableValue: true,
      details: highValueTransactions,
    },
    {
      title: 'Gastos com Funcionários',
      value: employeeTransactions.reduce(
        (acc, item) => acc + parseCurrency(item.valor),
        0
      ),
      subtitle: 'Salários, encargos, e benefícios',
      style: 'blue',
      badge: null,
      details: employeeTransactions,
    },
    {
      title: 'Despesas Fixas Mensais',
      value: monthlyTransactions.reduce(
        (acc, item) => acc + parseCurrency(item.valor),
        0
      ),
      subtitle: `${monthlyTransactions.length} custos recorrentes do mês`,
      style: 'emerald',
      badge: null,
      details: monthlyTransactions,
    },
  ];

  const tones = {
    amber: {
      card: 'border-amber-100/60 bg-[#FAF5EE]',
      chevron: 'text-amber-700',
      panel: 'border-amber-100 bg-[#FFF9F4]',
    },
    purple: {
      card: 'border-purple-100/60 bg-[#F3EFEF]',
      chevron: 'text-purple-700',
      panel: 'border-purple-100 bg-[#F9F5FF]',
    },
    blue: {
      card: 'border-blue-100/60 bg-[#EBF3F5]',
      chevron: 'text-blue-600',
      panel: 'border-blue-100 bg-[#F3FAFD]',
    },
    emerald: {
      card: 'border-emerald-100/60 bg-[#EBF5EF]',
      chevron: 'text-emerald-600',
      panel: 'border-emerald-100 bg-[#F5FBF7]',
    },
  };

  const toggleCard = (title) => {
    setExpandedCard((current) => (current === title ? null : title));
  };

  return (
    <div className="w-full overflow-hidden">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ title, value, subtitle, style, editableValue, details = [] }) => {
          const isExpanded = expandedCard === title;

          if (editableValue) {
            return (
              <div key={title} className="space-y-3">
                <div
                  onClick={() => toggleCard(title)}
                  className={`relative min-h-[170px] cursor-pointer rounded-xl border p-4 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-5 ${tones[style].card}`}
                >
                  <div className="flex items-center justify-between gap-2 text-[11px] text-gray-500 sm:text-xs">
                    <span className="leading-snug font-medium text-gray-600">{title}</span>
                    <label
                      onClick={(event) => event.stopPropagation()}
                      className="flex items-center gap-1 rounded-lg border border-purple-200 bg-white/85 px-1.5 py-1 shadow-[0_1px_3px_rgba(109,40,217,0.08)] transition-all duration-200 hover:border-purple-300 hover:shadow-[0_2px_8px_rgba(109,40,217,0.12)] focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100"
                    >
                      <span className="text-[9px] font-bold tracking-[0.08em] text-purple-700">R$</span>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={thresholdValue}
                        onChange={(event) => setThresholdValue(Number(event.target.value) || 0)}
                        className="w-14 border-0 bg-transparent p-0 text-right text-[10px] font-semibold text-purple-900 outline-none sm:text-[11px]"
                      />
                    </label>
                  </div>

                  <div className="mt-2 text-[clamp(1.05rem,2vw,1.5rem)] font-bold leading-tight text-gray-800">
                    {formatCurrency(value)}
                  </div>

                  <p className="mt-2 text-[10px] leading-relaxed text-gray-500 sm:text-xs">
                    {subtitle}
                  </p>

                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center justify-center">
                    <ChevronDown
                      className={`h-4 w-4 cursor-pointer transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''} ${tones[style].chevron}`}
                    />
                  </div>
                </div>

                {isExpanded && (
                  <div className={`rounded-xl border border-white/60 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur-sm ${tones[style].panel}`}>
                    <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500 opacity-90">
                      Faturas relacionadas
                    </div>
                    <div className="space-y-2.5">
                      {details.length === 0 ? (
                        <p className="text-[11px] text-gray-400 italic">Nenhuma fatura encontrada.</p>
                      ) : (
                        details.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-3 rounded-lg border border-white/60 bg-white/85 px-3 py-2.5 text-[11px] text-gray-600 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all duration-150 hover:border-white/80 hover:bg-white/90 hover:shadow-[0_2px_6px_rgba(0,0,0,0.05)]"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-[12px] font-medium text-gray-800">{item.fornecedor}</p>
                              <p className="mt-0.5 text-[10px] text-gray-400">{item.vencimento}</p>
                            </div>
                            <span className="shrink-0 text-[12px] font-semibold text-gray-900">
                              {formatCurrency(parseCurrency(item.valor))}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          }

          return (
            <div key={title} className="space-y-3">
              <div
                onClick={() => toggleCard(title)}
                className={`relative min-h-[170px] cursor-pointer rounded-xl border p-4 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-5 ${tones[style].card}`}
              >
                <span className="block text-[11px] font-medium text-gray-600 sm:text-xs">{title}</span>

                <div className="mt-2 text-[clamp(1.05rem,2vw,1.5rem)] font-bold leading-tight text-gray-800">
                  {formatCurrency(value)}
                </div>

                <p className="mt-2 text-[10px] leading-relaxed text-gray-500 sm:text-xs">
                  {subtitle}
                </p>

                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center justify-center">
                  <ChevronDown
                    className={`h-4 w-4 cursor-pointer transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''} ${tones[style].chevron}`}
                  />
                </div>
              </div>

              {isExpanded && (
                <div className={`rounded-xl border border-white/60 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur-sm ${tones[style].panel}`}>
                  <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500 opacity-90">
                    Faturas relacionadas
                  </div>
                  <div className="space-y-2.5">
                    {details.length === 0 ? (
                      <p className="text-[11px] text-gray-400 italic">Nenhuma fatura encontrada.</p>
                    ) : (
                      details.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-white/60 bg-white/85 px-3 py-2.5 text-[11px] text-gray-600 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all duration-150 hover:border-white/80 hover:bg-white/90 hover:shadow-[0_2px_6px_rgba(0,0,0,0.05)]"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-[12px] font-medium text-gray-800">{item.fornecedor}</p>
                            <p className="mt-0.5 text-[10px] text-gray-400">{item.vencimento}</p>
                          </div>
                          <span className="shrink-0 text-[12px] font-semibold text-gray-900">
                            {formatCurrency(parseCurrency(item.valor))}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}