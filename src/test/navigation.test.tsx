import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Sidebar, NAV_ITEMS } from "@/components/layout/sidebar";

function renderWithRouter(ui: React.ReactElement, initialPath = "/dashboard") {
  return render(<MemoryRouter initialEntries={[initialPath]}>{ui}</MemoryRouter>);
}

describe("Application Shell & Navigation", () => {
  it("renders all seven milestone routes in the sidebar", () => {
    renderWithRouter(<Sidebar />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Characters")).toBeInTheDocument();
    expect(screen.getByText("Pull Planner")).toBeInTheDocument();
    expect(screen.getByText("Resources")).toBeInTheDocument();
    expect(screen.getByText("Progression")).toBeInTheDocument();
    expect(screen.getByText("Teams")).toBeInTheDocument();
    expect(screen.getByText("Banner Radar")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("contains exact href paths for all navigation links", () => {
    renderWithRouter(<Sidebar />);

    NAV_ITEMS.forEach((item) => {
      const link = screen.getByText(item.title).closest("a");
      expect(link).not.toBeNull();
      expect(link).toHaveAttribute("href", item.href);
    });
  });
});
