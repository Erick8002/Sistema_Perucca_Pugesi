import React from 'react';
import {
  TrendingDown,
  CheckCircle,
  AlertCircle,
  ArrowUp,
} from 'lucide-react';

const iconMap = {
  TrendingDown,
  CheckCircle,
  AlertCircle,
};

export default function KpiCard({ title, value, icon, color, textColor }) {
  const IconComponent = iconMap[icon];

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        {/* Left: Title and Value */}
        <div>
          <p className="text-sm text-neutral-500 mb-2">{title}</p>
          <h3 className={`text-3xl font-bold ${textColor}`}>{value}</h3>
          <p className="text-xs text-neutral-400 mt-2 flex items-center gap-1">
            <ArrowUp className="w-3 h-3 text-green-500" />
            <span>+5.2% este mês</span>
          </p>
        </div>

        {/* Right: Icon */}
        {IconComponent && (
          <div
            className={`p-3 rounded-lg bg-gradient-to-br ${color} text-white`}
          >
            <IconComponent className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}
