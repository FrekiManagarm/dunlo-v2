import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export const OPENAI_ESCALATION_MODEL = "gpt-4.1-mini";

type EscalationEmailInput = {
  customerName: string;
  formattedAmount: string;
  productName: string;
  failureReason: string;
};

export async function generateEscalationEmailBody({
  customerName,
  formattedAmount,
  productName,
  failureReason,
}: EscalationEmailInput): Promise<string> {
  const { text } = await generateText({
    model: openai(OPENAI_ESCALATION_MODEL),
    maxOutputTokens: 400,
    system:
      "You are writing a short, personal email from a SaaS founder to a customer whose payment failed. The email should feel human, not automated. 2-3 sentences max. No subject line needed.",
    prompt:
      `Customer: ${customerName}. ` +
      `Monthly value: ${formattedAmount}. ` +
      `Product: ${productName}. ` +
      `Failure: ${failureReason}. ` +
      `Write the email body only.`,
  });

  return text.trim();
}
