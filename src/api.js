// API returns `price` in cents; convert once here before reward logic and display.
export function centsToDollars(amountInCents) {
  const safeCents = Number.isFinite(amountInCents) ? amountInCents : 0
  return safeCents / 100
}

function formatTransaction(transaction) {
  return {
    ...transaction,
    price: centsToDollars(transaction.price),
  }
}

export async function fetchTransactions() {
  const response = await fetch(`${import.meta.env.BASE_URL}transactions.json`)

  if (!response.ok) {
    throw new Error('Unable to load transactions data.')
  }

  const payload = await response.json()

  if (!payload || !Array.isArray(payload.transactions)) {
    throw new Error('Invalid transactions payload.')
  }

  return payload.transactions.map(formatTransaction)
}
