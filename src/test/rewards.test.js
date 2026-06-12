import { describe, expect, it } from "vitest";
import { mockTransactions } from "./fixtures/transactions";
import { REPORT_KEYS } from "../constants";
import {
  buildCustomerNameMap,
  buildMonthlyUsage,
  buildTotalRewards,
  calculateRewardPoints,
  createRewardsReport,
  filterTransactionsByDate,
  formatCurrency,
  getPageRows,
  sortTableRows,
} from "../util/rewards";

describe("formatCurrency", () => {
  it("formats amounts with a dollar symbol only", () => {
    expect(formatCurrency(124.99)).toBe("$124.99");
    expect(formatCurrency(0)).toBe("$0.00");
    expect(formatCurrency(124.99)).not.toMatch(/^US/);
  });
});

describe("calculateRewardPoints", () => {
  it("returns 0 for purchases up to 50 dollars", () => {
    expect(calculateRewardPoints(50)).toBe(0);
    expect(calculateRewardPoints(45.99)).toBe(0);
  });

  it("calculates points between 50 and 100 dollars", () => {
    expect(calculateRewardPoints(75)).toBe(25);
    expect(calculateRewardPoints(100)).toBe(50);
  });

  it("calculates points over 100 dollars", () => {
    expect(calculateRewardPoints(120)).toBe(90);
  });
});

describe("buildCustomerNameMap", () => {
  it("keeps one name per customer id", () => {
    const nameMap = buildCustomerNameMap(mockTransactions);

    expect(nameMap.get("C-101")).toBe("Jane Doe");
    expect(nameMap.get("C-102")).toBe("Adam Smith");
  });
});

describe("createRewardsReport", () => {
  it("builds all tables from the most recent month only", () => {
    const report = createRewardsReport(mockTransactions);

    expect(report[REPORT_KEYS.TRANSACTIONS]).toHaveLength(2);
    expect(
      report[REPORT_KEYS.TRANSACTIONS].find(
        (row) => row.transactionId === "T-2026-0007",
      ),
    ).toMatchObject({
      name: "Zara Khan",
      purchaseDate: "Jun-01-2026",
      price: "$189.99",
      rewardPoints: 228,
    });

    expect(report[REPORT_KEYS.MONTHLY]).toHaveLength(1);
    expect(
      report[REPORT_KEYS.MONTHLY].find((row) => row.customerId === "C-103"),
    ).toEqual(
      expect.objectContaining({
        name: "Zara Khan",
        date: "Jun-01-2026",
        amountSpent: "$254.99",
        rewardPoints: 358,
      }),
    );

    expect(report[REPORT_KEYS.TOTAL]).toHaveLength(1);
    expect(
      report[REPORT_KEYS.TOTAL].find((row) => row.customerId === "C-103"),
    ).toEqual(
      expect.objectContaining({
        name: "Zara Khan",
        amountSpent: "$254.99",
        rewardPoints: 358,
      }),
    );
  });

  it("avoids floating point drift when combining monthly spend", () => {
    const transactions = [
      {
        transactionId: "T1",
        customerId: "C-101",
        name: "John Carter",
        purchaseDate: "2026-06-02",
        productPurchased: "A",
        price: 59.99,
      },
      {
        transactionId: "T2",
        customerId: "C-101",
        name: "John Carter",
        purchaseDate: "2026-06-03",
        productPurchased: "B",
        price: 65,
      },
    ];
    const customerNames = buildCustomerNameMap(transactions);
    const monthlyUsage = buildMonthlyUsage(transactions, customerNames);

    expect(monthlyUsage[0].amountSpent).toBe(124.99);
    expect(createRewardsReport(transactions)[REPORT_KEYS.MONTHLY][0].amountSpent).toBe(
      "$124.99",
    );
  });
});

describe("buildMonthlyUsage", () => {
  it("assigns stable ids and a single date field to monthly rows", () => {
    const transactions = [
      {
        customerId: "C-101",
        name: "Jane",
        purchaseDate: "2026-04-20",
        price: 80,
      },
    ];
    const customerNames = buildCustomerNameMap(transactions);
    const monthlyUsage = buildMonthlyUsage(transactions, customerNames);

    expect(monthlyUsage[0].id).toBe("MU-2026-04-C-101");
    expect(monthlyUsage[0].date).toBe("Apr-01-2026");
  });
});

describe("buildTotalRewards", () => {
  it("aggregates monthly rows by customer", () => {
    const customerNames = new Map([
      ["C-200", "Zara"],
      ["C-100", "Adam"],
    ]);
    const totals = buildTotalRewards(
      [
        {
          customerId: "C-200",
          name: "Zara",
          amountSpent: 60,
          rewardPoints: 10,
        },
        {
          customerId: "C-100",
          name: "Adam",
          amountSpent: 60,
          rewardPoints: 10,
        },
      ],
      customerNames,
    );

    expect(totals.map((row) => row.customerId)).toEqual(["C-200", "C-100"]);
    expect(totals[0].name).toBe("Zara");
  });
});

describe("filterTransactionsByDate", () => {
  it("filters transactions by ISO date range", () => {
    const filtered = filterTransactionsByDate(
      mockTransactions,
      "2026-05-01",
      "2026-05-31",
    );

    expect(filtered).toHaveLength(3);
    expect(
      filtered.every((transaction) => transaction.purchaseDate.startsWith("2026-05")),
    ).toBe(true);
  });
});

describe("sortTableRows", () => {
  it("sorts numeric reward points descending", () => {
    const sorted = sortTableRows(
      [
        { customerId: "A", rewardPoints: 10 },
        { customerId: "B", rewardPoints: 50 },
      ],
      "rewardPoints",
      -1,
    );

    expect(sorted[0].customerId).toBe("B");
  });

  it("sorts formatted currency values numerically", () => {
    const sorted = sortTableRows(
      [
        { customerId: "A", amountSpent: "$120.00" },
        { customerId: "B", amountSpent: "$45.99" },
      ],
      "amountSpent",
      1,
    );

    expect(sorted[0].customerId).toBe("B");
  });

  it("sorts api-formatted dates chronologically", () => {
    const sorted = sortTableRows(
      [
        { customerId: "A", purchaseDate: "Jun-18-2026" },
        { customerId: "B", purchaseDate: "Jun-01-2026" },
      ],
      "purchaseDate",
      1,
    );

    expect(sorted[0].customerId).toBe("B");
  });
});

describe("getPageRows", () => {
  it("returns one page of rows", () => {
    const rows = Array.from({ length: 10 }, (_, index) => ({ id: index + 1 }));
    const result = getPageRows(rows, 2, 5);

    expect(result.rows).toHaveLength(5);
    expect(result.rows[0].id).toBe(6);
    expect(result.currentPage).toBe(2);
    expect(result.totalPages).toBe(2);
  });
});
