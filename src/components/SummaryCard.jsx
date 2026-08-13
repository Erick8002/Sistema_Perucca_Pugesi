import React from 'react';
import {
  Calendar,
  Users,
  Package,
  ShoppingCart,
} from 'lucide-react';

const iconMap = {
  Calendar,
  Users,
  Package,
  ShoppingCart,
};

export default function SummaryCard({ title, value, subtitle, icon }) {
  const IconComponent = iconMap[icon];

  const iconColors = {
    Calendar: 'text-blue-500',
    Users: 'text-purple-500',
    Package: 'text-orange-500',
    ShoppingCart: 'text-green-500',
  };

  return (
    <div className="card-pastel">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-600 mb-2">{title}</p>
          <h3 className="text-2xl font-bold text-neutral-900">{value}</h3>
          <p className="text-xs text-neutral-500 mt-2">{subtitle}</p>
        </div>
        {IconComponent && (
          <div className={`p-3 rounded-lg bg-white/60 ${iconColors[icon]}`}>
            <IconComponent className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
