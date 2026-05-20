import { describe, expect, it, vi } from "vitest";

const generateTextMock = vi.fn();
const openaiMock = vi.fn((model: string) => ({ provider: "openai", model }));

vi.mock("ai", () => ({
  generateText: generateTextMock,
}));

vi.mock("@ai-sdk/openai", () => ({
  openai: openaiMock,
}));

describe("generateEscalationEmailBody", () => {
  it("generates a short escalation email with the Vercel AI SDK OpenAI provider", async () => {
    generateTextMock.mockResolvedValueOnce({
      text: "  Hi Alice, I noticed the latest Acme Pro payment did not go through. Happy to help if anything is blocking renewal.  ",
    });

    const { generateEscalationEmailBody, OPENAI_ESCALATION_MODEL } =
      await import("./escalation-ai");

    const body = await generateEscalationEmailBody({
      customerName: "Alice",
      formattedAmount: "EUR 89.00",
      productName: "Acme Pro",
      failureReason: "Card declined",
    });

    expect(openaiMock).toHaveBeenCalledWith(OPENAI_ESCALATION_MODEL);
    expect(generateTextMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: { provider: "openai", model: OPENAI_ESCALATION_MODEL },
        system: expect.stringContaining("SaaS founder"),
        prompt: expect.stringContaining("Customer: Alice."),
        maxOutputTokens: 400,
      }),
    );
    expect(body).toBe(
      "Hi Alice, I noticed the latest Acme Pro payment did not go through. Happy to help if anything is blocking renewal.",
    );
  });
});
