export async function fetchTransactions() {
  const response = await fetch('/transactions.json')

  if (!response.ok) {
    throw new Error('Unable to load transactions data.')
  }

  const payload = await response.json()

  if (!payload || !Array.isArray(payload.transactions)) {
    throw new Error('Invalid transactions payload.')
  }

  return payload.transactions
}
