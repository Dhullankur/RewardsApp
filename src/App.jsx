import { useCallback, useEffect, useState } from "react";
import DynamicTable from "./components/DynamicTable";
import ErrorState from "./components/ErrorState";
import LoadingState from "./components/LoadingState";
import Pagination from "./components/Pagination";
import { fetchTransactions } from "./api";
import { createRewardsReport, getPageRows } from "./rewards";
import { logger } from "./logger";

const INITIAL_DATA = {
  monthlyRewardsTable: [],
  totalRewardsTable: [],
  transactionsTable: [],
};

const TRANSACTIONS_PAGE_SIZE = 5;

function App() {
  const [appState, setAppState] = useState({
    status: "loading",
    errorMessage: "",
    data: INITIAL_DATA,
  });
  const [transactionPage, setTransactionPage] = useState(1);

  const loadTransactions = useCallback(async () => {
    setAppState((previousState) => ({
      ...previousState,
      status: "loading",
      errorMessage: "",
    }));

    try {
      const transactions = await fetchTransactions();
      const report = createRewardsReport(transactions);

      setTransactionPage(1);
      setAppState({
        status: "success",
        errorMessage: "",
        data: report,
      });
    } catch (error) {
      logger.error("Data loading failed", { message: error.message });

      setAppState((previousState) => ({
        ...previousState,
        status: "error",
        errorMessage: error.message || "Failed to load data.",
      }));
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const paginatedTransactions =
    appState.status === "success"
      ? getPageRows(
          appState.data.transactionsTable,
          transactionPage,
          TRANSACTIONS_PAGE_SIZE,
        )
      : { rows: [], totalPages: 1, currentPage: 1 };

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
          Retail Rewards Dashboard
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Rewards are calculated per transaction: 2 points for every dollar over
          $100, and 1 point for every dollar between $50 and $100.
        </p>
      </header>

      {appState.status === "loading" && <LoadingState />}

      {appState.status === "error" && (
        <ErrorState
          message={appState.errorMessage}
          onRetry={loadTransactions}
        />
      )}

      {appState.status === "success" && (
        <div className="space-y-4">
          <DynamicTable
            title="User Monthly Rewards"
            rows={appState.data.monthlyRewardsTable}
          />
          <DynamicTable
            title="Total Rewards"
            rows={appState.data.totalRewardsTable}
          />
          <DynamicTable
            title="Transactions"
            rows={paginatedTransactions.rows}
          />
          <Pagination
            currentPage={paginatedTransactions.currentPage}
            totalPages={paginatedTransactions.totalPages}
            onPageChange={setTransactionPage}
          />
        </div>
      )}
    </main>
  );
}

export default App;
