import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DynamicTable from "../../components/DynamicTable";

describe("DynamicTable", () => {
  it("renders empty state when rows are empty", () => {
    render(<DynamicTable title="Empty Table" rows={[]} />);

    expect(screen.getByText("No data available.")).toBeInTheDocument();
  });

  it("renders headers from row keys", () => {
    render(
      <DynamicTable
        title="Rewards"
        rows={[{ customerName: "John", rewardPoints: 30 }]}
      />,
    );

    expect(screen.getByText("Customer Name")).toBeInTheDocument();
    expect(screen.getByText("Reward Points")).toBeInTheDocument();
    expect(screen.getByText("John")).toBeInTheDocument();
  });
});
