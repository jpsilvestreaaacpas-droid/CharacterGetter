import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { StatCard } from "@/components/ui/stat-card";
import { CharacterCard } from "@/components/ui/character-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Sparkles, Users } from "lucide-react";

describe("Design System Components", () => {
  it("renders StatCard with value, subValue, and trend", () => {
    render(
      <StatCard
        label="Available Wishes"
        value={105}
        subValue="93 from Primos + 12 Fates"
        icon={Sparkles}
        trend="Ready to pull"
        highlight="gold"
      />
    );

    expect(screen.getByText("Available Wishes")).toBeInTheDocument();
    expect(screen.getByText("105")).toBeInTheDocument();
    expect(screen.getByText("(93 from Primos + 12 Fates)")).toBeInTheDocument();
    expect(screen.getByText("Ready to pull")).toBeInTheDocument();
  });

  it("renders CharacterCard with rarity stars, element, and level", () => {
    render(
      <CharacterCard
        id="raiden-shogun"
        name="Raiden Shogun"
        title="Plane of Euthymia"
        element="Electro"
        weaponType="Polearm"
        rarity={5}
        level={90}
        constellation={2}
      />
    );

    expect(screen.getByText("Raiden Shogun")).toBeInTheDocument();
    expect(screen.getByText("Plane of Euthymia")).toBeInTheDocument();
    expect(screen.getByText("Electro")).toBeInTheDocument();
    expect(screen.getByText("Polearm")).toBeInTheDocument();
    expect(screen.getByText("90")).toBeInTheDocument();
    expect(screen.getByText("C2")).toBeInTheDocument();
  });

  it("renders EmptyState with action label and description", () => {
    let actionTriggered = false;
    render(
      <EmptyState
        title="No items found"
        description="Try adjusting your search criteria."
        actionLabel="Reset"
        onAction={() => {
          actionTriggered = true;
        }}
      />
    );

    expect(screen.getByText("No items found")).toBeInTheDocument();
    expect(screen.getByText("Try adjusting your search criteria.")).toBeInTheDocument();
    const btn = screen.getByText("Reset");
    btn.click();
    expect(actionTriggered).toBe(true);
  });
});
