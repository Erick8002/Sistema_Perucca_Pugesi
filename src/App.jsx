import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import KpiCards from './components/KpiCards';
import TransactionsTable from './components/TransactionsTable';
import RelatoryButtons from './components/RelatoryButtons';
import PastelCards from './components/PastelCards';
import ChartsSection from './components/ChartsSection';

const categoryOptions = [
  "Todas as Categorias",
  "Fertilizantes",
  "Defensivos",
  "Sementes",
];

const monthOptions = [
  "Selecione o mês",
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const initialTransactions = [
  {
    id: 1,
    vencimento: "2026-08-08",
    fornecedor: "Agrofértil Insumos",
    categoria: "Fertilizantes",
    valor: "4.500,00",
    status: "Pago",
  },
  {
    id: 2,
    vencimento: "2026-08-10",
    fornecedor: "MaqCampo Peças e Manutenção",
    categoria: "Defensivos",
    valor: "1.580,00",
    status: "Pendente",
  },
  {
    id: 3,
    vencimento: "2026-08-17",
    fornecedor: "Sementes AgroTech",
    categoria: "Sementes",
    valor: "2.300,00",
    status: "Pendente",
  },
  { 
    id: 4,
    vencimento: "2026-07-17",
    fornecedor: "Fertilizantes AgroTech",
    categoria: "Fertilizantes",
    valor: "2.000,00",
    status: "Pago",
  },
  {
    id: 5,
    vencimento: "2026-08-30",
    fornecedor: "Agrohara",
    categoria: "Sementes",
    valor: "3.250,00",
    status: "Pendente",
  }
];

const parseCurrency = (valueString) => {
  if(!valueString) return 0;
  const normalizedValue = String(valueString).replace("R$", "").replace(/\s/g, "").trim();
  const numericString = normalizedValue.includes(",")
    ? normalizedValue.replace(/\./g, "").replace(",", ".")
    : normalizedValue;
  return parseFloat(numericString) || 0;
};

export default function App() {
  const currentMonthIndex = monthOptions[new Date().getMonth() + 1];

  const [transactions, setTransactions] = useState(() => {
    try {
      const savedData = localStorage.getItem('@finance:transactions');
      if(savedData && savedData !== 'undefined' && savedData !== 'null') {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error('Erro ao ler do localStorage: ', error);
    }
    return initialTransactions;
  });

  useEffect(() => {
    localStorage.setItem('@finance:transactions', JSON.stringify(transactions));
  }, [transactions]);

  const [categoryTableHeader, setCategoryTableHeader] = useState(categoryOptions[0]);
  const [monthTableFilter, setMonthTableFilter] = useState(currentMonthIndex);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedCardStatus, setSelectedCardStatus] = useState("Todos");

  const filteredTransactions = transactions.filter((transaction) => {
    if (!transaction) return false;

    const category = categoryTableHeader === "Todas as Categorias" || transaction.categoria?.includes(categoryTableHeader);
    // console.log("Existe categoria? " + category);

    if (!category) return false;

    if(monthTableFilter && monthTableFilter != monthOptions[0]) {
      const selectedMonthNumber = monthOptions.indexOf(monthTableFilter);
      const monthString = transaction.vencimento.split("-")[1];
      const transactionMonthIndex = parseInt(monthString, 10);

      if(transactionMonthIndex !== selectedMonthNumber) {
        return false;
      }
    }

    if (startDate && transaction.vencimento < startDate) {
      return false;
    }

    if (endDate && transaction.vencimento > endDate) {
      return false;
    }

    if(selectedCardStatus !== "Todos" && transaction.status !== selectedCardStatus){
      return false;
    }

    return true;
  });

  const totalExpenses = filteredTransactions.reduce((acc, item) => acc + parseCurrency(item.valor), 0);
  const expensesCount = filteredTransactions.length;

  const paidTransactions = filteredTransactions.filter((item) => item.status === "Pago");
  const totalPaid = paidTransactions.reduce(
    (acc, item) => acc + parseCurrency(item.valor),
    0
  );
  const paidCount = paidTransactions.length;

  const pendingTransactions = filteredTransactions.filter((item) => item.status === "Pendente");
  const totalPending = pendingTransactions.reduce(
    (acc, item) => acc + parseCurrency(item.valor),
    0
  );
  const pendingCount = pendingTransactions.length;

  return (
    <div className="flex min-h-screen bg-[#F4F4F6] text-gray-800 font-sans">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          <Header />
          <KpiCards 
            totalExpenses={totalExpenses}
            expensesCount={expensesCount}
            totalPaid={totalPaid}
            paidCount={paidCount}
            totalPending={totalPending}
            pendingCount={pendingCount}
            selectedCardStatus={selectedCardStatus}
            setSelectedCardStatus={setSelectedCardStatus}
          />

          <TransactionsTable 
            filterTransactions={filteredTransactions}
            transactions={transactions}
            setTransactions={setTransactions}
            categoryTableHeader={categoryTableHeader}
            setCategoryTableHeader={setCategoryTableHeader}
            monthTableFilter={monthTableFilter}
            setMonthTableFilter={setMonthTableFilter}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            categoryOptions={categoryOptions}
            monthOptions={monthOptions}
          />
          <RelatoryButtons />
          <PastelCards />
          <ChartsSection />
        </div>
      </main>
    </div>
  );
}