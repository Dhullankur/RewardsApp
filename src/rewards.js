import { logger } from "./logger";

const MONTH_FORMAT_OPTIONS = { month: "long" };

export function getPurchaseMonthParts(isoDate) {
  const [yearText, monthText, dayText] = isoDate.split("-");

  if (!yearText || !monthText || !dayText) {
    return null;
  }

  const year = Number(yearText);
  const monthNumber = Number(monthText);

  if (!Number.isInteger(year) || !Number.isInteger(monthNumber)) {
    return null;
  }

  if (monthNumber < 1 || monthNumber > 12) {
    return null;
  }

  const monthDate = new Date(year, monthNumber - 1, 1);

  return {
    monthKey: `${yearText}-${monthText.padStart(2, "0")}`,
    year,
    month: monthDate.toLocaleString(undefined, MONTH_FORMAT_OPTIONS),
  };
}

export function calculateRewardPoints(amountInDollars) {
  if (!Number.isFinite(amountInDollars) || amountInDollars < 0) {
    throw new Error(`Invalid purchase amount: ${amountInDollars}`);
  }

  const wholeDollars = Math.floor(amountInDollars);

  if (wholeDollars <= 50) {
    return 0;
  }

  if (wholeDollars <= 100) {
    return wholeDollars - 50;
  }

  return (wholeDollars - 100) * 2 + 50;
}

export function formatCurrency(value) {
  const safeValue = Number.isFinite(value) ? value : 0;
  return safeValue.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function validateTransaction(transaction) {
  const hasRequiredFields =
    typeof transaction.transactionId === "string" &&
    typeof transaction.customerId === "string" &&
    typeof transaction.name === "string" &&
    typeof transaction.purchaseDate === "string" &&
    Number.isFinite(transaction.price);

  const monthParts = hasRequiredFields
    ? getPurchaseMonthParts(transaction.purchaseDate)
    : null;

  return {
    isValid: hasRequiredFields && monthParts !== null,
    monthParts,
  };
}

export function createRewardsReport(transactions) {
  const validTransactions = transactions.reduce((accumulator, transaction) => {
    const { isValid, monthParts } = validateTransaction(transaction);

    if (!isValid) {
      logger.warn("Skipping invalid transaction", {
        transactionId: transaction.transactionId ?? "unknown",
        customerId: transaction.customerId ?? "unknown",
      });
      return accumulator;
    }

    accumulator.push({
      ...transaction,
      monthParts,
    });

    return accumulator;
  }, []);

  const sortedTransactions = [...validTransactions].sort(
    (firstTransaction, secondTransaction) =>
      firstTransaction.purchaseDate.localeCompare(
        secondTransaction.purchaseDate,
      ),
  );

  const transactionsTable = sortedTransactions.map((transaction) => {
    const rewardPoints = calculateRewardPoints(transaction.price);

    return {
      transactionId: transaction.transactionId,
      customerName: transaction.name,
      purchaseDate: formatDate(transaction.purchaseDate),
      productPurchased: transaction.productPurchased ?? "N/A",
      price: formatCurrency(transaction.price),
      rewardPoints,
    };
  });

  const monthlyMap = validTransactions.reduce((accumulator, transaction) => {
    const key = `${transaction.customerId}-${transaction.monthParts.monthKey}`;
    const currentPoints = calculateRewardPoints(transaction.price);
    const existingEntry = accumulator.get(key);

    if (existingEntry) {
      existingEntry.rewardPoints += currentPoints;
      return accumulator;
    }

    accumulator.set(key, {
      customerId: transaction.customerId,
      name: transaction.name,
      month: transaction.monthParts.month,
      year: transaction.monthParts.year,
      rewardPoints: currentPoints,
      monthKey: transaction.monthParts.monthKey,
    });

    return accumulator;
  }, new Map());

  const monthlyRewardsTable = Array.from(monthlyMap.values())
    .sort((firstRow, secondRow) => {
      const monthDifference = firstRow.monthKey.localeCompare(
        secondRow.monthKey,
      );

      if (monthDifference !== 0) {
        return monthDifference;
      }

      return firstRow.customerId.localeCompare(secondRow.customerId);
    })
    .map((row) => {
      const visibleRow = { ...row };
      delete visibleRow.monthKey;
      return visibleRow;
    });

  const totalRewardsMap = monthlyRewardsTable.reduce((accumulator, row) => {
    const existingTotal = accumulator.get(row.customerId);

    if (existingTotal) {
      existingTotal.rewardPoints += row.rewardPoints;
      return accumulator;
    }

    accumulator.set(row.customerId, {
      customerId: row.customerId,
      customerName: row.name,
      rewardPoints: row.rewardPoints,
    });

    return accumulator;
  }, new Map());

  const totalRewardsTable = Array.from(totalRewardsMap.values()).sort(
    (firstCustomer, secondCustomer) =>
      firstCustomer.customerId.localeCompare(secondCustomer.customerId),
  );

  return {
    transactionsTable,
    monthlyRewardsTable,
    totalRewardsTable,
  };
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
