import React from 'react';
import { CheckCircle2, AlertTriangle, ChartNoAxesCombined } from 'lucide-react';

export default function KpiCards() {
  return (
    // Conteiner with all KPI cards
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      
      <div className="bg-white p-5 rounded-xl border-2 border-transparent hover:border-purple-900/40 shadow-sm relative transition-all duration-300 hover:scale-105 hover:z-10 hover: cursor-pointer">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 font-medium w-fit"><p className="cursor-text">Total de Gastos (Mês)</p></span>
          <ChartNoAxesCombined className="w-4 h-4 text-purple-600" />
          </div>
        <div className="text-2xl font-bold text-gray-900 mt-1 w-fit"><p className="cursor-text">R$ 45.200,00</p></div>
        <span className="text-xs text-gray-400 mt-2 block w-fit"><p className="cursor-text">23 faturas no total</p></span>
      </div>

      <div className="bg-white p-5 rounded-xl border-gray-100 border-2 border-transparent hover:border-emerald-600/40 shadow-sm cursor-pointer transition-all duration-300 hover:scale-105">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 font-medium w-fit"><p className="cursor-text">Contas Pagas</p></span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-2xl font-bold text-gray-900 mt-1 w-fit"><p className='cursor-text'>R$ 41.400,00</p></div>
        <span className="text-xs text-emerald-600 font-medium mt-2 block w-fit"><p className='cursor-text'>18 faturas pagas</p></span>
      </div>

      <div className="bg-white p-5 rounded-xl border-gray-100 border-2 border-transparent hover:border-amber-600/40 shadow-sm cursor-pointer transition-all duration-300 hover:scale-105">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 font-medium w-fit"><p className='cursor-text'>Contas Pendentes</p></span>
          <AlertTriangle className="w-4 h-4 text-amber-600" />
        </div>
        <div className="text-2xl font-bold text-gray-900 mt-1 w-fit"><p className='cursor-text'>R$ 3.800,00</p></div>
        <span className="text-xs text-amber-600 font-medium mt-2 block w-fit"><p className='cursor-text'>5 Faturas a pagar</p></span>
      </div>
    </div>
  );
}