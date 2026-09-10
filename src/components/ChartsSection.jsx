import React from 'react';

const categoryColors = [
  '#6B3A5D',
  '#A8A370',
  '#5F5F63',
  '#7C9EB5',
  '#DCAFA6',
];

const parseCurrency = (value) => {
  if (!value) return 0;

  const normalized = String(value)
    .replace('R$', '')
    .replace(/\s/g, '')
    .trim();

  const numericString = normalized.includes(',')
    ? normalized.replace(/\./g, '').replace(',', '.')
    : normalized;

  return Number(numericString) || 0;
};

export default function ChartsSection({ transactions = [] }) {
  const categoryTotals = transactions.reduce((acc, item) => {
    if (!item?.categoria) return acc;

    const category = item.categoria;
    acc[category] = (acc[category] || 0) + parseCurrency(item.valor);
    return acc;
  }, {});

  const categoryEntries = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const totalCategoryValue = categoryEntries.reduce((acc, [, value]) => acc + value, 0);

  const donutGradient = categoryEntries.length > 0
    ? `conic-gradient(${categoryEntries.map(([category, value], index) => {
        const percentage = (value / totalCategoryValue) * 100;
        const start = categoryEntries.slice(0, index).reduce((acc, [, previousValue]) => acc + (previousValue / totalCategoryValue) * 100, 0);
        const end = start + percentage;

        return `${categoryColors[index % categoryColors.length]} ${start}% ${end}%`;
      }).join(', ')})`
    : 'conic-gradient(#E5E7EB 0% 100%)';

  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const monthlyValues = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    date.setDate(1);

    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    const monthKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;

    const total = transactions.reduce((acc, transaction) => {
      if (!transaction?.vencimento) return acc;

      const [transactionYear, transactionMonth] = transaction.vencimento.split('-');
      if (`${transactionYear}-${transactionMonth}` === monthKey) {
        return acc + parseCurrency(transaction.valor);
      }

      return acc;
    }, 0);

    return {
      label: monthNames[monthIndex],
      value: total,
    };
  });

  const maxMonthlyValue = Math.max(...monthlyValues.map((item) => item.value), 1);

  return (
    <div className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-2">
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-sm font-bold text-gray-800">Gastos por Categoria</h3>

        {categoryEntries.length > 0 ? (
          <div className="flex items-center justify-around gap-4">
            <div className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-8 border-gray-100" style={{ background: donutGradient }}>
              <div className="z-10 flex h-16 w-16 items-center justify-center rounded-full bg-white text-[10px] font-semibold text-gray-700">
                {totalCategoryValue > 0 ? 'Total' : '0'}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {categoryEntries.map(([category, value], index) => {
                const percentage = totalCategoryValue > 0 ? ((value / totalCategoryValue) * 100).toFixed(0) : 0;

                return (
                  <div key={category} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: categoryColors[index % categoryColors.length] }}></span>
                    <span className="text-gray-600">
                      {category} <strong className="text-gray-900">({percentage}%)</strong>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm text-gray-400">
            Ainda não há lançamentos para este resumo.
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-sm font-bold text-gray-800">Evolução de Gastos</h3>

        {monthlyValues.some((item) => item.value > 0) ? (
          <>
            <div className="flex h-36 items-end justify-between gap-3 border-b border-l border-gray-200 px-2 pb-1">
              {monthlyValues.map((item, index) => (
                <div key={`${item.label}-${index}`} className="flex w-full flex-col items-center justify-end gap-2">
                  <span className="text-[10px] font-medium text-gray-500">R$ {item.value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-[#5F5F63] to-[#A8A370]"
                    style={{ height: `${Math.max((item.value / maxMonthlyValue) * 100, item.value > 0 ? 18 : 0)}%` }}
                  />
                </div>
              ))}
            </div>

            <div className="mt-2 flex justify-between px-2 text-[11px] font-medium text-gray-700">
              {monthlyValues.map((item) => (
                <span key={item.label}>{item.label}</span>
              ))}
            </div>
          </>
        ) : (
          <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm text-gray-400">
            Ainda não há histórico suficiente para gerar o gráfico.
          </div>
        )}
      </div>
    </div>
  );
}