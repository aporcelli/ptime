import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const structureSource = readFileSync(join(root, "components/ui/structure.tsx"), "utf8");
const globalsSource = readFileSync(join(root, "app/globals.css"), "utf8");
const tailwindSource = readFileSync(join(root, "tailwind.config.ts"), "utf8");

describe("structural UI accessibility and token guards", () => {
  it("uses defined semantic token classes and keeps legacy aliases mapped", () => {
    expect(tailwindSource).toContain('fixed:      "hsl(var(--primary))"');
    expect(tailwindSource).toContain('heading: "hsl(var(--text-heading))"');
    expect(tailwindSource).toContain('sub:     "hsl(var(--text-sub))"');
    expect(globalsSource).toContain(".text-primary-fixed");
    expect(globalsSource).toContain(".text-heading");
    expect(globalsSource).toContain(".text-sub");
  });

  it("structural primitives include semantic landmarks, focus/contrast/touch, and reduced-motion-safe classes", () => {
    expect(structureSource).toContain("<main");
    expect(structureSource).toContain("<section");
    expect(structureSource).toContain("text-foreground");
    expect(structureSource).toContain("text-muted-foreground");
    expect(structureSource).toContain("h-11 w-11");
    expect(structureSource).toContain("motion-reduce:hover:translate-y-0");
    expect(structureSource).toContain("transition-colors");
  });
});
