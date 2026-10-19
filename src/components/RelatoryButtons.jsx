import React from 'react';
import { Download, Printer, Send } from 'lucide-react';

const columns = [
  { key: 'conta', label: 'Conta' },
  { key: 'vencimento', label: 'Vencimento' },
  { key: 'fornecedor', label: 'Fornecedor' },
  { key: 'descricao', label: 'Descrição' },
  { key: 'categoria', label: 'Categoria' },
  { key: 'valor', label: 'Valor' },
  { key: 'status', label: 'Situação' },
  { key: 'parcela', label: 'Parcela' },
];

const parseCurrency = (value) => {
  const normalizedValue = String(value ?? '')
    .replace('R$', '')
    .replace(/\s/g, '')
    .trim();
  const numericString = normalizedValue.includes(',')
    ? normalizedValue.replace(/\./g, '').replace(',', '.')
    : normalizedValue;

  return Number(numericString) || 0;
};

const formatCurrency = (value) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatDate = (value) => {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return year && month && day ? `${day}/${month}/${year}` : value;
};

const getCellValue = (transaction, key, selectedAccount) => {
  if (key === 'conta') return selectedAccount?.name || '';
  if (key === 'valor') return formatCurrency(parseCurrency(transaction.valor));
  if (key === 'vencimento') return formatDate(transaction.vencimento);
  if (key === 'parcela') {
    return transaction.total_installment > 1
      ? `${transaction.current_installment || 1}/${transaction.total_installment}`
      : '';
  }

  return transaction[key] ?? '';
};

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);

const toCsvCell = (value) => {
  const text = String(value ?? '');
  const safeText = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText.replace(/"/g, '""')}"`;
};

export default function RelatoryButtons({
  transactions = [],
  selectedAccount,
}) {
  const total = transactions.reduce(
    (sum, transaction) => sum + parseCurrency(transaction.valor),
    0,
  );

  const createCsv = () => [
    columns.map(({ label }) => toCsvCell(label)).join(';'),
    ...transactions.map((transaction) =>
      columns
        .map(({ key }) => toCsvCell(getCellValue(transaction, key, selectedAccount)))
        .join(';'),
    ),
  ].join('\r\n');

  const downloadCsv = () => {
    const csv = `\uFEFF${createCsv()}`;
    const file = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const fileUrl = URL.createObjectURL(file);
    const link = document.createElement('a');
    const accountName = selectedAccount?.name || 'conta';
    const fileName = accountName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();

    link.href = fileUrl;
    link.download = `relatorio-${fileName || 'conta'}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);

    return link.download;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.alert('Permita pop-ups para imprimir o relatório.');
      return;
    }

    printWindow.opener = null;
    const rows = transactions.map((transaction) => `
      <tr>${columns.map(({ key }) =>
        `<td>${escapeHtml(getCellValue(transaction, key, selectedAccount))}</td>`,
      ).join('')}</tr>
    `).join('');
    const generatedAt = new Date().toLocaleString('pt-BR');

    printWindow.document.write(`<!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8">
          <title>Relatório financeiro</title>
          <style>
            body { color: #1f2937; font: 14px Arial, sans-serif; margin: 32px; }
            h1 { margin-bottom: 8px; }
            .summary { color: #4b5563; margin-bottom: 24px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
            th { background: #f3f4f6; }
            tfoot { font-weight: bold; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>Relatório financeiro</h1>
          <p class="summary">
            Conta: ${escapeHtml(selectedAccount?.name || 'Não selecionada')}<br>
            Lançamentos: ${transactions.length}<br>
            Total: ${escapeHtml(formatCurrency(total))}<br>
            Gerado em: ${escapeHtml(generatedAt)}
          </p>
          <table>
            <thead><tr>${columns.map(({ label }) =>
              `<th>${escapeHtml(label)}</th>`,
            ).join('')}</tr></thead>
            <tbody>${rows || `<tr><td colspan="${columns.length}">Nenhum lançamento encontrado.</td></tr>`}</tbody>
            <tfoot><tr><td colspan="${columns.length - 1}">Total</td><td>${escapeHtml(formatCurrency(total))}</td></tr></tfoot>
          </table>
        </body>
      </html>`);
    printWindow.document.close();
    printWindow.focus();
    window.setTimeout(() => printWindow.print(), 250);
  };

  const handleSendToAccounting = () => {
    const fileName = downloadCsv();
    const accountName = selectedAccount?.name || 'Não selecionada';
    const subject = `Relatório financeiro - ${accountName}`;
    const body = [
      'Olá,',
      '',
      'Segue o resumo do relatório financeiro:',
      `Conta: ${accountName}`,
      `Lançamentos: ${transactions.length}`,
      `Total: ${formatCurrency(total)}`,
      '',
      `Anexe o arquivo CSV baixado automaticamente (${fileName}) a este e-mail.`,
    ].join('\n');

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="flex justify-end gap-3 text-xs pt-2">
      <button
        type="button"
        onClick={downloadCsv}
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-4 py-2 rounded-md flex items-center gap-2"
      >
        <Download className="w-3.5 h-3.5" /> Exportar Relatório
      </button>
      <button
        type="button"
        onClick={handlePrint}
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-4 py-2 rounded-md flex items-center gap-2"
      >
        <Printer className="w-3.5 h-3.5" /> Imprimir Relatório
      </button>
      <button
        type="button"
        onClick={handleSendToAccounting}
        className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium px-4 py-2 rounded-md flex items-center gap-2"
      >
        <Send className="w-3.5 h-3.5" /> Enviar para Contabilidade
      </button>
    </div>
  );
}