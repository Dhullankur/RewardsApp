// API returns `price` in integer cents; convert once here before reward logic and display.
export function centsToDollars(amountInCents) {
  if (!Number.isInteger(amountInCents) || amountInCents < 0) {
    throw new Error(`Invalid price in cents: ${amountInCents}`);
  }

  return amountInCents / 100;
}

function normalizeTransaction(transaction) {
  return {
    ...transaction,
    price: centsToDollars(transaction.price),
  };
}

export async function fetchTransactions() {
  const response = await fetch(`${import.meta.env.BASE_URL}transactions.json`);

  if (!response.ok) {
    throw new Error("Unable to load transactions data.");
  }

  const payload = await response.json();

  if (!payload || !Array.isArray(payload.transactions)) {
    throw new Error("Invalid transactions payload.");
  }

  return payload.transactions.map(normalizeTransaction);
}
