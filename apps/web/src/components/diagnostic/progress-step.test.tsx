// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ProgressStep } from "./progress-step";

afterEach(cleanup);

describe("ProgressStep", () => {
  it("announces persisted checkpoints without inventing a percentage", () => {
    const { container } = render(
      <ProgressStep
        checkpoints={["account_loaded", "invoices_loaded"]}
        errorCategory={null}
      />,
    );

    expect(screen.getByRole("status").textContent).toContain(
      "Analyzing your Stripe account",
    );
    expect(screen.getByText(/Completed: Stripe account loaded/)).toBeTruthy();
    expect(container.textContent).not.toMatch(/\d+%/);
  });
});
