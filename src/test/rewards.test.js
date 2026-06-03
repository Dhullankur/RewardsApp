import { describe, expect, it } from "vitest";
import {
  calculateRewardPoints,
  createRewardsReport,
  getPageRows,
  getPurchaseMonthParts,
} from "../rewards";

describe("getPurchaseMonthParts", () => {
  it("returns stable month key and display fields", () => {
    expect(getPurchaseMonthParts("2026-04-20")).toEqual({
      monthKey: "2026-04",
      year: 2026,
      month: "April",
    });
  });

  it("returns null for invalid dates", () => {
    expect(getPurchaseMonthParts("2026-13-01")).toBeNull();
    expect(getPurchaseMonthParts("invalid")).toBeNull();
  });
});

describe("calculateRewardPoints", () => {
  it("returns 0 for purchases up to 50 dollars", () => {
    expect(calculateRewardPoints(50)).toBe(0);
    expect(calculateRewardPoints(10.99)).toBe(0);
    expect(calculateRewardPoints(45.99)).toBe(0);
  });

  it("calculates points between 50 and 100 dollars", () => {
    expect(calculateRewardPoints(75)).toBe(25);
    expect(calculateRewardPoints(100)).toBe(50);
  });

  it("calculates points over 100 dollars", () => {
    expect(calculateRewardPoints(120)).toBe(90);
    expect(calculateRewardPoints(120.99)).toBe(90);
  });

  it("uses whole dollars before calculating points", () => {
    expect(calculateRewardPoints(100.2)).toBe(50);
  });

  it("throws for invalid dollar amounts", () => {
    expect(() => calculateRewardPoints(undefined)).toThrow(/Invalid purchase/);
    expect(() => calculateRewardPoints(-10)).toThrow(/Invalid purchase/);
  });
});

describe("createRewardsReport", () => {
  it("groups rewards by customer and month for Apr–Jun 2026", () => {
    const transactions = [
      {
        transactionId: "T1",
        customerId: "C-101",
        name: "Jane",
        purchaseDate: "2026-04-20",
        productPurchased: "A",
        price: 120,
      },
      {
        transactionId: "T2",
        customerId: "C-101",
        name: "Jane",
        purchaseDate: "2026-05-15",
        productPurchased: "B",
        price: 80,
      },
      {
        transactionId: "T3",
        customerId: "C-101",
        name: "Jane",
        purchaseDate: "2026-06-10",
        productPurchased: "C",
        price: 60,
      },
    ];

    const report = createRewardsReport(transactions);

    expect(report.monthlyRewardsTable).toHaveLength(3);
    expect(report.monthlyRewardsTable.map((row) => row.year)).toEqual([
      2026, 2026, 2026,
    ]);
    expect(report.monthlyRewardsTable.map((row) => row.rewardPoints)).toEqual([
      90, 30, 10,
    ]);
    expect(report.totalRewardsTable[0]).toEqual({
      customerId: "C-101",
      customerName: "Jane",
      rewardPoints: 130,
    });
  });

  it("sorts total rewards by customerId", () => {
    const transactions = [
      {
        transactionId: "T1",
        customerId: "C-200",
        name: "Zara",
        purchaseDate: "2026-04-01",
        productPurchased: "A",
        price: 60,
      },
      {
        transactionId: "T2",
        customerId: "C-100",
        name: "Adam",
        purchaseDate: "2026-04-02",
        productPurchased: "B",
        price: 60,
      },
    ];

    const report = createRewardsReport(transactions);

    expect(report.totalRewardsTable.map((row) => row.customerId)).toEqual([
      "C-100",
      "C-200",
    ]);
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
