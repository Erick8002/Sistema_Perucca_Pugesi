import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function EvolutionChart({ data }) {
  return (
    <div className="card">
      <h2 className="text-xl font-bold text-neutral-900 mb-6">
        Evolução de Despesas
      </h2>

      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="expenses" fill="#7c3aed" radius={[8, 8, 0, 0]} />
            <Bar dataKey="paid" fill="#a8e6cf" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg">
          <p className="text-xs text-neutral-600 mb-1">Total Despesas</p>
          <p className="text-lg font-bold text-primary-600">R$ 55.050</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
          <p className="text-xs text-neutral-600 mb-1">Total Pago</p>
          <p className="text-lg font-bold text-green-600">R$ 53.400</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
          <p className="text-xs text-neutral-600 mb-1">Diferença</p>
          <p className="text-lg font-bold text-orange-600">R$ 1.650</p>
        </div>
      </div>
    </div>
  );
}
