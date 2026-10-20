import React, { useEffect, useRef, useState } from 'react';
import { Download, FileSpreadsheet, FileText, Printer, Send } from 'lucide-react';

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

const escapeXml = (value) =>
  String(value ?? '').replace(/[<>&'"]/g, (character) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;',
  })[character]);

const safePdfText = (value) =>
  String(value ?? '').replace(
    /[^\u0000-\u00FF\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u20AC]/g,
    '?',
  );

const getFileBaseName = (accountName) => {
  const safeAccountName = accountName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

  return `relatorio-${safeAccountName || 'conta'}-${new Date().toISOString().slice(0, 10)}`;
};

const downloadFile = (content, mimeType, fileName) => {
  const file = new Blob([content], { type: mimeType });
  const fileUrl = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
};

const createExcelXml = (transactions, selectedAccount, total) => {
  const cell = (value, type = 'String', style = '') =>
    `<Cell${style ? ` ss:StyleID="${style}"` : ''}><Data ss:Type="${type}">${escapeXml(value)}</Data></Cell>`;
  const row = (cells) => `<Row>${cells.join('')}</Row>`;
  const reportRows = [
    row([cell('Relatório financeiro', 'String', 'Title')]),
    row([cell('Conta'), cell(selectedAccount?.name || 'Não selecionada')]),
    row([cell('Quantidade de lançamentos'), cell(transactions.length, 'Number')]),
    row([cell('Total'), cell(total, 'Number', 'Currency')]),
    row([]),
    row(columns.map(({ label }) => cell(label, 'String', 'Header'))),
    ...transactions.map((transaction) =>
      row(columns.map(({ key }) => {
        if (key === 'valor') {
          return cell(parseCurrency(transaction.valor), 'Number', 'Currency');
        }
        return cell(getCellValue(transaction, key, selectedAccount));
      })),
    ),
    row([cell('Total'), ...columns.slice(1, 5).map(() => cell('')), cell(total, 'Number', 'Currency'), cell(''), cell('')]),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
    <?mso-application progid="Excel.Sheet"?>
    <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
      xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
      <Styles>
        <Style ss:ID="Title"><Font ss:Bold="1" ss:Size="16"/></Style>
        <Style ss:ID="Header"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#5F5F63" ss:Pattern="Solid"/></Style>
        <Style ss:ID="Currency"><NumberFormat ss:Format="&quot;R$&quot; #,##0.00"/></Style>
      </Styles>
      <Worksheet ss:Name="Relatorio">
        <Table>${reportRows.join('')}</Table>
      </Worksheet>
    </Workbook>`;
};

const wrapPdfText = (text, font, fontSize, maxWidth) => {
  const words = safePdfText(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let currentLine = '';

  words.forEach((word) => {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (currentLine && font.widthOfTextAtSize(candidate, fontSize) > maxWidth) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = candidate;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines.length ? lines : [''];
};

export default function RelatoryButtons({
  transactions = [],
  selectedAccount,
}) {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef(null);
  const total = transactions.reduce(
    (sum, transaction) => sum + parseCurrency(transaction.valor),
    0,
  );

  useEffect(() => {
    if (!isExportMenuOpen) return undefined;

    const handleOutsideClick = (event) => {
      if (!exportMenuRef.current?.contains(event.target)) {
        setIsExportMenuOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsExportMenuOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isExportMenuOpen]);

  const createCsv = () => [
    columns.map(({ label }) => toCsvCell(label)).join(';'),
    ...transactions.map((transaction) =>
      columns
        .map(({ key }) => toCsvCell(getCellValue(transaction, key, selectedAccount)))
        .join(';'),
    ),
  ].join('\r\n');

  const downloadCsv = () => {
    const fileName = `${getFileBaseName(selectedAccount?.name || 'conta')}.xls`;
    downloadFile(`\uFEFF${createCsv()}`, 'text/csv;charset=utf-8', fileName);
    return fileName;
  };

  const exportExcel = () => {
    try {
      const xml = `\uFEFF${createExcelXml(transactions, selectedAccount, total)}`;
      downloadFile(
        xml,
        'application/vnd.ms-excel;charset=utf-8',
        `${getFileBaseName(selectedAccount?.name || 'conta')}.xls`,
      );
      setIsExportMenuOpen(false);
    } catch (error) {
      console.error('Erro ao exportar relatório para Excel:', error);
      window.alert('Não foi possível exportar o relatório para Excel.');
    }
  };

  const exportPdf = async () => {
    try {
      const { PDFDocument, PageSizes, rgb, StandardFonts } = await import('pdf-lib');
      const pdf = await PDFDocument.create();
      pdf.setTitle('Relatório financeiro');
      pdf.setAuthor('Sistema financeiro');
      const regularFont = await pdf.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
      const [portraitWidth, portraitHeight] = PageSizes.A4;
      const pageSize = [portraitHeight, portraitWidth];
      const pageWidth = pageSize[0];
      const margin = 32;
      const tableWidth = pageWidth - margin * 2;
      const columnWeights = [0.09, 0.09, 0.15, 0.21, 0.14, 0.11, 0.11, 0.10];
      const columnWidths = columnWeights.map((weight) => tableWidth * weight);
      const rowFontSize = 8;
      let page;
      let y;

      const drawTableHeader = () => {
        const headerHeight = 25;
        page.drawRectangle({
          x: margin,
          y: y - headerHeight,
          width: tableWidth,
          height: headerHeight,
          color: rgb(0.37, 0.37, 0.39),
        });

        let x = margin;
        columns.forEach(({ label }, index) => {
          page.drawText(safePdfText(label), {
            x: x + 4,
            y: y - 16,
            size: rowFontSize,
            font: boldFont,
            color: rgb(1, 1, 1),
            maxWidth: columnWidths[index] - 8,
          });
          x += columnWidths[index];
        });
        y -= headerHeight;
      };

      const addPage = (firstPage = false) => {
        page = pdf.addPage(pageSize);
        y = page.getHeight() - margin;
        if (firstPage) {
          page.drawText('Relatório financeiro', {
            x: margin,
            y,
            size: 18,
            font: boldFont,
            color: rgb(0.12, 0.16, 0.22),
          });
          y -= 26;
          [
            `Conta: ${selectedAccount?.name || 'Não selecionada'}`,
            `Lançamentos: ${transactions.length}`,
            `Total: ${formatCurrency(total)}`,
            `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
          ].forEach((line) => {
            page.drawText(safePdfText(line), {
              x: margin,
              y,
              size: 9,
              font: regularFont,
              color: rgb(0.29, 0.33, 0.39),
            });
            y -= 13;
          });
          y -= 10;
        } else {
          page.drawText('Relatório financeiro (continuação)', {
            x: margin,
            y,
            size: 11,
            font: boldFont,
            color: rgb(0.12, 0.16, 0.22),
          });
          y -= 20;
        }
        drawTableHeader();
      };

      addPage(true);
      transactions.forEach((transaction, rowIndex) => {
        const values = columns.map(({ key }) =>
          getCellValue(transaction, key, selectedAccount),
        );
        const lines = values.map((value, index) =>
          wrapPdfText(value, regularFont, rowFontSize, columnWidths[index] - 8),
        );
        const rowHeight = Math.max(22, ...lines.map((cellLines) => cellLines.length * 10 + 8));

        if (y - rowHeight < margin) addPage();

        page.drawRectangle({
          x: margin,
          y: y - rowHeight,
          width: tableWidth,
          height: rowHeight,
          color: rowIndex % 2 === 0 ? rgb(0.96, 0.97, 0.98) : rgb(1, 1, 1),
          borderColor: rgb(0.85, 0.87, 0.89),
          borderWidth: 0.4,
        });

        let x = margin;
        lines.forEach((cellLines, columnIndex) => {
          cellLines.forEach((line, lineIndex) => {
            page.drawText(line, {
              x: x + 4,
              y: y - 13 - lineIndex * 10,
              size: rowFontSize,
              font: regularFont,
              color: rgb(0.12, 0.16, 0.22),
              maxWidth: columnWidths[columnIndex] - 8,
            });
          });
          x += columnWidths[columnIndex];
        });
        y -= rowHeight;
      });

      if (y - 24 < margin) addPage();
      page.drawText(`Total geral: ${formatCurrency(total)}`, {
        x: margin,
        y: y - 16,
        size: 10,
        font: boldFont,
        color: rgb(0.12, 0.16, 0.22),
      });

      const bytes = await pdf.save();
      downloadFile(
        bytes,
        'application/pdf',
        `${getFileBaseName(selectedAccount?.name || 'conta')}.pdf`,
      );
      setIsExportMenuOpen(false);
    } catch (error) {
      console.error('Erro ao exportar relatório para PDF:', error);
      window.alert('Não foi possível exportar o relatório para PDF.');
    }
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
    // 1. Faz o download do CSV como antes
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
    ].join('\n');

    // 2. Copia o corpo do e-mail para a área de transferência automaticamente
    navigator.clipboard.writeText(body).then(() => {
      alert(`Relatório gerado!\n\nO texto do e-mail foi copiado para a sua área de transferência. Cole-o na mensagem para a contabilidade.`);
    }).catch(err => {
      console.error('Erro ao copiar texto: ', err);
    });

    // 3. Abre o Outlook Web (ou o provedor de e-mail da empresa) em uma nova aba
    window.open('https://outlook.office.com/mail/', '_blank');
  };

  return (
    <div className="flex justify-end gap-3 text-xs pt-2">
      <div className="relative" ref={exportMenuRef}>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={isExportMenuOpen}
          onClick={() => setIsExportMenuOpen((isOpen) => !isOpen)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-4 py-2 rounded-md flex items-center gap-2"
        >
          <Download className="w-3.5 h-3.5" /> Exportar Relatório
        </button>
        {isExportMenuOpen && (
          <div
            role="menu"
            aria-label="Formato de exportação"
            className="absolute right-0 z-20 mt-2 min-w-40 overflow-hidden rounded-md border border-gray-200 bg-white py-1 text-gray-700 shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              onClick={exportPdf}
              className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-gray-100"
            >
              <FileText className="h-4 w-4 text-red-600" /> PDF
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={exportExcel}
              className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-gray-100"
            >
              <FileSpreadsheet className="h-4 w-4 text-green-700" /> Excel
            </button>
          </div>
        )}
      </div>
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