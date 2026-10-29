import React from 'react';
import { Landmark, Plus } from 'lucide-react';
import CustomSelect from './CustomSelect';

export default function Header({
  accounts = [],
  selectedAccount,
  onAccountSelect,
  onAddAccount,
}) {
  const accountOptions = accounts.map((account) => account.name);
  const selectedName = selectedAccount?.name || 'Nenhuma conta encontrada';

  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          Olá, {selectedName}! 👋
        </h1>
        <p className="text-sm text-gray-500">
          Acompanhe e gerencie os lançamentos da sua empresa
        </p>
      </div>

      <div className="flex flex-col items-start gap-3 text-xs sm:items-end">
        <div>
          <span className="mb-1 block text-gray-400">Conta Selecionada:</span>
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
        <button
          type="button"
          onClick={onAddAccount}
          className='text-purple-900 hover:underline'
        >
            Adicionar Conta
        </button>
      </div>
    </div>
  );
}