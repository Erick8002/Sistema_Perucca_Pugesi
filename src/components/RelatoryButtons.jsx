import React, { useEffect, useRef, useState } from 'react';
import { Download, FileSpreadsheet, FileText, Printer, Send } from 'lucide-react';

const columns = [
  { key: 'conta', label: 'Conta', align: 'left' },
  { key: 'vencimento', label: 'Vencimento', align: 'center' },
  { key: 'paid_at', label: 'Pagamento', align: 'center' },
  { key: 'fornecedor', label: 'Fornecedor', align: 'left' },
  { key: 'descricao', label: 'Descrição', align: 'left' },
  { key: 'categoria', label: 'Categoria', align: 'left' },
  { key: 'parcela', label: 'Parcela', align: 'center' },
  { key: 'status', label: 'Situação', align: 'center' },
  { key: 'valor', label: 'Valor', align: 'right' },
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
  const clean = String(value).slice(0, 10);
  const [year, month, day] = clean.split('-');
  return year && month && day ? `${day}/${month}/${year}` : value;
};

const getCellValue = (transaction, key, selectedAccount) => {
  if (key === 'conta') return selectedAccount?.name || '—';
  if (key === 'valor') return formatCurrency(parseCurrency(transaction.valor));
  if (key === 'vencimento') return formatDate(transaction.vencimento) || '—';
  if (key === 'paid_at') {
    return transaction.status === 'Pago' && transaction.paid_at
      ? formatDate(transaction.paid_at)
      : '—';
  }
  if (key === 'parcela') {
    return transaction.total_installment > 1
      ? `${transaction.current_installment || 1}/${transaction.total_installment}`
      : '1/1';
  }

  return transaction[key] ?? '—';
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

const createExcelXml = (transactions, selectedAccount, totals) => {
  const cell = (value, type = 'String', style = '') =>
    `<Cell${style ? ` ss:StyleID="${style}"` : ''}><Data ss:Type="${type}">${escapeXml(value)}</Data></Cell>`;
  const row = (cells) => `<Row>${cells.join('')}</Row>`;

  const reportRows = [
    row([cell('Relatório Financeiro de Lançamentos', 'String', 'Title')]),
    row([cell('Conta'), cell(selectedAccount?.name || 'Não selecionada')]),
    row([cell('Emissão'), cell(new Date().toLocaleString('pt-BR'))]),
    row([cell('Lançamentos'), cell(transactions.length, 'Number')]),
    row([cell('Total Pago'), cell(totals.pago, 'Number', 'Currency')]),
    row([cell('Total Pendente'), cell(totals.pendente, 'Number', 'Currency')]),
    row([cell('Total Geral'), cell(totals.geral, 'Number', 'Currency')]),
    row([]),
    row(columns.map(({ label }) => cell(label, 'String', 'Header'))),
    ...transactions.map((transaction) =>
      row(
        columns.map(({ key }) => {
          if (key === 'valor') {
            return cell(parseCurrency(transaction.valor), 'Number', 'Currency');
          }
          return cell(getCellValue(transaction, key, selectedAccount));
        }),
      ),
    ),
    row([
      cell('TOTAL GERAL'),
      ...columns.slice(1, columns.length - 1).map(() => cell('')),
      cell(totals.geral, 'Number', 'Currency'),
    ]),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
    <?mso-application progid="Excel.Sheet"?>
    <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
      xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
      <Styles>
        <Style ss:ID="Title"><Font ss:Bold="1" ss:Size="15" ss:Color="#0F172A"/></Style>
        <Style ss:ID="Header"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#1E293B" ss:Pattern="Solid"/></Style>
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

  const totalGeral = transactions.reduce(
    (sum, transaction) => sum + parseCurrency(transaction.valor),
    0,
  );
  const totalPago = transactions
    .filter((transaction) => transaction.status === 'Pago')
    .reduce((sum, transaction) => sum + parseCurrency(transaction.valor), 0);
  const totalPendente = totalGeral - totalPago;

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
    const fileName = `${getFileBaseName(selectedAccount?.name || 'conta')}.csv`;
    downloadFile(`\uFEFF${createCsv()}`, 'text/csv;charset=utf-8', fileName);
    return fileName;
  };

  const exportExcel = () => {
    try {
      const xml = `\uFEFF${createExcelXml(transactions, selectedAccount, {
        geral: totalGeral,
        pago: totalPago,
        pendente: totalPendente,
      })}`;
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
      pdf.setTitle('Relatório Financeiro');
      pdf.setAuthor('Sistema Financeiro');

      const regularFont = await pdf.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

      const [portraitWidth, portraitHeight] = PageSizes.A4;
      const pageSize = [portraitHeight, portraitWidth]; // A4 Paisagem
      const pageWidth = pageSize[0];
      const margin = 32;
      const bottomLimit = 44;
      const tableWidth = pageWidth - margin * 2;

      // Pesos proporcionais às 9 colunas (soma = 1.00)
      const columnWeights = [0.10, 0.08, 0.08, 0.16, 0.20, 0.13, 0.06, 0.09, 0.10];
      const columnWidths = columnWeights.map((weight) => tableWidth * weight);
      const rowFontSize = 8;

      // Paleta corporativa
      const colors = {
        slate900: rgb(0.06, 0.09, 0.16),
        slate800: rgb(0.12, 0.16, 0.23),
        slate600: rgb(0.28, 0.33, 0.41),
        slate500: rgb(0.39, 0.45, 0.55),
        slate200: rgb(0.89, 0.91, 0.94),
        slate100: rgb(0.95, 0.96, 0.98),
        slate50: rgb(0.97, 0.98, 0.99),
        white: rgb(1, 1, 1),
        greenText: rgb(0.09, 0.40, 0.20),
        greenBg: rgb(0.86, 0.99, 0.91),
        amberText: rgb(0.57, 0.25, 0.05),
        amberBg: rgb(0.99, 0.95, 0.78),
      };

      let page;
      let y;

      const drawAlignedText = (text, { x, yPos, width, align = 'left', font = regularFont, size = rowFontSize, color = colors.slate800 }) => {
        const safe = safePdfText(text);
        const textWidth = font.widthOfTextAtSize(safe, size);
        let drawX = x + 5;
        if (align === 'right') {
          drawX = x + width - textWidth - 5;
        } else if (align === 'center') {
          drawX = x + (width - textWidth) / 2;
        }
        page.drawText(safe, {
          x: Math.max(x + 3, drawX),
          y: yPos,
          size,
          font,
          color,
        });
      };

      const drawTableHeader = () => {
        const headerHeight = 24;
        page.drawRectangle({
          x: margin,
          y: y - headerHeight,
          width: tableWidth,
          height: headerHeight,
          color: colors.slate800,
        });

        let x = margin;
        columns.forEach(({ label, align }, index) => {
          drawAlignedText(label.toUpperCase(), {
            x,
            yPos: y - 15,
            width: columnWidths[index],
            align,
            font: boldFont,
            size: 7.2,
            color: colors.white,
          });
          x += columnWidths[index];
        });
        y -= headerHeight;
      };

      const addPage = (firstPage = false) => {
        page = pdf.addPage(pageSize);
        y = page.getHeight() - margin;

        if (firstPage) {
          // Cabeçalho Institucional
          page.drawText(safePdfText('Relatório Financeiro de Lançamentos'), {
            x: margin,
            y: y - 4,
            size: 17,
            font: boldFont,
            color: colors.slate900,
          });

          const accountTitle = safePdfText(selectedAccount?.name || 'Todas as Contas');
          page.drawText(accountTitle, {
            x: margin,
            y: y - 20,
            size: 10.5,
            font: boldFont,
            color: colors.slate600,
          });

          const generatedText = safePdfText(`Emissão: ${new Date().toLocaleString('pt-BR')}`);
          const genWidth = regularFont.widthOfTextAtSize(generatedText, 8.5);
          page.drawText(generatedText, {
            x: pageWidth - margin - genWidth,
            y: y - 6,
            size: 8.5,
            font: regularFont,
            color: colors.slate500,
          });

          // Linha divisória superior
          y -= 30;
          page.drawLine({
            start: { x: margin, y },
            end: { x: pageWidth - margin, y },
            thickness: 1.5,
            color: colors.slate900,
          });

          // 4 Cards de Resumo (KPIs)
          y -= 12;
          const cardGap = 10;
          const cardWidth = (tableWidth - cardGap * 3) / 4;
          const cardHeight = 42;
          const kpis = [
            { label: 'LANÇAMENTOS', value: String(transactions.length), color: colors.slate900, bg: colors.slate50 },
            { label: 'TOTAL PAGO', value: formatCurrency(totalPago), color: colors.greenText, bg: colors.slate50 },
            { label: 'TOTAL PENDENTE', value: formatCurrency(totalPendente), color: colors.amberText, bg: colors.slate50 },
            { label: 'TOTAL GERAL', value: formatCurrency(totalGeral), color: colors.slate900, bg: colors.slate100 },
          ];

          kpis.forEach((kpi, idx) => {
            const cardX = margin + idx * (cardWidth + cardGap);
            page.drawRectangle({
              x: cardX,
              y: y - cardHeight,
              width: cardWidth,
              height: cardHeight,
              color: kpi.bg,
              borderColor: colors.slate200,
              borderWidth: 0.8,
            });
            page.drawText(safePdfText(kpi.label), {
              x: cardX + 10,
              y: y - 14,
              size: 7,
              font: boldFont,
              color: colors.slate500,
            });
            page.drawText(safePdfText(kpi.value), {
              x: cardX + 10,
              y: y - 31,
              size: 11.5,
              font: boldFont,
              color: kpi.color,
            });
          });

          y -= cardHeight + 14;
        } else {
          page.drawText(
            safePdfText(`Relatório Financeiro — ${selectedAccount?.name || ''} (continuação)`),
            {
              x: margin,
              y: y - 4,
              size: 10,
              font: boldFont,
              color: colors.slate600,
            },
          );
          y -= 18;
        }

        drawTableHeader();
      };

      addPage(true);

      transactions.forEach((transaction, rowIndex) => {
        const values = columns.map(({ key }) =>
          getCellValue(transaction, key, selectedAccount),
        );
        const lines = values.map((value, index) =>
          wrapPdfText(value, regularFont, rowFontSize, columnWidths[index] - 10),
        );
        const rowHeight = Math.max(22, ...lines.map((cellLines) => cellLines.length * 10 + 9));

        if (y - rowHeight < bottomLimit) addPage(false);

        page.drawRectangle({
          x: margin,
          y: y - rowHeight,
          width: tableWidth,
          height: rowHeight,
          color: rowIndex % 2 === 1 ? colors.slate50 : colors.white,
          borderColor: colors.slate200,
          borderWidth: 0.4,
        });

        let x = margin;
        lines.forEach((cellLines, columnIndex) => {
          const col = columns[columnIndex];
          const colWidth = columnWidths[columnIndex];

          if (col.key === 'status') {
            const isPaid = transaction.status === 'Pago';
            const badgeText = safePdfText(transaction.status || 'Pendente');
            const badgeW = boldFont.widthOfTextAtSize(badgeText, 7.2) + 12;
            const badgeH = 14;
            const badgeX = x + (colWidth - badgeW) / 2;
            const badgeY = y - rowHeight / 2 - badgeH / 2;

            page.drawRectangle({
              x: badgeX,
              y: badgeY,
              width: badgeW,
              height: badgeH,
              color: isPaid ? colors.greenBg : colors.amberBg,
            });

            drawAlignedText(badgeText, {
              x,
              yPos: badgeY + 4.2,
              width: colWidth,
              align: 'center',
              font: boldFont,
              size: 7.2,
              color: isPaid ? colors.greenText : colors.amberText,
            });
          } else {
            const isBoldCol = col.key === 'valor' || col.key === 'fornecedor';
            cellLines.forEach((line, lineIndex) => {
              drawAlignedText(line, {
                x,
                yPos: y - 13 - lineIndex * 10,
                width: colWidth,
                align: col.align,
                font: isBoldCol ? boldFont : regularFont,
                size: rowFontSize,
                color: isBoldCol ? colors.slate900 : colors.slate800,
              });
            });
          }

          x += colWidth;
        });

        y -= rowHeight;
      });

      // Linha de Total Geral integrada ao final da tabela
      const footerRowHeight = 25;
      if (y - footerRowHeight < bottomLimit) addPage(false);

      page.drawRectangle({
        x: margin,
        y: y - footerRowHeight,
        width: tableWidth,
        height: footerRowHeight,
        color: colors.slate100,
        borderColor: colors.slate800,
        borderWidth: 0.8,
      });

      const lastColWidth = columnWidths[columnWidths.length - 1];
      drawAlignedText(
        `TOTAL GERAL (${transactions.length} ${transactions.length === 1 ? 'lançamento' : 'lançamentos'}):`,
        {
          x: margin,
          yPos: y - 16,
          width: tableWidth - lastColWidth - 6,
          align: 'right',
          font: boldFont,
          size: 8.5,
          color: colors.slate900,
        },
      );
      drawAlignedText(formatCurrency(totalGeral), {
        x: margin + tableWidth - lastColWidth,
        yPos: y - 16,
        width: lastColWidth,
        align: 'right',
        font: boldFont,
        size: 9,
        color: colors.slate900,
      });

      // Numeração de páginas no rodapé de todas as folhas
      const pages = pdf.getPages();
      pages.forEach((p, idx) => {
        p.drawLine({
          start: { x: margin, y: 28 },
          end: { x: pageWidth - margin, y: 28 },
          thickness: 0.5,
          color: colors.slate200,
        });
        p.drawText(safePdfText('Sistema de Gestão Financeira • Valores em Reais (BRL)'), {
          x: margin,
          y: 17,
          size: 7.5,
          font: regularFont,
          color: colors.slate500,
        });
        const pageLabel = safePdfText(`Página ${idx + 1} de ${pages.length}`);
        const labelW = regularFont.widthOfTextAtSize(pageLabel, 7.5);
        p.drawText(pageLabel, {
          x: pageWidth - margin - labelW,
          y: 17,
          size: 7.5,
          font: regularFont,
          color: colors.slate500,
        });
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
    const rows = transactions
      .map((transaction) => {
        const isPaid = transaction.status === 'Pago';
        return `
          <tr>
            ${columns
              .map(({ key, align }) => {
                const rawVal = getCellValue(transaction, key, selectedAccount);
                if (key === 'status') {
                  return `<td class="text-center"><span class="badge ${isPaid ? 'badge-paid' : 'badge-pending'}">${escapeHtml(rawVal)}</span></td>`;
                }
                const boldClass = key === 'valor' || key === 'fornecedor' ? 'font-bold' : '';
                return `<td class="text-${align} ${boldClass}">${escapeHtml(rawVal)}</td>`;
              })
              .join('')}
          </tr>
        `;
      })
      .join('');

    const generatedAt = new Date().toLocaleString('pt-BR');
    const accountName = selectedAccount?.name || 'Todas as Contas';

    printWindow.document.write(`<!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8">
          <title>Relatório Financeiro - ${escapeHtml(accountName)}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              color: #1e293b;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              font-size: 11px;
              padding: 28px;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #0f172a;
              padding-bottom: 12px;
              margin-bottom: 16px;
            }
            .header h1 { font-size: 18px; color: #0f172a; }
            .header .subtitle { font-size: 12px; font-weight: 600; color: #475569; margin-top: 2px; }
            .header .meta { font-size: 10px; color: #64748b; text-align: right; }
            .kpis {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 10px;
              margin-bottom: 18px;
            }
            .kpi {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              padding: 8px 12px;
            }
            .kpi.total { background: #f1f5f9; border-color: #cbd5e1; }
            .kpi-label { font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: 700; }
            .kpi-val { font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 3px; }
            .kpi-val.paid { color: #15803d; }
            .kpi-val.pending { color: #b45309; }
            table { border-collapse: collapse; width: 100%; }
            th {
              background: #1e293b;
              color: #ffffff;
              font-size: 9px;
              text-transform: uppercase;
              padding: 8px 6px;
            }
            td { border-bottom: 1px solid #e2e8f0; padding: 7px 6px; }
            tbody tr:nth-child(even) { background: #f8fafc; }
            tfoot td {
              background: #f1f5f9;
              border-top: 2px solid #1e293b;
              border-bottom: 2px solid #1e293b;
              font-weight: 700;
              padding: 9px 6px;
            }
            .text-left { text-align: left; }
            .text-center { text-align: center; }
            .text-right { text-align: right; white-space: nowrap; }
            .font-bold { font-weight: 600; color: #0f172a; }
            .badge {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 999px;
              font-size: 9px;
              font-weight: 700;
            }
            .badge-paid { background: #dcfce7; color: #166534; }
            .badge-pending { background: #fef3c7; color: #92400e; }
            @media print {
              body { padding: 0; }
              @page { size: A4 landscape; margin: 10mm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>Relatório Financeiro de Lançamentos</h1>
              <div class="subtitle">${escapeHtml(accountName)}</div>
            </div>
            <div class="meta">Emissão: ${escapeHtml(generatedAt)}</div>
          </div>

          <div class="kpis">
            <div class="kpi"><div class="kpi-label">Lançamentos</div><div class="kpi-val">${transactions.length}</div></div>
            <div class="kpi"><div class="kpi-label">Total Pago</div><div class="kpi-val paid">${escapeHtml(formatCurrency(totalPago))}</div></div>
            <div class="kpi"><div class="kpi-label">Total Pendente</div><div class="kpi-val pending">${escapeHtml(formatCurrency(totalPendente))}</div></div>
            <div class="kpi total"><div class="kpi-label">Total Geral</div><div class="kpi-val">${escapeHtml(formatCurrency(totalGeral))}</div></div>
          </div>

          <table>
            <thead>
              <tr>${columns.map(({ label, align }) => `<th class="text-${align}">${escapeHtml(label)}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows || `<tr><td colspan="${columns.length}" class="text-center">Nenhum lançamento encontrado.</td></tr>`}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="${columns.length - 1}" class="text-right">TOTAL GERAL (${transactions.length} itens):</td>
                <td class="text-right">${escapeHtml(formatCurrency(totalGeral))}</td>
              </tr>
            </tfoot>
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

    const body = [
      'Olá,',
      '',
      'Segue o resumo do relatório financeiro:',
      `Conta: ${accountName}`,
      `Lançamentos: ${transactions.length}`,
      `Total Pago: ${formatCurrency(totalPago)}`,
      `Total Pendente: ${formatCurrency(totalPendente)}`,
      `Total Geral: ${formatCurrency(totalGeral)}`,
      '',
      `Por favor, anexe o arquivo CSV baixado (${fileName}) a este e-mail.`,
    ].join('\n');

    navigator.clipboard
      .writeText(body)
      .then(() => {
        alert(
          'Relatório gerado!\n\nO texto do e-mail foi copiado para a sua área de transferência. Cole-o na mensagem para a contabilidade.',
        );
      })
      .catch((err) => {
        console.error('Erro ao copiar texto: ', err);
      });

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