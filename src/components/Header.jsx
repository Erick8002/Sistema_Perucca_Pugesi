import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function Header() {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          Olá, Rosangela! 👋
        </h1>
        <p className="text-sm text-gray-500">
          Acompanhe e gerencie os lançamentos da sua empresa
        </p>
      </div>

      <div className="flex flex-col items-end text-xs">
        <span className="text-gray-400 mb-1">Conta Selecionada:</span>
        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-3 py-1.5 shadow-sm text-gray-700">
          <span className="w-4 h-4 bg-gray-200 border border-gray-400 rounded-sm flex items-center justify-center text-[10px]">🏢</span>
          <span>Rosangela (PF)</span>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </div>
      </div>
    </div>
  );
}