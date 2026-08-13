import React from 'react';
import { BarChart3, Home, FileText, Settings, LogOut } from 'lucide-react';

export default function Sidebar() {
  const menuItems = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: FileText, label: 'Relatórios', active: false },
    { icon: BarChart3, label: 'Análises', active: false },
    { icon: Settings, label: 'Configurações', active: false },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-primary-700 to-primary-900 text-white h-screen flex flex-col shadow-lg">
      {/* Logo */}
      <div className="p-6 border-b border-primary-600">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold">FinDash</h1>
            <p className="text-xs text-primary-200">Gestão Financeira</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.label}
              href="#"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                item.active
                  ? 'bg-white/20 text-white font-semibold'
                  : 'text-primary-100 hover:bg-white/10'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-6 border-t border-primary-600">
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-primary-100 hover:bg-white/10 transition-all duration-200">
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
