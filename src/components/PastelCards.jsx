import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function PastelCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-[#FAF5EE] p-5 rounded-xl border border-amber-100/60 shadow-sm relative">
        <span className="text-xs text-gray-500">A Vencer na Semana</span>
        <div className="text-xl font-bold text-gray-800 mt-1">R$ 2.400,00</div>
        <p className="text-xs text-gray-400 mt-1">3 faturas nos próximos 7 dias</p>
        <ChevronDown className="w-4 h-4 text-amber-700 absolute bottom-3 left-1/2 -translate-x-1/2 cursor-pointer" />
      </div>

      <div className="bg-[#F3EFEF] p-5 rounded-xl border border-purple-100/60 shadow-sm relative">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Contas Acima de R$</span>
          <span className="bg-white/80 px-2 py-0.5 rounded text-[10px] border">3.000,00</span>
        </div>
        <div className="text-xl font-bold text-gray-800 mt-1">R$ 18.500,00</div>
        <p className="text-xs text-gray-400 mt-1">3 Faturas com valor acima de R$ 3.000,00</p>
        <ChevronDown className="w-4 h-4 text-purple-700 absolute bottom-3 left-1/2 -translate-x-1/2 cursor-pointer" />
      </div>

      <div className="bg-[#EBF3F5] p-5 rounded-xl border border-blue-100/60 shadow-sm relative">
        <span className="text-xs text-gray-500">Gastos com Funcionários</span>
        <div className="text-xl font-bold text-gray-800 mt-1">R$ 14.200,00</div>
        <p className="text-xs text-gray-400 mt-1">Salários, encargos, e benefícios</p>
        <ChevronDown className="w-4 h-4 text-blue-600 absolute bottom-3 left-1/2 -translate-x-1/2 cursor-pointer" />
      </div>

      <div className="bg-[#EBF5EF] p-5 rounded-xl border border-emerald-100/60 shadow-sm relative">
        <span className="text-xs text-gray-500">Despesas Fixas Mensais</span>
        <div className="text-xl font-bold text-gray-800 mt-1">R$ 8.900,00</div>
        <p className="text-xs text-gray-400 mt-1">Custos recorrentes do mês</p>
        <ChevronDown className="w-4 h-4 text-emerald-600 absolute bottom-3 left-1/2 -translate-x-1/2 cursor-pointer" />
      </div>
    </div>
  );
}