const MONTH_FORMAT_OPTIONS = { month: 'long' }

export function calculateRewardPoints(amount) {
  const safeAmount = Number.isFinite(amount) ? amount : 0
  const wholeDollars = Math.floor(safeAmount)

  if (wholeDollars <= 50) {
    return 0
  };

  if (wholeDollars <= 100) {
    return wholeDollars - 50
  };

  return (wholeDollars - 100) * 2 + 50
};

export function formatCurrency(value) {
  const safeValue = Number.isFinite(value) ? value : 0
  return safeValue.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
};

export function formatDate(value) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Invalid date'
  };

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
};

export function createRewardsReport(transactions) {
  const validTransactions = transactions.filter((transaction) => {
    const hasRequiredFields =
      typeof transaction.transactionId === 'string' &&
      typeof transaction.customerId === 'string' &&
      typeof transaction.name === 'string' &&
      typeof transaction.purchaseDate === 'string'

    if (!hasRequiredFields) {
      return false
    }

    const parsedDate = new Date(transaction.purchaseDate)
    return !Number.isNaN(parsedDate.getTime())
  });

  const sortedTransactions = [...validTransactions].sort((left, right) =>
    left.purchaseDate.localeCompare(right.purchaseDate),
  );  

  const transactionsTable = sortedTransactions.map((transaction) => {
    const rewardPoints = calculateRewardPoints(transaction.price)

    return {
      transactionId: transaction.transactionId,
      customerName: transaction.name,
      purchaseDate: formatDate(transaction.purchaseDate),
      productPurchased: transaction.productPurchased ?? 'N/A',
      price: formatCurrency(transaction.price),
      rewardPoints,
    };  
  });

  const monthlyMap = validTransactions.reduce((accumulator, transaction) => {
    const purchaseDate = new Date(transaction.purchaseDate)
    const month = purchaseDate.toLocaleString(undefined, MONTH_FORMAT_OPTIONS)
    const year = purchaseDate.getFullYear()
    // Monthly report needs one row per customer per month (not one row per customer).
    // Same customerId in April and May must land in different buckets.
    const key = `${transaction.customerId}-${year}-${purchaseDate.getMonth()}`
    const currentPoints = calculateRewardPoints(transaction.price)

    const existingEntry = accumulator.get(key)

    if (existingEntry) {
      existingEntry.rewardPoints += currentPoints
      return accumulator
    };

    accumulator.set(key, {
      customerId: transaction.customerId,
      name: transaction.name,
      month,
      year,
      rewardPoints: currentPoints,
      sortableDate: new Date(year, purchaseDate.getMonth(), 1).toISOString(),
    });

    return accumulator
  }, new Map());  

  const monthlyRewardsTable = Array.from(monthlyMap.values())
    .sort((left, right) => {
      const dateDifference =
        new Date(left.sortableDate) - new Date(right.sortableDate)

      if (dateDifference !== 0) {
        return dateDifference
      }

      return left.customerId.localeCompare(right.customerId)
    })
    .map((entry) => {
      const row = { ...entry }
      delete row.sortableDate
      return row
    });  

  const totalRewardsMap = monthlyRewardsTable.reduce((accumulator, row) => {
    const existingTotal = accumulator.get(row.customerId);

    // If the customer already exists in the accumulator, add the reward points to the existing total.
    if (existingTotal) {
      existingTotal.rewardPoints += row.rewardPoints
      return accumulator
    }

    // If the customer does not exist in the accumulator, set the reward points for the customer.
    accumulator.set(row.customerId, {
      customerName: row.name,
      rewardPoints: row.rewardPoints,
    })
    return accumulator
  }, new Map())

  const totalRewardsTable = Array.from(totalRewardsMap.values()).sort((a, b) =>
    a.customerName.localeCompare(b.customerName),
  )

  return {
    transactionsTable,
    monthlyRewardsTable,
    totalRewardsTable,
  }
}

export function getPageRows(allRows, page, pageSize) {
  const safePage = Math.max(1, page)
  const startIndex = (safePage - 1) * pageSize

  return {
    rows: allRows.slice(startIndex, startIndex + pageSize),
    totalPages: Math.max(1, Math.ceil(allRows.length / pageSize)),
    currentPage: safePage,
  }
}
