import {
  COLUMN_KEYS,
  CURRENCY_SORT_KEYS,
  MONTH_FORMAT_OPTIONS,
} from "./constants";

function toCents(amountInDollars) {
  return Math.round(amountInDollars * 100);
}

function fromCents(amountInCents) {
  return amountInCents / 100;
}

export function formatCurrency(value) {
  return `$${fromCents(toCents(value)).toFixed(2)}`;
}

export function calculateRewardPoints(amountInDollars) {
  const wholeDollars = Math.floor(amountInDollars);

  if (wholeDollars <= 50) {
    return 0;
  }

  if (wholeDollars <= 100) {
    return wholeDollars - 50;
  }

  return (wholeDollars - 100) * 2 + 50;
}

function getMonthParts(purchaseDate) {
  const [yearText, monthText] = purchaseDate.split("-");
  const year = Number(yearText);
  const monthNumber = Number(monthText);
  const monthDate = new Date(year, monthNumber - 1, 1);

  return {
    year,
    month: monthDate.toLocaleString(undefined, MONTH_FORMAT_OPTIONS),
    monthKey: `${yearText}-${monthText}`,
  };
}

export function buildMonthlyUsage(transactions) {
  const monthlyMap = transactions.reduce((accumulator, transaction) => {
    const { year, month, monthKey } = getMonthParts(transaction.purchaseDate);
    const key = `${transaction.customerId}-${monthKey}`;
    const priceInCents = toCents(transaction.price);
    const existingEntry = accumulator.get(key);

    if (existingEntry) {
      const amountSpentInCents = existingEntry.amountSpentInCents + priceInCents;

      accumulator.set(key, {
        ...existingEntry,
        amountSpentInCents,
        rewardPoints: calculateRewardPoints(fromCents(amountSpentInCents)),
      });

      return accumulator;
    }

    accumulator.set(key, {
      id: `MU-${monthKey}-${transaction.customerId}`,
      customerId: transaction.customerId,
      name: transaction.name,
      month,
      year,
      amountSpentInCents: priceInCents,
      rewardPoints: calculateRewardPoints(transaction.price),
    });

    return accumulator;
  }, new Map());

  return Array.from(monthlyMap.values()).map(
    ({ amountSpentInCents, ...row }) => ({
      ...row,
      amountSpent: fromCents(amountSpentInCents),
    }),
  );
}

export function buildTotalRewards(monthlyUsage) {
  const totalMap = monthlyUsage.reduce((accumulator, row) => {
    const existingEntry = accumulator.get(row.customerId);
    const amountSpentInCents = toCents(row.amountSpent);

    if (existingEntry) {
      accumulator.set(row.customerId, {
        ...existingEntry,
        amountSpentInCents: existingEntry.amountSpentInCents + amountSpentInCents,
        rewardPoints: existingEntry.rewardPoints + row.rewardPoints,
      });

      return accumulator;
    }

    accumulator.set(row.customerId, {
      id: `TR-${row.customerId}`,
      customerId: row.customerId,
      customerName: row.name,
      amountSpentInCents,
      rewardPoints: row.rewardPoints,
    });

    return accumulator;
  }, new Map());

  return Array.from(totalMap.values()).map(({ amountSpentInCents, ...row }) => ({
    ...row,
    amountSpent: fromCents(amountSpentInCents),
  }));
}

export function createRewardsReport(transactions) {
  const monthlyUsage = buildMonthlyUsage(transactions);
  const totalRewards = buildTotalRewards(monthlyUsage);
  const transactionsTable = [...transactions]
    .sort((first, second) =>
      first.purchaseDate.localeCompare(second.purchaseDate),
    )
    .map((transaction) => ({
      ...transaction,
      price: formatCurrency(transaction.price),
      rewardPoints: calculateRewardPoints(transaction.price),
    }));

  return {
    transactionsTable,
    monthlyRewardsTable: monthlyUsage.map((row) => ({
      ...row,
      amountSpent: formatCurrency(row.amountSpent),
    })),
    totalRewardsTable: totalRewards.map((row) => ({
      ...row,
      amountSpent: formatCurrency(row.amountSpent),
    })),
  };
}

export function filterTransactionsByDate(transactions, dateFrom, dateTo) {
  if (!dateFrom && !dateTo) {
    return transactions;
  }

  return transactions.filter((transaction) => {
    const purchaseDate = transaction.purchaseDate;

    if (dateFrom && purchaseDate < dateFrom) {
      return false;
    }

    if (dateTo && purchaseDate > dateTo) {
      return false;
    }

    return true;
  });
}

function parseSortableValue(row, sortKey) {
  const value = row[sortKey];

  if (typeof value === "number") {
    return value;
  }

  if (CURRENCY_SORT_KEYS.includes(sortKey)) {
    return Number(String(value).replace(/[^0-9.-]/g, ""));
  }

  if (sortKey === COLUMN_KEYS.REWARD_POINTS || sortKey === COLUMN_KEYS.YEAR) {
    return Number(value);
  }

  return String(value ?? "");
}

export function sortTableRows(rows, sortKey, sortDirection = 1) {
  if (!rows.length || !sortKey) {
    return rows;
  }

  const direction = sortDirection >= 0 ? 1 : -1;

  return [...rows].sort((firstRow, secondRow) => {
    const firstValue = parseSortableValue(firstRow, sortKey);
    const secondValue = parseSortableValue(secondRow, sortKey);

    if (typeof firstValue === "number" && typeof secondValue === "number") {
      return (firstValue - secondValue) * direction;
    }

    return String(firstValue).localeCompare(String(secondValue)) * direction;
  });
}

export function getPageRows(allRows, page, pageSize) {
  const safePage = Math.max(1, page);
  const startIndex = (safePage - 1) * pageSize;

  return {
    rows: allRows.slice(startIndex, startIndex + pageSize),
    totalPages: Math.max(1, Math.ceil(allRows.length / pageSize)),
    currentPage: safePage,
  };
}
