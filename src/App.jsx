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
  "Funcionarios",
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
    vencimento: "2026-09-08",
    fornecedor: "Agrofértil Insumos",
    categoria: "Fertilizantes",
    valor: "4.500,00",
    status: "Pago",
  },
  {
    id: 2,
    vencimento: "2026-09-10",
    fornecedor: "MaqCampo Peças e Manutenção",
    categoria: "Defensivos",
    valor: "1.580,00",
    status: "Pendente",
  },
  {
    id: 3,
    vencimento: "2026-09-17",
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
    vencimento: "2026-09-30",
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
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    async function loadAccounts() {
      try {
        const response = await fetch('http://localhost:3001/api/accounts');

        if (!response.ok) {
          throw new Error('Não foi possível carregar as contas');
        }

        const accountData = await response.json();
        setAccounts(accountData);
        setSelectedAccount(accountData[0] || null);
      } catch (error) {
        console.error('Erro ao carregar contas:', error.message);
      }
    }

    loadAccounts();
  }, []);

  useEffect(() => {
    async function loadTransactions() {
      try{
        const response = await fetch('http://localhost:3001/api/transactions')

        if(!response.ok) {
          throw new Error('Não foi possível carregar as transações')
        }

        const transactionData = await response.json();

        const formattedTransactions = transactionData.map((t) => ({
          id: t.id,
          vencimento: t.data_vencimento?.slice(0, 10),
          fornecedor: t.fornecedor,
          categoria: t.categoria,
          valor: t.valor,
          status: t.status,
        }));

        setTransactions(formattedTransactions);
      } catch(error) {
        console.error('Erro ao carregar transações: ', error.message);
      }
    }

    loadTransactions();
  }, []);

  // useEffect(() => {
  //   localStorage.setItem('@finance:transactions', JSON.stringify(transactions));
  // }, [transactions]);

  const [categoryTableHeader, setCategoryTableHeader] = useState(categoryOptions[0]);
  const [monthTableFilter, setMonthTableFilter] = useState(currentMonthIndex);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedCardStatus, setSelectedCardStatus] = useState("Todos");
  const [pageTransactions, setPageTransactions] = useState([]);

  const filteredTransactions = transactions.filter((transaction) => {
    if (!transaction) return false;

    const category = categoryTableHeader === "Todas as Categorias" || transaction.categoria?.includes(categoryTableHeader);
    // console.log("Existe categoria? " + category);

    if (!category) return false;

    if(monthTableFilter && monthTableFilter != monthOptions[0]) {
      if (!transaction.vencimento) return false;

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

      <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <Header
            accounts={accounts}
            selectedAccount={selectedAccount}
            onAccountSelect={setSelectedAccount}
          />
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
            onPageDataChange={setPageTransactions}
          />
          <RelatoryButtons />
          <PastelCards transactions={filteredTransactions} />
          <ChartsSection transactions={filteredTransactions} />
        </div>
      </main>
    </div>
  );
}