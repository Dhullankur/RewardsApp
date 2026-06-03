import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import App from "../App";
import { fetchTransactions } from "../api";

vi.mock("../api", () => ({
  fetchTransactions: vi.fn(),
}));

vi.mock("../logger", () => ({
  logger: {
    error: vi.fn(),
  },
}));

const mockTransactions = [
  {
    transactionId: "T1",
    customerId: "C-101",
    name: "Jane",
    purchaseDate: "2026-04-15",
    productPurchased: "Item A",
    price: 80,
  },
];

describe("App", () => {
  beforeEach(() => {
    vi.mocked(fetchTransactions).mockReset();
  });

  it("renders dashboard title", () => {
    vi.mocked(fetchTransactions).mockImplementation(
      () => new Promise(() => {}),
    );

    render(<App />);

    expect(screen.getByText("Retail Rewards Dashboard")).toBeInTheDocument();
  });

  it("shows loading state while fetching", async () => {
    vi.mocked(fetchTransactions).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(mockTransactions), 50);
        }),
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Loading rewards data...")).toBeInTheDocument();
    });
  });

  it("renders all three tables on successful fetch", async () => {
    vi.mocked(fetchTransactions).mockResolvedValue(mockTransactions);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("User Monthly Rewards")).toBeInTheDocument();
    });

    expect(screen.getByText("Total Rewards")).toBeInTheDocument();
    expect(screen.getByText("Transactions")).toBeInTheDocument();
    expect(screen.getByText("Item A")).toBeInTheDocument();
  });

  it("shows error state and retries on failure", async () => {
    vi.mocked(fetchTransactions)
      .mockRejectedValueOnce(new Error("Network failed"))
      .mockResolvedValueOnce(mockTransactions);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Network failed")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(screen.getByText("User Monthly Rewards")).toBeInTheDocument();
    });

    expect(fetchTransactions).toHaveBeenCalledTimes(2);
  });
});
