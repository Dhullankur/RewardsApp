import {
  DEFAULT_PAGE,
  DEFAULT_SORT_DIRECTION,
  PAGE_SIZE,
  TABLE_CONFIG,
} from "./constants";

const createTableState = (sortKey) => ({
  page: DEFAULT_PAGE,
  sortKey,
  sortDirection: DEFAULT_SORT_DIRECTION,
});

const createInitialTableState = () =>
  TABLE_CONFIG.reduce(
    (tables, { id, defaultSortKey }) => ({
      ...tables,
      [id]: createTableState(defaultSortKey),
    }),
    {},
  );

export const INITIAL_DASHBOARD_STATE = {
  status: "loading",
  errorMessage: "",
  transactions: [],
  filters: {
    dateFrom: "",
    dateTo: "",
    pageSize: PAGE_SIZE,
  },
  tables: createInitialTableState(),
};

function resetTablePages(tables) {
  return Object.fromEntries(
    Object.entries(tables).map(([tableKey, tableState]) => [
      tableKey,
      { ...tableState, page: DEFAULT_PAGE },
    ]),
  );
}

export function dashboardReducer(state, action) {
  switch (action.type) {
    case "LOAD_START":
      return {
        ...state,
        status: "loading",
        errorMessage: "",
      };

    case "LOAD_SUCCESS":
      return {
        ...INITIAL_DASHBOARD_STATE,
        status: "success",
        transactions: action.transactions,
      };

    case "LOAD_ERROR":
      return {
        ...state,
        status: "error",
        errorMessage: action.errorMessage,
      };

    case "SET_DATE_FROM":
      return {
        ...state,
        filters: {
          ...state.filters,
          dateFrom: action.value,
          dateTo:
            state.filters.dateTo && action.value && state.filters.dateTo < action.value
              ? ""
              : state.filters.dateTo,
        },
        tables: resetTablePages(state.tables),
      };

    case "SET_DATE_TO":
      return {
        ...state,
        filters: { ...state.filters, dateTo: action.value },
        tables: resetTablePages(state.tables),
      };

    case "CLEAR_DATES":
      return {
        ...state,
        filters: { ...state.filters, dateFrom: "", dateTo: "" },
        tables: resetTablePages(state.tables),
      };

    case "SET_PAGE_SIZE":
      return {
        ...state,
        filters: { ...state.filters, pageSize: action.value },
        tables: resetTablePages(state.tables),
      };

    case "SET_TABLE_PAGE":
      return {
        ...state,
        tables: {
          ...state.tables,
          [action.table]: {
            ...state.tables[action.table],
            page: action.page,
          },
        },
      };

    case "SET_TABLE_SORT_KEY":
      return {
        ...state,
        tables: {
          ...state.tables,
          [action.table]: {
            ...state.tables[action.table],
            sortKey: action.sortKey,
          },
        },
      };

    case "SET_TABLE_SORT_DIRECTION":
      return {
        ...state,
        tables: {
          ...state.tables,
          [action.table]: {
            ...state.tables[action.table],
            sortDirection: action.direction,
          },
        },
      };

    default:
      return state;
  }
}
