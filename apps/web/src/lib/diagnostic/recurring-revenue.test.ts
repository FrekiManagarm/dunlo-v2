import { describe, expect, it } from "vitest";

import {
  normalizeRecurringRevenue,
  type RecurringRevenueInput,
} from "./recurring-revenue";

const baseInput = (
  overrides: Partial<RecurringRevenueInput> = {},
): RecurringRevenueInput => ({
  subscriptions: [],
  ...overrides,
});

describe("normalizeRecurringRevenue", () => {
  it.each([
    {
      name: "keeps a monthly fixed recurring amount",
      input: baseInput({
        subscriptions: [
          {
            id: "sub_monthly",
            status: "active",
            lines: [
              {
                amount: 4900,
                currency: "usd",
                kind: "recurring",
                pricing: "fixed",
                interval: "month",
                intervalCount: 1,
              },
            ],
            finalizedInvoices: [],
          },
        ],
      }),
      expected: { fixedMrr: { usd: 4900 } },
    },
    {
      name: "normalizes annual fixed recurring amounts",
      input: baseInput({
        subscriptions: [
          {
            id: "sub_annual",
            status: "active",
            lines: [
              {
                amount: 120000,
                currency: "usd",
                kind: "recurring",
                pricing: "fixed",
                interval: "year",
                intervalCount: 1,
              },
            ],
            finalizedInvoices: [],
          },
        ],
      }),
      expected: { fixedMrr: { usd: 10000 } },
    },
    {
      name: "normalizes quarterly fixed recurring amounts",
      input: baseInput({
        subscriptions: [
          {
            id: "sub_quarterly",
            status: "past_due",
            lines: [
              {
                amount: 30000,
                currency: "usd",
                kind: "recurring",
                pricing: "fixed",
                interval: "month",
                intervalCount: 3,
              },
            ],
            finalizedInvoices: [],
          },
        ],
      }),
      expected: { fixedMrr: { usd: 10000 } },
    },
    {
      name: "applies line discounts before fixed revenue classification",
      input: baseInput({
        subscriptions: [
          {
            id: "sub_discounted",
            status: "active",
            lines: [
              {
                amount: 6000,
                discountAmount: 1100,
                currency: "usd",
                kind: "recurring",
                pricing: "fixed",
                interval: "month",
                intervalCount: 1,
              },
            ],
            finalizedInvoices: [],
          },
        ],
      }),
      expected: { fixedMrr: { usd: 4900 } },
    },
    {
      name: "keeps canceled subscriptions out of current MRR",
      input: baseInput({
        subscriptions: [
          {
            id: "sub_canceled",
            status: "canceled",
            lines: [
              {
                amount: 6000,
                discountAmount: 1100,
                currency: "usd",
                kind: "recurring",
                pricing: "fixed",
                interval: "month",
                intervalCount: 1,
              },
            ],
            finalizedInvoices: [],
          },
        ],
      }),
      expected: { excludedMrr: { usd: 4900 } },
    },
    {
      name: "keeps incomplete expired subscriptions out of current MRR",
      input: baseInput({
        subscriptions: [
          {
            id: "sub_incomplete_expired",
            status: "incomplete_expired",
            lines: [
              {
                amount: 4900,
                currency: "usd",
                kind: "recurring",
                pricing: "fixed",
                interval: "month",
                intervalCount: 1,
              },
            ],
            finalizedInvoices: [],
          },
        ],
      }),
      expected: { excludedMrr: { usd: 4900 } },
    },
    {
      name: "excludes one-off, tax, credit, and refund lines",
      input: baseInput({
        subscriptions: [
          {
            id: "sub_exclusions",
            status: "active",
            lines: [
              {
                amount: 4000,
                currency: "usd",
                kind: "one_off",
                pricing: "fixed",
                interval: "month",
                intervalCount: 1,
              },
              {
                amount: 300,
                currency: "usd",
                kind: "tax",
                pricing: "fixed",
                interval: "month",
                intervalCount: 1,
              },
              {
                amount: 200,
                currency: "usd",
                kind: "credit",
                pricing: "fixed",
                interval: "month",
                intervalCount: 1,
              },
              {
                amount: 100,
                currency: "usd",
                kind: "refund",
                pricing: "fixed",
                interval: "month",
                intervalCount: 1,
              },
            ],
            finalizedInvoices: [],
          },
        ],
      }),
      expected: {
        fixedMrr: {},
        variableMrr: {},
        limitedConfidenceMrr: {},
        excludedMrr: {},
      },
    },
  ])("$name", ({ input, expected }) => {
    expect(normalizeRecurringRevenue(input)).toMatchObject(expected);
  });

  it.each([
    {
      name: "uses the average of three finalized metered invoices",
      invoices: [9000, 12000, 15000],
      expected: {
        variableMrr: { usd: 12000 },
        limitedConfidenceMrr: {},
      },
    },
    {
      name: "marks an average of two finalized metered invoices as limited confidence",
      invoices: [9000, 15000],
      expected: {
        variableMrr: { usd: 12000 },
        limitedConfidenceMrr: { usd: 12000 },
      },
    },
    {
      name: "marks a single finalized metered invoice as limited confidence",
      invoices: [9000],
      expected: {
        variableMrr: { usd: 9000 },
        limitedConfidenceMrr: { usd: 9000 },
      },
    },
  ])("$name", ({ invoices, expected }) => {
    const input = baseInput({
      subscriptions: [
        {
          id: "sub_metered",
          status: "active",
          lines: [
            {
              amount: 0,
              currency: "usd",
              kind: "recurring",
              pricing: "metered",
              interval: "month",
              intervalCount: 1,
            },
          ],
          finalizedInvoices: invoices.map((amount, index) => ({
            id: `in_${index}`,
            finalizedAt: `2026-01-0${index + 1}T00:00:00.000Z`,
            status: "paid",
            lines: [
              {
                amount,
                currency: "usd",
                kind: "recurring",
                pricing: "metered",
                interval: "month",
                intervalCount: 1,
              },
            ],
          })),
        },
      ],
    });

    expect(normalizeRecurringRevenue(input)).toMatchObject(expected);
  });

  it("ignores newer non-metered invoices when selecting variable history", () => {
    const meteredLine = (amount: number) => ({
      amount,
      currency: "usd",
      kind: "recurring" as const,
      pricing: "metered" as const,
      interval: "month" as const,
      intervalCount: 1,
    });
    const oneOffLine = (amount: number) => ({
      amount,
      currency: "usd",
      kind: "one_off" as const,
      pricing: "fixed" as const,
      interval: "month" as const,
      intervalCount: 1,
    });
    const input = baseInput({
      subscriptions: [
        {
          id: "sub_metered_history",
          status: "active",
          lines: [meteredLine(0)],
          finalizedInvoices: [
            {
              id: "in_1",
              finalizedAt: "2026-01-01T00:00:00.000Z",
              status: "paid",
              lines: [meteredLine(9000)],
            },
            {
              id: "in_2",
              finalizedAt: "2026-02-01T00:00:00.000Z",
              status: "paid",
              lines: [meteredLine(12000)],
            },
            {
              id: "in_3",
              finalizedAt: "2026-03-01T00:00:00.000Z",
              status: "paid",
              lines: [meteredLine(15000)],
            },
            {
              id: "in_4",
              finalizedAt: "2026-04-01T00:00:00.000Z",
              status: "paid",
              lines: [oneOffLine(1000)],
            },
            {
              id: "in_5",
              finalizedAt: "2026-05-01T00:00:00.000Z",
              status: "paid",
              lines: [oneOffLine(1000)],
            },
          ],
        },
      ],
    });

    expect(normalizeRecurringRevenue(input)).toMatchObject({
      variableMrr: { usd: 12000 },
      limitedConfidenceMrr: {},
    });
  });

  it("does not mutate the adapter input", () => {
    const input = baseInput({
      subscriptions: [
        {
          id: "sub_immutable",
          status: "active",
          lines: [
            {
              amount: 6000,
              discountAmount: 1100,
              currency: "USD",
              kind: "recurring",
              pricing: "fixed",
              interval: "month",
              intervalCount: 1,
            },
          ],
          finalizedInvoices: [],
        },
      ],
    });
    const before = structuredClone(input);

    expect(normalizeRecurringRevenue(input)).toMatchObject({
      fixedMrr: { usd: 4900 },
    });
    expect(input).toEqual(before);
  });
});
