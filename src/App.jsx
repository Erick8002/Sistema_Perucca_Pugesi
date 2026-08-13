import React from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import KpiCards from './components/KpiCards';
import TransactionsTable from './components/TransactionsTable';
import ActionButtons from './components/ActionButtons';
import PastelCards from './components/PastelCards';
import ChartsSection from './components/ChartsSection';

export default function App() {
  return (
    <div className="flex min-h-screen bg-[#F4F4F6] text-gray-800 font-sans">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          <Header />
          <KpiCards />
          <TransactionsTable /> 
          <ActionButtons />
          <PastelCards />
          <ChartsSection />
        </div>
      </main>
    </div>
  );
}