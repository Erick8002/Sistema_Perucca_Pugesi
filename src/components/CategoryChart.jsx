import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

export default function CategoryChart({ data }) {
  const COLORS = ['#7c3aed', '#a8e6cf', '#b8e0f5', '#ffd9a8'];

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-neutral-900 mb-6">
        Gastos por Categoria
      </h2>

      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: R$ ${value.toLocaleString()}`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend with details */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: COLORS[index] }}
            ></div>
            <div>
              <p className="text-sm font-semibold text-neutral-900">
                {item.name}
              </p>
              <p className="text-xs text-neutral-500">
                R$ {item.value.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
