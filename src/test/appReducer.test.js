import { describe, expect, it } from "vitest";
import {
  dashboardReducer,
  INITIAL_DASHBOARD_STATE,
} from "../appReducer";
import { TABLE_IDS } from "../constants";

describe("dashboardReducer", () => {
  it("resets filters and table pages after a successful load", () => {
    const dirtyState = {
      ...INITIAL_DASHBOARD_STATE,
      status: "success",
      filters: {
        dateFrom: "2026-05-01",
        dateTo: "2026-05-31",
        pageSize: 20,
      },
      tables: {
        ...INITIAL_DASHBOARD_STATE.tables,
        [TABLE_IDS.MONTHLY]: {
          ...INITIAL_DASHBOARD_STATE.tables[TABLE_IDS.MONTHLY],
          page: 3,
        },
      },
    };

    const nextState = dashboardReducer(dirtyState, {
      type: "LOAD_SUCCESS",
      transactions: [{ transactionId: "T1" }],
    });

    expect(nextState.transactions).toHaveLength(1);
    expect(nextState.filters).toEqual(INITIAL_DASHBOARD_STATE.filters);
    expect(nextState.tables[TABLE_IDS.MONTHLY].page).toBe(1);
  });

  it("resets table pages when filters change", () => {
    const currentState = {
      ...INITIAL_DASHBOARD_STATE,
      status: "success",
      tables: {
        ...INITIAL_DASHBOARD_STATE.tables,
        [TABLE_IDS.TRANSACTIONS]: {
          ...INITIAL_DASHBOARD_STATE.tables[TABLE_IDS.TRANSACTIONS],
          page: 4,
        },
      },
    };

    const nextState = dashboardReducer(currentState, {
      type: "SET_PAGE_SIZE",
      value: 10,
    });

    expect(nextState.filters.pageSize).toBe(10);
    expect(nextState.tables[TABLE_IDS.TRANSACTIONS].page).toBe(1);
  });
});
