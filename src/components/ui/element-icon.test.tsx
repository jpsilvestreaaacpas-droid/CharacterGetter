import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { ElementIcon, getElementColor, getElementBg } from "@/components/ui/element-icon";

describe("ElementIcon", () => {
  it("renders correctly for anemo", () => {
    const { container } = render(<ElementIcon element="anemo" alt="Anemo element" />);
    const img = screen.getByAltText("Anemo element");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/images/elements/anemo.png");
  });

  it("handles case-insensitive element names", () => {
    render(<ElementIcon element="Pyro" alt="Pyro element" />);
    const img = screen.getByAltText("Pyro element");
    expect(img).toHaveAttribute("src", "/images/elements/pyro.png");
  });

  it("returns proper color values for elements", () => {
    expect(getElementColor("Hydro")).toBe("text-blue-400");
    expect(getElementColor("Electro")).toBe("text-purple-400");
    expect(getElementBg("Dendro")).toBe("bg-green-500/20");
  });
});
