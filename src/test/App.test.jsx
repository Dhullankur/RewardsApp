import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import App from "../App";
import { fetchTransactions } from "../api";
import { rawMockTransactions } from "./fixtures/transactions";

vi.mock("../api", async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    fetchTransactions: vi.fn(),
  };
});

vi.mock("../logger", () => ({
  logger: {
    error: vi.fn(),
  },
}));

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
          setTimeout(() => resolve(rawMockTransactions), 50);
        }),
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Loading rewards data...")).toBeInTheDocument();
    });
  });

  it("renders all three tables with formatted currency and reward points", async () => {
    vi.mocked(fetchTransactions).mockResolvedValue(rawMockTransactions);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("User Monthly Rewards")).toBeInTheDocument();
    });

    expect(screen.getByText("Total Rewards")).toBeInTheDocument();
    expect(screen.getByText("Transactions")).toBeInTheDocument();
    expect(screen.getByText("Training Shorts")).toBeInTheDocument();
    expect(screen.getByText("$189.99")).toBeInTheDocument();
    expect(screen.getAllByText("$254.99").length).toBeGreaterThan(0);
    expect(screen.getAllByText("358").length).toBeGreaterThan(0);
  });

  it("renders rows per page filter with default value", async () => {
    vi.mocked(fetchTransactions).mockResolvedValue(rawMockTransactions);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByLabelText("Rows per page")).toBeInTheDocument();
    });

    expect(screen.getByLabelText("Rows per page")).toHaveValue("5");
  });

  it("filters transactions by date range", async () => {
    vi.mocked(fetchTransactions).mockResolvedValue(rawMockTransactions);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Showing 8 of 8 transactions")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Date from"), {
      target: { value: "2026-05-01" },
    });
    fireEvent.change(screen.getByLabelText("Date to"), {
      target: { value: "2026-05-31" },
    });

    expect(screen.getByText("Showing 3 of 8 transactions")).toBeInTheDocument();
    expect(screen.queryByText("Training Shorts")).not.toBeInTheDocument();
    expect(screen.getByText("Track Jacket")).toBeInTheDocument();
  });

  it("shows an inline warning when the selected date range exceeds 90 days", async () => {
    vi.mocked(fetchTransactions).mockResolvedValue(rawMockTransactions);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByLabelText("Date from")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Date from"), {
      target: { value: "2026-01-01" },
    });
    fireEvent.change(screen.getByLabelText("Date to"), {
      target: { value: "2026-06-09" },
    });

    expect(
      screen.getByText(
        "Date range cannot exceed 90 days. Please select a shorter range.",
      ),
    ).toBeInTheDocument();
  });

  it("shows error state and retries on failure", async () => {
    vi.mocked(fetchTransactions)
      .mockRejectedValueOnce(new Error("Network failed"))
      .mockResolvedValueOnce(rawMockTransactions);

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
