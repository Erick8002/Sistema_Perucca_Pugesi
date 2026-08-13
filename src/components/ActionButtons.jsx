import React from 'react';
import { Download, Printer, Send } from 'lucide-react';

export default function ActionButtons() {
  return (
    <div className="flex justify-center gap-3 text-xs pt-2">
      <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-4 py-2 rounded-md flex items-center gap-2">
        <Download className="w-3.5 h-3.5" /> Exportar Relatório
      </button>
      <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-4 py-2 rounded-md flex items-center gap-2">
        <Printer className="w-3.5 h-3.5" /> Imprimir Relatório
      </button>
      <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium px-4 py-2 rounded-md flex items-center gap-2">
        <Send className="w-3.5 h-3.5" /> Enviar para Contabilidade
      </button>
    </div>
  );
}