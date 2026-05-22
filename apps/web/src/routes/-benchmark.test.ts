import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const routeSource = readFileSync(
  join(process.cwd(), "src/routes/benchmark.tsx"),
  "utf8",
);

describe("benchmark page copy", () => {
  it("frames failed payments as founder pain with concise page sections", () => {
    expect(routeSource).toContain(
      "Every failed payment is revenue you already earned.",
    );
    expect(routeSource).toContain("The founder pain");
    expect(routeSource).not.toContain("Recovery playbook");
    expect(routeSource).not.toContain("What each code means for your recovery");
  });
});
