import { describe, expect, it } from "vitest";
import { buildAlertMessage } from "./notifications";

describe("buildAlertMessage", () => {
  it("returns correct label for failure event", () => {
    const { label } = buildAlertMessage("failure", "John Doe", "j@x.com", 5000, "eur");
    expect(label).toBe("New failed payment");
  });

  it("returns correct label for recovery event", () => {
    const { label } = buildAlertMessage("recovery", null, "j@x.com", 2000, "usd");
    expect(label).toBe("Payment recovered");
  });

  it("returns correct label for escalation event", () => {
    const { label } = buildAlertMessage("escalation", "Alice", "a@x.com", 15000, "eur");
    expect(label).toBe("Escalation triggered");
  });

  it("returns correct label for emailSent event", () => {
    const { label } = buildAlertMessage("emailSent", "Bob", "b@x.com", 3000, "gbp");
    expect(label).toBe("Recovery email sent");
  });

  it("uses email as customer display when name is null", () => {
    const { message } = buildAlertMessage("recovery", null, "jane@example.com", 2000, "eur");
    expect(message).toContain("jane@example.com");
    expect(message).not.toContain("null");
  });

  it("includes formatted amount in the message", () => {
    const { message } = buildAlertMessage("failure", "John", "j@x.com", 10000, "eur");
    expect(message).toContain("€100.00");
  });

  it("subject includes the event label", () => {
    const { subject, label } = buildAlertMessage("escalation", "Alice", "a@x.com", 5000, "eur");
    expect(subject).toContain(label);
  });
});
