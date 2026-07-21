// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MonitoringConsent } from "./monitoring-consent";

afterEach(cleanup);

describe("MonitoringConsent", () => {
  it("keeps retry available and explicitly says nothing was enabled", () => {
    const onConfirm = vi.fn();
    render(<MonitoringConsent onConfirm={onConfirm} status="unavailable" />);

    const retry = screen.getByRole("button", {
      name: /try read-only monitoring again/i,
    });
    expect(retry.hasAttribute("disabled")).toBe(false);
    fireEvent.click(retry);
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(screen.getByRole("status").textContent).toMatch(
      /nothing was enabled/i,
    );
  });

  it("confirms when read-only monitoring is enabled", () => {
    render(<MonitoringConsent onConfirm={vi.fn()} status="enabled" />);

    expect(screen.getByText(/read-only monitoring is enabled/i)).toBeTruthy();
  });
});
