import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import KpiCards from "./components/KpiCards";
import TransactionsTable from "./components/TransactionsTable";
import RelatoryButtons from "./components/RelatoryButtons";
import PastelCards from "./components/PastelCards";
import ChartsSection from "./components/ChartsSection";
import { data } from "autoprefixer";

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

const parseCurrency = (valueString) => {
  if (!valueString) return 0;
  const normalizedValue = String(valueString)
    .replace("R$", "")
    .replace(/\s/g, "")
    .trim();
  const numericString = normalizedValue.includes(",")
    ? normalizedValue.replace(/\./g, "").replace(",", ".")
    : normalizedValue;
  return parseFloat(numericString) || 0;
};

export default function App() {
  const currentMonthIndex = monthOptions[new Date().getMonth() + 1];
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(() => {
    const savedAccount = localStorage.getItem('@finance:selectedAccount');
    return savedAccount ? JSON.parse(savedAccount) : null;
  });
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const accountTransactions = transactions.filter(
    (transaction) => transaction.accountId === selectedAccount?.id,
  );

  const categoryOptions = [
    "Todas as Categorias",
    ...new Set(categories
      .map((categories) => categories)
      .filter(Boolean)
    )
  ];

  const statusOptions = [
    ...new Set(transactions
      .map((transaction) => transaction.status)
      .filter(Boolean)
    ),
    "Atrasado"
  ];

  useEffect(() => {
    async function loadAccounts() {
      try {
        const response = await fetch("http://localhost:3001/api/accounts");

        if (!response.ok) {
          throw new Error("Não foi possível carregar as contas");
        }

        const accountData = await response.json();
        setAccounts(accountData);

        if (accountData.length > 0) {
          // 1. Tenta buscar a conta salva no localStorage
          const savedAccount = localStorage.getItem("@finance:selectedAccount");
          
          if (savedAccount) {
            const parsedAccount = JSON.parse(savedAccount);
            // 2. Procura a conta salva na lista vinda do banco (pelo ID)
            const foundAccount = accountData.find((acc) => acc.id === parsedAccount.id);

            if (foundAccount) {
              setSelectedAccount(foundAccount);
              return;
            }
          }

          // 3. Fallback: se não tiver nada salvo (ou ID não existir), usa a primeira conta
          setSelectedAccount(accountData[0]);
          localStorage.setItem("@finance:selectedAccount", JSON.stringify(accountData[0]));
        }
      } catch (error) {
        console.error("Erro ao carregar contas:", error.message);
      }
    }

    loadAccounts();
  }, []);

  useEffect(() => {
    async function loadTransactions() {
      try {
        const response = await fetch("http://localhost:3001/api/transactions");

        if (!response.ok) {
          throw new Error("Não foi possível carregar as transações");
        }

        const transactionData = await response.json();

        const formattedTransactions = transactionData.map((t) => ({
          id: t.id,
          accountId: t.account_id,
          vencimento: t.data_vencimento?.slice(0, 10),
          fornecedor: t.fornecedor,
          categoria: t.categoria,
          valor: t.valor,
          status: t.status,
          current_installment: t.current_installment,
          total_installment: t.total_installment,
          group_id: t.group_id,
          nfe_url: t.nfe_url,
          xml_url: t.xml_url,
          boleto_url: t.boleto_url,
          receipt_url: t.receipt_url,
        }));
        console.log("Transações formatadas: ", formattedTransactions)
        setTransactions(formattedTransactions);
      } catch (error) {
        console.error("Erro ao carregar transações: ", error.message);
      }
    }

    loadTransactions();
  }, []);

  const [categoryTableHeader, setCategoryTableHeader] = useState(
    categoryOptions[0],
  );
  const [monthTableFilter, setMonthTableFilter] = useState(currentMonthIndex);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCardStatus, setSelectedCardStatus] = useState("Todos");
  const [pageTransactions, setPageTransactions] = useState([]);
  const filteredTransactions = accountTransactions.filter((transaction) => {
    if (!transaction) return false;

    const category =
      categoryTableHeader === "Todas as Categorias" ||
      transaction.categoria?.includes(categoryTableHeader);
    // console.log("Existe categoria? " + category);

    if (!category) return false;

    if (monthTableFilter && monthTableFilter != monthOptions[0]) {
      if (!transaction.vencimento) return false;

      const selectedMonthNumber = monthOptions.indexOf(monthTableFilter);
      const monthString = transaction.vencimento.split("-")[1];
      const transactionMonthIndex = parseInt(monthString, 10);

      if (transactionMonthIndex !== selectedMonthNumber) {
        return false;
      }
    }

    if (startDate && transaction.vencimento < startDate) {
      return false;
    }

    if (endDate && transaction.vencimento > endDate) {
      return false;
    }

    if (
      selectedCardStatus !== "Todos" &&
      transaction.status !== selectedCardStatus
    ) {
      return false;
    }

    return true;
  });

  const totalExpenses = filteredTransactions.reduce(
    (acc, item) => acc + parseCurrency(item.valor),
    0,
  );
  const expensesCount = filteredTransactions.length;

  const paidTransactions = filteredTransactions.filter(
    (item) => item.status === "Pago",
  );
  const totalPaid = paidTransactions.reduce(
    (acc, item) => acc + parseCurrency(item.valor),
    0,
  );
  const paidCount = paidTransactions.length;

  const pendingTransactions = filteredTransactions.filter(
    (item) => item.status === "Pendente",
  );
  const totalPending = pendingTransactions.reduce(
    (acc, item) => acc + parseCurrency(item.valor),
    0,
  );
  const pendingCount = pendingTransactions.length;

  const handleAccountSelect = (account) => {
    setSelectedAccount(account);
    if (account) {
      localStorage.setItem("@finance:selectedAccount", JSON.stringify(account));
    }
  };

  const handleDeleteCategory = async (e, categoryToDelete) => {
      e.stopPropagation();
      e.preventDefault();
      if(!window.confirm(`Tem certeza que deseja excluir a categoria "${categoryToDelete}"`)) {
        return;
      }

      try {
        const encodedName = encodeURIComponent(categoryToDelete);
        const response = await fetch(`http://localhost:3001/api/transactions/categories/${encodedName}`, {
          method: "DELETE"
        });

        if(!response.ok) {
          const errorData = await response.json().catch(() => (({})));
          throw new Error(errorData.error || "Erro ao excluir categoria.");
        }

        setCategories((prev) => prev.filter((cat) => cat !== categoryToDelete));

        console.log("CATEGORIA: ", categories);
        if(categories === categoryToDelete) {
          setCategories("");
        }
      } catch(error) {
        console.error("Erro ao excluir categoria: ", error.message);
        alert(error.message);
      }
    };

  return (
    <div className="flex min-h-screen bg-[#F4F4F6] text-gray-800 font-sans">
      <Sidebar />

      <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <Header
            accounts={accounts}
            selectedAccount={selectedAccount}
            onAccountSelect={handleAccountSelect}
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
            transactions={accountTransactions}
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
            statusOptions={statusOptions}
            monthOptions={monthOptions}
            onPageDataChange={setPageTransactions}
            selectedAccount={selectedAccount}
            categories={categories}
            setCategories={setCategories}
            handleDeleteCategory={handleDeleteCategory}
          />
          <RelatoryButtons />
          <PastelCards transactions={filteredTransactions} />
          <ChartsSection transactions={filteredTransactions} />
        </div>
      </main>
    </div>
  );
}
