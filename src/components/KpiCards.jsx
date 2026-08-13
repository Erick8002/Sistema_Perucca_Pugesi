import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export default function KpiCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-5 rounded-xl border-2 border-purple-900/30 shadow-sm relative">
        <span className="text-xs text-gray-500 font-medium">Total de Gastos (Mês)</span>
        <div className="text-2xl font-bold text-gray-900 mt-1">R$ 45.200,00</div>
        <span className="text-xs text-gray-400 mt-2 block">23 faturas no total</span>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 font-medium">Contas Pagas</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-2xl font-bold text-gray-900 mt-1">R$ 41.400,00</div>
        <span className="text-xs text-emerald-600 font-medium mt-2 block">18 faturas pagas</span>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 font-medium">Contas Pendentes</span>
          <AlertTriangle className="w-4 h-4 text-amber-600" />
        </div>
        <div className="text-2xl font-bold text-gray-900 mt-1">R$ 3.800,00</div>
        <span className="text-xs text-amber-600 font-medium mt-2 block">5 Faturas a pagar</span>
      </div>
    </div>
  );
}