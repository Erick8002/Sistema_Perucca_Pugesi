import React, { useState } from 'react';
import { ChevronDown, Bell, Search } from 'lucide-react';
import { mockData } from '../mockData';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('Conta Principal');

  const accounts = [
    'Conta Principal',
    'Conta Secundária',
    'Reserva de Emergência',
  ];

  const today = new Date();
  const dayOfWeek = today.toLocaleString('pt-BR', { weekday: 'long' });
  const formattedDate = today.toLocaleString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="bg-white border-b border-neutral-100 shadow-sm">
      <div className="flex items-center justify-between px-8 py-6">
        {/* Left: Greeting */}
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">
            Olá, {mockData.user.name}! 👋
          </h2>
          <p className="text-sm text-neutral-500 capitalize">
            {dayOfWeek}, {formattedDate}
          </p>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-6">
          {/* Search Bar */}
          <div className="hidden md:flex items-center gap-2 bg-neutral-100 rounded-lg px-4 py-2 min-w-xs">
            <Search className="w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Pesquisar transação..."
              className="bg-transparent text-sm placeholder-neutral-400 focus:outline-none"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Account Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-neutral-100 transition-all"
            >
              <div className="text-right">
                <p className="text-sm font-semibold text-neutral-900">
                  {selectedAccount}
                </p>
                <p className="text-xs text-neutral-500">Agropecuária</p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-neutral-600 transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-100 z-10">
                {accounts.map((account) => (
                  <button
                    key={account}
                    onClick={() => {
                      setSelectedAccount(account);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 transition-all ${
                      selectedAccount === account
                        ? 'bg-primary-50 text-primary-600 font-semibold'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    {account}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Avatar */}
          <img
            src={mockData.user.avatar}
            alt={mockData.user.name}
            className="w-10 h-10 rounded-full border-2 border-primary-200 cursor-pointer hover:border-primary-400 transition-all"
          />
        </div>
      </div>
    </header>
  );
}
