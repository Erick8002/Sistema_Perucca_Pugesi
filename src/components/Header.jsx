import React from 'react';
import { Landmark } from 'lucide-react';
import CustomSelect from './CustomSelect';

export default function Header({ accounts = [], selectedAccount, onAccountSelect }) {
  const accountOptions = accounts.map((account) => account.name);
  const selectedName = selectedAccount?.name || 'Nenhuma conta encontrada';

  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          Olá, Rosangela! 👋
        </h1>
        <p className="text-sm text-gray-500">
          Acompanhe e gerencie os lançamentos da sua empresa
        </p>
      </div>

      <div className="flex flex-col items-start text-xs sm:items-end">
        <span className="text-gray-400 mb-1">Conta Selecionada:</span>
        <div className="flex items-center gap-2">
          <Landmark className="h-4 w-4 text-gray-500" />
          <CustomSelect
            options={accountOptions}
            selected={selectedName}
            onSelect={(name) => {
              const account = accounts.find((item) => item.name === name);
              onAccountSelect(account);
            }}
          />
        </div>
      </div>
    </div>
  );
}