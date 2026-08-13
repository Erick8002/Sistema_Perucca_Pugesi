import React, { useState } from 'react';
import {
  Search,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';

export default function TransactionsTable({ transactions }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [openMenu, setOpenMenu] = useState(null);

  // Filter transactions
  const filtered = transactions.filter((t) => {
    const matchSearch =
      t.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'Todos' || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Status badge styles
  const getStatusBadge = (status) => {
    const baseClasses = 'badge';
    if (status === 'Pago') return `${baseClasses} badge-paid`;
    if (status === 'Pendente') return `${baseClasses} badge-pending`;
    return `${baseClasses} badge-overdue`;
  };

  return (
    <div className="card">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-neutral-900">Transações</h2>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-2">
          {/* Search Input */}
          <div className="flex items-center gap-2 bg-neutral-100 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Pesquisar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-sm placeholder-neutral-400 focus:outline-none w-full"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-neutral-100 rounded-lg px-3 py-2">
            <Calendar className="w-4 h-4 text-neutral-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-sm focus:outline-none cursor-pointer"
            >
              <option>Todos</option>
              <option>Pago</option>
              <option>Pendente</option>
            </select>
          </div>

          {/* Add Transaction Button */}
          <button className="btn-primary">
            + Novo Gasto
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="px-4 py-3 text-left font-semibold text-neutral-600">
                Empresa
              </th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-600">
                Descrição
              </th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-600">
                Data
              </th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-600">
                Vencimento
              </th>
              <th className="px-4 py-3 text-right font-semibold text-neutral-600">
                Valor
              </th>
              <th className="px-4 py-3 text-center font-semibold text-neutral-600">
                Status
              </th>
              <th className="px-4 py-3 text-center font-semibold text-neutral-600">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((transaction) => (
              <tr
                key={transaction.id}
                className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
              >
                <td className="px-4 py-3 font-semibold text-neutral-900">
                  {transaction.company}
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {transaction.description}
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {transaction.date}
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {transaction.dueDate}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-neutral-900">
                  {transaction.amount}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={getStatusBadge(transaction.status)}>
                    {transaction.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center relative">
                  <button
                    onClick={() =>
                      setOpenMenu(
                        openMenu === transaction.id ? null : transaction.id
                      )
                    }
                    className="p-2 hover:bg-neutral-200 rounded-lg transition-all inline-block"
                  >
                    <MoreVertical className="w-4 h-4 text-neutral-500" />
                  </button>

                  {/* Dropdown Menu */}
                  {openMenu === transaction.id && (
                    <div className="absolute right-0 top-8 w-40 bg-white rounded-lg shadow-lg border border-neutral-100 z-10">
                      <button className="w-full text-left px-4 py-2 hover:bg-neutral-50 flex items-center gap-2 text-sm text-neutral-700">
                        <Eye className="w-4 h-4" />
                        Ver Detalhes
                      </button>
                      <button className="w-full text-left px-4 py-2 hover:bg-neutral-50 flex items-center gap-2 text-sm text-neutral-700">
                        <Edit className="w-4 h-4" />
                        Editar
                      </button>
                      <button className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-sm text-red-600 border-t border-neutral-100">
                        <Trash2 className="w-4 h-4" />
                        Deletar
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Info */}
      <div className="mt-4 flex items-center justify-between text-sm text-neutral-500">
        <p>Mostrando {filtered.length} de 23 transações</p>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded hover:bg-neutral-100">
            ← Anterior
          </button>
          <button className="px-3 py-1 bg-primary-600 text-white rounded">
            1
          </button>
          <button className="px-3 py-1 rounded hover:bg-neutral-100">
            2
          </button>
          <button className="px-3 py-1 rounded hover:bg-neutral-100">
            Próxima →
          </button>
        </div>
      </div>
    </div>
  );
}
