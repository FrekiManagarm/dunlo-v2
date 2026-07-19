import { describe, expect, it, vi, type Mock } from "vitest";

import {
  createStripeDiagnosticSource,
  type StripeDiagnosticSource,
  type StripeReadClient,
} from "./stripe-source";

type FakeStripeClient = StripeReadClient & {
  accounts: { retrieve: Mock };
  subscriptions: { list: Mock };
  invoices: { list: Mock; listLineItems: Mock };
  paymentIntents: { retrieve: Mock };
  charges: { retrieve: Mock };
};

function rateLimitError(): Error & { statusCode: number } {
  return Object.assign(new Error("Too many requests"), { statusCode: 429 });
}

function createFakeStripeClient(
  overrides: Partial<StripeReadClient> = {},
): FakeStripeClient {
  return {
    accounts: {
      retrieve: vi.fn().mockResolvedValue({ id: "acct_test", livemode: false }),
    },
    subscriptions: {
      list: vi.fn().mockResolvedValue({ data: [], has_more: false }),
    },
    invoices: {
      list: vi.fn().mockResolvedValue({ data: [], has_more: false }),
      listLineItems: vi.fn().mockResolvedValue({ data: [], has_more: false }),
    },
    paymentIntents: {
      retrieve: vi.fn(),
    },
    charges: {
      retrieve: vi.fn(),
    },
    ...overrides,
  } as FakeStripeClient;
}

const window = { start: 1_700_000_000, end: 1_731_536_000 };

async function loadAllInvoices(
  source: StripeDiagnosticSource,
): Promise<Awaited<ReturnType<StripeDiagnosticSource["loadInvoices"]>>> {
  let cursor: string | undefined;
  let page = await source.loadInvoices(window, cursor);

  while (page.hasMore) {
    cursor = page.nextCursor ?? undefined;
    page = await source.loadInvoices(window, cursor);
  }

  return page;
}

describe("createStripeDiagnosticSource", () => {
  it("continues 12-month invoice pagination through the final Stripe page", async () => {
    const client = createFakeStripeClient();
    client.invoices.list
      .mockResolvedValueOnce({
        data: [{ id: "in_1", subscription: "sub_1", lines: { data: [] } }],
        has_more: true,
      })
      .mockResolvedValueOnce({
        data: [{ id: "in_2", subscription: "sub_1", lines: { data: [] } }],
        has_more: true,
      })
      .mockResolvedValueOnce({
        data: [{ id: "in_3", subscription: "sub_1", lines: { data: [] } }],
        has_more: false,
      });
    const source = createStripeDiagnosticSource(client);

    const finalPage = await loadAllInvoices(source);

    expect(client.invoices.list).toHaveBeenCalledTimes(3);
    expect(client.invoices.list).toHaveBeenNthCalledWith(1, {
      limit: 100,
      created: { gte: window.start, lte: window.end },
      expand: ["data.lines"],
    });
    expect(client.invoices.list).toHaveBeenNthCalledWith(2, {
      limit: 100,
      created: { gte: window.start, lte: window.end },
      expand: ["data.lines"],
      starting_after: "in_1",
    });
    expect(finalPage).toMatchObject({
      hasMore: false,
      nextCursor: null,
      coverage: { status: "complete", pageCount: 1, recordCount: 1 },
    });
  });

  it("loads active and past-due subscriptions with the supplied cursor", async () => {
    const client = createFakeStripeClient();
    client.subscriptions.list.mockResolvedValue({
      data: [
        { id: "sub_active", status: "active", livemode: false },
        { id: "sub_past_due", status: "past_due", livemode: false },
      ],
      has_more: false,
    });
    const source = createStripeDiagnosticSource(client);

    const page = await source.loadSubscriptions("sub_previous");

    expect(client.subscriptions.list).toHaveBeenCalledWith({
      limit: 100,
      status: "all",
      expand: ["data.items.data.price"],
      starting_after: "sub_previous",
    });
    expect(page.data.map((subscription) => subscription.status)).toEqual([
      "active",
      "past_due",
    ]);
    expect(page.coverage).toMatchObject({ pageCount: 1, recordCount: 2 });
  });

  it("loads every unexpanded invoice line page without truncation", async () => {
    const client = createFakeStripeClient();
    client.invoices.list.mockResolvedValue({
      data: [
        {
          id: "in_lines",
          subscription: "sub_1",
          lines: {
            data: [{ id: "il_1" }],
            has_more: true,
          },
        },
      ],
      has_more: false,
    });
    client.invoices.listLineItems
      .mockResolvedValueOnce({ data: [{ id: "il_2" }], has_more: true })
      .mockResolvedValueOnce({ data: [{ id: "il_3" }], has_more: false });
    const source = createStripeDiagnosticSource(client);

    const page = await source.loadInvoices(window);

    expect(client.invoices.listLineItems).toHaveBeenNthCalledWith(
      1,
      "in_lines",
      {
        limit: 100,
        starting_after: "il_1",
      },
    );
    expect(client.invoices.listLineItems).toHaveBeenNthCalledWith(
      2,
      "in_lines",
      {
        limit: 100,
        starting_after: "il_2",
      },
    );
    expect(page.data[0]?.lines.map((line) => line.id)).toEqual([
      "il_1",
      "il_2",
      "il_3",
    ]);
    expect(page.coverage).toMatchObject({ pageCount: 3, recordCount: 4 });
  });

  it("loads PaymentIntent and charge evidence only for included subscription invoices", async () => {
    const client = createFakeStripeClient();
    client.invoices.list.mockResolvedValue({
      data: [
        {
          id: "in_recurring",
          subscription: "sub_1",
          payment_intent: "pi_recurring",
          lines: { data: [] },
        },
        {
          id: "in_one_off",
          subscription: null,
          payment_intent: "pi_one_off",
          lines: { data: [] },
        },
      ],
      has_more: false,
    });
    client.paymentIntents.retrieve.mockResolvedValue({
      id: "pi_recurring",
      latest_charge: "ch_recurring",
      livemode: false,
      last_payment_error: {
        advice_code: "update_payment_method",
        decline_code: "issuer_not_available",
      },
    });
    client.charges.retrieve.mockResolvedValue({
      id: "ch_recurring",
      failure_code: "charge_failure",
      advice_code: "charge_advice",
      network_decline_code: "charge_decline",
      livemode: false,
    });
    const source = createStripeDiagnosticSource(client);

    await source.loadInvoices(window);
    const evidence = await source.loadPaymentEvidence([
      "in_recurring",
      "in_one_off",
    ]);

    expect(client.paymentIntents.retrieve).toHaveBeenCalledTimes(1);
    expect(client.paymentIntents.retrieve).toHaveBeenCalledWith("pi_recurring");
    expect(client.charges.retrieve).toHaveBeenCalledWith("ch_recurring");
    expect(evidence).toEqual([
      expect.objectContaining({
        invoiceId: "in_recurring",
        paymentIntentId: "pi_recurring",
        chargeId: "ch_recurring",
        adviceCode: "update_payment_method",
        declineCode: "issuer_not_available",
        errorCode: "charge_failure",
      }),
    ]);
  });

  it("retries 429 responses with bounded exponential backoff", async () => {
    const sleep = vi.fn().mockResolvedValue(undefined);
    const client = createFakeStripeClient();
    client.subscriptions.list
      .mockRejectedValueOnce(rateLimitError())
      .mockRejectedValueOnce(rateLimitError())
      .mockResolvedValueOnce({ data: [], has_more: false });
    const source = createStripeDiagnosticSource(client, {
      retry: { maxAttempts: 3, baseDelayMs: 10, maxDelayMs: 15 },
      sleep,
    });

    const page = await source.loadSubscriptions();

    expect(page.coverage.status).toBe("complete");
    expect(client.subscriptions.list).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalledWith(10);
    expect(sleep).toHaveBeenCalledWith(15);
  });

  it("returns partial coverage and a resumable cursor after exhausted rate-limit retries", async () => {
    const sleep = vi.fn().mockResolvedValue(undefined);
    const client = createFakeStripeClient();
    client.invoices.list.mockRejectedValue(rateLimitError());
    const source = createStripeDiagnosticSource(client, {
      retry: { maxAttempts: 2, baseDelayMs: 1, maxDelayMs: 2 },
      sleep,
    });

    const page = await source.loadInvoices(window, "in_completed");

    expect(client.invoices.list).toHaveBeenCalledTimes(2);
    expect(page).toEqual({
      data: [],
      hasMore: false,
      nextCursor: "in_completed",
      coverage: {
        status: "partial",
        pageCount: 0,
        recordCount: 0,
        failure: {
          code: "stripe_rate_limited",
          cursor: "in_completed",
        },
      },
    });
  });

  it("exposes only read-only diagnostic methods", () => {
    const source = createStripeDiagnosticSource(createFakeStripeClient());
    const exportedMethods: Array<keyof StripeDiagnosticSource> = [
      "loadAccount",
      "loadSubscriptions",
      "loadInvoices",
      "loadPaymentEvidence",
    ];

    expect(Object.keys(source).sort()).toEqual(exportedMethods.sort());
  });

  it("retains Stripe test and live mode independently in account evidence", async () => {
    const testSource = createStripeDiagnosticSource(
      createFakeStripeClient({
        accounts: {
          retrieve: vi
            .fn()
            .mockResolvedValue({ id: "acct_test", livemode: false }),
        },
      }),
    );
    const liveSource = createStripeDiagnosticSource(
      createFakeStripeClient({
        accounts: {
          retrieve: vi
            .fn()
            .mockResolvedValue({ id: "acct_live", livemode: true }),
        },
      }),
    );

    await expect(testSource.loadAccount()).resolves.toMatchObject({
      id: "acct_test",
      mode: "test",
    });
    await expect(liveSource.loadAccount()).resolves.toMatchObject({
      id: "acct_live",
      mode: "live",
    });
  });
});
