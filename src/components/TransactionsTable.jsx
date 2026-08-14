import React, { useState } from 'react';
import CustomSelect from './CustomSelect';
import { Search, MoreHorizontal, FileText, Printer, Plus, Edit3 } from 'lucide-react';

const categoryOptions = ['Todas as Categorias', 'Fertilizantes', 'Defensivos', 'Sementes'];
const monthOptions = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

export default function TransactionsTable() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [categoryTableHeader, setCategoryTableHeader] = useState('Todas as Categorias');
  const [monthTableFilter, setMonthTableFilter] = useState('Agosto');

  const transactions = [
    { id: 1, vencimento: '08/08/2026', fornecedor: 'Agrofértil Insumos', categoria: 'Fertilizantes', valor: 'R$ 4.500,00', status: 'Pago' },
    { id: 2, vencimento: '10/08/2026', fornecedor: 'MaqCampo Peças e Manutenção', categoria: 'Defensivos', valor: 'R$ 1.580,00', status: 'Pendente' },
    { id: 3, vencimento: '19/08/2026', fornecedor: 'Sementes AgroTech', categoria: 'Sementes', valor: 'R$ 2.300,00', status: 'Pendente'}
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <h2 className="text-base font-bold text-gray-800 ">Todos os Gastos do Mês</h2>

        <div className="flex items-center gap-2 flex-1 max-w-3xl">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Pesquisar por fornecedor ou fatura..."
              className="w-full bg-gray-50 border border-gray-200 rounded-md pl-3 pr-8 py-1.5 text-xs focus:outline-none focus:border-purple-500"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2" />
          </div>

          <div className="p-2">
            <CustomSelect
              options = {categoryOptions}
              selected = {categoryTableHeader}
              onSelect = {setCategoryTableHeader}
            />
          </div>

          <button className="bg-[#4A2E56] hover:bg-[#382242] text-white font-medium px-3 py-1.5 rounded-md flex items-center gap-1 shrink-0">
            <Plus className="w-3.5 h-3.5" /> Novo Gasto
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-500">
        <div className="p-2">
          <CustomSelect
            options = {monthOptions}
            selected = {monthTableFilter}
            onSelect = {setMonthTableFilter}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-white border border-gray-200 rounded px-2 py-1 text-gray-400">Data Inicial 🗓️</span>
          <span className="bg-white border border-gray-200 rounded px-2 py-1 text-gray-400">Data Final 🗓️</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-100 text-gray-400 font-medium">
              <th className="pb-3 font-medium">Vencimento</th>
              <th className="pb-3 font-medium">Fornecedor</th>
              <th className="pb-3 font-medium">Categoria</th>
              <th className="pb-3 font-medium">Valor</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium text-right pr-4">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-gray-700">
            {transactions.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50">
                <td className="py-3">{item.vencimento}</td>
                <td className="py-3 font-medium text-gray-900">{item.fornecedor}</td>
                <td className="py-3 text-gray-500">{item.categoria}</td>
                <td className="py-3 font-semibold">{item.valor}</td>
                <td className="py-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${
                    item.status === 'Pago' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-3 text-right relative pr-2">
                  <button 
                    onClick={() => setOpenDropdown(openDropdown === item.id ? null : item.id)}
                    className="p-1 hover:bg-gray-200 rounded text-gray-500"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {openDropdown === item.id && (
                    <div className="absolute right-0 top-10 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 text-left text-xs">
                      <button className="w-full px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700">
                        <FileText className="w-3.5 h-3.5" /> Ver / Baixar Boleto
                      </button>
                      <button className="w-full px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700">
                        <Printer className="w-3.5 h-3.5" /> Imprimir Comprovante
                      </button>
                      <button className="w-full px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700">
                        <Edit3 className="w-3.5 h-3.5" /> Editar Lançamento
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center text-[11px] text-gray-400 pt-2 border-t border-gray-50">
        <span>Mostrando 1-10 de 23 lançamentos</span>
        <div className="flex items-center gap-1">
          <span>‹</span> <span className="font-bold text-gray-700">1</span> <span>2</span> <span>3</span> <span>›</span>
        </div>
        <div>Itens por página: <select className="bg-transparent border rounded text-[11px]"><option>10</option></select></div>
      </div>
    </div>
  );
}