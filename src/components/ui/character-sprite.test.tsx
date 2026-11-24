import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { CharacterSprite } from "./character-sprite";
import { REGIONAL_BACKGROUNDS } from "@/components/theme/background-context";

describe("CharacterSprite component", () => {
  it("renders an image for supported sprite characters", () => {
    render(<CharacterSprite characterId="furina" alt="Furina Sprite" />);
    const img = screen.getByAltText("Furina Sprite");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/images/sprites/furina.png");
  });

  it("handles case-insensitive character ids", () => {
    render(<CharacterSprite characterId="Zhongli" alt="Zhongli Sprite" />);
    const img = screen.getByAltText("Zhongli Sprite");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/images/sprites/zhongli.png");
  });

  it("returns null gracefully for unknown character sprite", () => {
    const { container } = render(<CharacterSprite characterId="unknown-character-123" />);
    expect(container.firstChild).toBeNull();
  });
});

describe("Regional Background Options", () => {
  it("includes Mondstadt and Inazuma regional background definitions", () => {
    const ids = REGIONAL_BACKGROUNDS.map((b) => b.id);
    expect(ids).toContain("mondstadt");
    expect(ids).toContain("inazuma");
  });

  it("has valid image filepaths for each region", () => {
    REGIONAL_BACKGROUNDS.forEach((b) => {
      expect(b.image).toMatch(/^\/images\/backgrounds\/.+\.(jpg|png)$/);
    });
  });
});
