import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { Sidebar, NAV_ITEMS } from "@/components/layout/sidebar";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

describe("Application Shell & Navigation", () => {
  it("renders all seven milestone routes in the sidebar", () => {
    render(<Sidebar />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Characters")).toBeInTheDocument();
    expect(screen.getByText("Pull Planner")).toBeInTheDocument();
    expect(screen.getByText("Resources")).toBeInTheDocument();
    expect(screen.getByText("Progression")).toBeInTheDocument();
    expect(screen.getByText("Teams")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("contains exact href paths for all navigation links", () => {
    render(<Sidebar />);

    NAV_ITEMS.forEach((item) => {
      const link = screen.getByText(item.title).closest("a");
      expect(link).toHaveAttribute("href", item.href);
    });
  });
});
