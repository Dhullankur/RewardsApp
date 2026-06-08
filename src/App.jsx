import { useCallback, useEffect, useMemo, useReducer } from "react";
import TableSection from "./components/TableSection";
import DashboardFilters from "./components/DashboardFilters";
import ErrorState from "./components/ErrorState";
import LoadingState from "./components/LoadingState";
import { fetchTransactions } from "./api";
import {
  dashboardReducer,
  INITIAL_DASHBOARD_STATE,
} from "./appReducer";
import {
  DASHBOARD_COPY,
  EMPTY_REWARDS_REPORT,
  TABLE_CONFIG,
} from "./constants";
import {
  createRewardsReport,
  filterTransactionsByDate,
} from "./rewards";
import { logger } from "./logger";

function App() {
  const [state, dispatch] = useReducer(
    dashboardReducer,
    INITIAL_DASHBOARD_STATE,
  );

  const loadTransactions = useCallback(async () => {
    dispatch({ type: "LOAD_START" });

    try {
      const transactions = await fetchTransactions();
      dispatch({ type: "LOAD_SUCCESS", transactions });
    } catch (error) {
      logger.error("Data loading failed", { message: error.message });
      dispatch({
        type: "LOAD_ERROR",
        errorMessage: error.message || "Failed to load data.",
      });
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const filteredTransactions = useMemo(() => {
    if (state.status !== "success") {
      return [];
    }

    return filterTransactionsByDate(
      state.transactions,
      state.filters.dateFrom,
      state.filters.dateTo,
    );
  }, [state]);

  const report = useMemo(() => {
    if (state.status !== "success") {
      return EMPTY_REWARDS_REPORT;
    }

    return createRewardsReport(filteredTransactions);
  }, [state.status, filteredTransactions]);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
          {DASHBOARD_COPY.title}
        </h1>
        <p className="mt-2 text-sm text-slate-600">{DASHBOARD_COPY.description}</p>
      </header>

      {state.status === "loading" && <LoadingState />}

      {state.status === "error" && (
        <ErrorState
          message={state.errorMessage}
          onRetry={loadTransactions}
        />
      )}

      {state.status === "success" && (
        <div className="space-y-4">
          <DashboardFilters
            dateFrom={state.filters.dateFrom}
            dateTo={state.filters.dateTo}
            pageSize={state.filters.pageSize}
            filteredCount={filteredTransactions.length}
            totalCount={state.transactions.length}
            onDateFromChange={(value) =>
              dispatch({ type: "SET_DATE_FROM", value })
            }
            onDateToChange={(value) =>
              dispatch({ type: "SET_DATE_TO", value })
            }
            onClearDates={() => dispatch({ type: "CLEAR_DATES" })}
            onPageSizeChange={(value) =>
              dispatch({ type: "SET_PAGE_SIZE", value })
            }
          />

          {TABLE_CONFIG.map(({ id, title, reportKey, hiddenColumns }) => {
            const tableState = state.tables[id];

            return (
              <TableSection
                key={id}
                title={title}
                rows={report[reportKey]}
                page={tableState.page}
                onPageChange={(page) =>
                  dispatch({ type: "SET_TABLE_PAGE", table: id, page })
                }
                pageSize={state.filters.pageSize}
                sortKey={tableState.sortKey}
                sortDirection={tableState.sortDirection}
                onSortKeyChange={(sortKey) =>
                  dispatch({ type: "SET_TABLE_SORT_KEY", table: id, sortKey })
                }
                onSortDirectionChange={(direction) =>
                  dispatch({
                    type: "SET_TABLE_SORT_DIRECTION",
                    table: id,
                    direction,
                  })
                }
                hiddenColumns={hiddenColumns}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}

export default App;
