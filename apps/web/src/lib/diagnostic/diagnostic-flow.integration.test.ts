import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

import { qualifyDiagnostic } from "./qualification";
import {
  createStripeDiagnosticSource,
  type StripeReadClient,
} from "./stripe-source";

const source = (path: string) =>
  readFileSync(join(process.cwd(), path), "utf8");

const webhookMocks = vi.hoisted(() => {
  const selectRows: unknown[][] = [];
  const inserts: Array<{ table: unknown; values: unknown }> = [];
  const constructEvent = vi.fn();
  const getStripeConnectionByAccountId = vi.fn();
  const sendAlertNotification = vi.fn();
  const select = vi.fn(() => {
    const query = {
      from: vi.fn(),
      where: vi.fn(),
    };
    query.from.mockReturnValue(query);
    query.where.mockImplementation(() => {
      const rows = selectRows.shift() ?? [];
      return Object.assign(Promise.resolve(rows), {
        limit: vi.fn(async () => rows),
      });
    });
    return query;
  });
  const insert = vi.fn((table: unknown) => ({
    values: vi.fn(async (values: unknown) => {
      inserts.push({ table, values });
    }),
  }));

  return {
    selectRows,
    inserts,
    constructEvent,
    getStripeConnectionByAccountId,
    sendAlertNotification,
    db: { select, insert },
  };
});

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => ({ options }),
}));
vi.mock("@dunlo-v2/db", () => ({ db: webhookMocks.db }));
vi.mock("@dunlo-v2/db/schema/domain", () => ({
  failedPayment: {
    id: "failed_payment_id",
    stripePaymentIntentId: "payment_intent_id",
  },
  recoveryAttempt: {
    failedPaymentId: "recovery_attempt_payment_id",
    status: "recovery_attempt_status",
  },
  recoverySequence: {
    userId: "sequence_user_id",
    failureCode: "sequence_failure_code",
    isActive: "sequence_active",
  },
  sequenceStep: { sequenceId: "step_sequence_id" },
  escalation: {},
}));
vi.mock("drizzle-orm", () => ({
  and: (...conditions: unknown[]) => conditions,
  eq: (...condition: unknown[]) => condition,
  inArray: (...condition: unknown[]) => condition,
}));
vi.mock("@/functions/stripe", () => ({
  getStripeConnectionByAccountId: webhookMocks.getStripeConnectionByAccountId,
}));
vi.mock("@/functions/escalations", () => ({
  generateEscalationDraft: vi.fn(),
}));
vi.mock("@/lib/stripe", () => ({
  getPlatformStripe: () => ({
    webhooks: { constructEvent: webhookMocks.constructEvent },
  }),
  getConnectedStripe: vi.fn(),
}));
vi.mock("@/lib/notifications", () => ({
  sendAlertNotification: webhookMocks.sendAlertNotification,
}));
vi.mock("@dunlo-v2/env/server", () => ({
  env: { STRIPE_WEBHOOK_SECRET: "whsec_fixture" },
}));

type SafetyFixture = {
  readonly userId: string;
  readonly connectionId: string;
  readonly stripeAccountId: string;
  readonly selectedSequenceIds: string[];
  readonly recoveryActivatedAt: Date;
  readonly recoveryAttempts: unknown[];
  readonly emails: unknown[];
  readonly escalations: unknown[];
  readonly portalSessions: unknown[];
  readonly writeSideStripeCalls: unknown[];
};

type WebhookRoute = {
  options: {
    server: {
      handlers: { POST(input: { request: Request }): Promise<Response> };
    };
  };
};

function createSafetyFixture(): SafetyFixture {
  return {
    userId: "user_fixture",
    connectionId: "conn_fixture",
    stripeAccountId: "acct_fixture",
    selectedSequenceIds: ["sequence_card_declined"],
    recoveryActivatedAt: new Date("2026-07-19T12:00:00.000Z"),
    recoveryAttempts: [],
    emails: [],
    escalations: [],
    portalSessions: [],
    writeSideStripeCalls: [],
  };
}

function createReadOnlyStripeFixture(): StripeReadClient {
  const invoices = vi.fn();
  invoices
    .mockResolvedValueOnce({
      data: [
        {
          id: "in_first",
          subscription: "sub_fixture",
          payment_intent: "pi_first",
          lines: { data: [] },
        },
      ],
      has_more: true,
    })
    .mockResolvedValueOnce({
      data: [
        {
          id: "in_second",
          subscription: "sub_fixture",
          payment_intent: "pi_second",
          lines: { data: [] },
        },
      ],
      has_more: false,
    });

  return {
    accounts: {
      retrieve: vi.fn().mockResolvedValue({
        id: "acct_fixture",
        country: "FR",
        default_currency: "usd",
        livemode: true,
      }),
    },
    subscriptions: {
      list: vi.fn().mockResolvedValue({ data: [], has_more: false }),
    },
    invoices: {
      list: invoices,
      listLineItems: vi.fn().mockResolvedValue({ data: [], has_more: false }),
    },
    paymentIntents: { retrieve: vi.fn() },
    charges: { retrieve: vi.fn() },
  };
}

function failedInvoiceEvent(created: number) {
  return {
    id: `evt_${created}`,
    type: "invoice.payment_failed",
    created,
    account: "acct_fixture",
    data: {
      object: {
        id: `in_${created}`,
        payment_intent: `pi_${created}`,
        customer: "cus_fixture",
        amount_due: 10_000,
        currency: "usd",
        customer_email: "owner@example.test",
      },
    },
  };
}

async function deliverFailure(route: WebhookRoute) {
  return route.options.server.handlers.POST({
    request: new Request("https://app.dunlo.test/api/stripe/webhook", {
      method: "POST",
      headers: { "stripe-signature": "signature" },
      body: "{}",
    }),
  });
}

describe("diagnostic-to-recovery safety flow", () => {
  it("keeps diagnostic, monitoring, and activation inert until confirmed recovery handles a future failure", async () => {
    const fixture = createSafetyFixture();
    webhookMocks.selectRows.length = 0;
    webhookMocks.inserts.length = 0;
    webhookMocks.constructEvent.mockReset();
    webhookMocks.getStripeConnectionByAccountId.mockReset();
    webhookMocks.sendAlertNotification.mockReset().mockResolvedValue(undefined);
    const stripe = createReadOnlyStripeFixture();
    const readOnlySource = createStripeDiagnosticSource(stripe);

    const firstPage = await readOnlySource.loadInvoices({
      start: 1_752_883_200,
      end: 1_753_142_400,
    });
    const secondPage = await readOnlySource.loadInvoices(
      { start: 1_752_883_200, end: 1_753_142_400 },
      firstPage.nextCursor ?? undefined,
    );
    const qualification = qualifyDiagnostic({
      coverageComplete: true,
      decisionWindowComplete: true,
      dominantCurrency: "usd",
      normalizedMrrUsd: 3_000_000,
      monthlyAddressableUsd: 30_000,
      addressableNowUsd: 30_000,
      fxRateToUsd: 1,
    });

    const connect = source("src/routes/api/stripe/connect.ts");
    const callback = source("src/routes/api/stripe/callback.ts");
    const diagnosticCallback = callback.slice(
      callback.indexOf('if (oauthState.intent === "diagnostic")'),
      callback.indexOf('if (\n            token.scope !== "read_write"'),
    );
    const activationCallback = callback.slice(
      callback.indexOf('if (\n            token.scope !== "read_write"'),
    );
    const monitoring = source("src/functions/diagnostic.ts");
    const confirmation = source("src/routes/api/stripe/recovery/confirm.ts");
    const webhook = source("src/routes/api/stripe/webhook.ts");

    expect(connect).toContain(
      'intent === "diagnostic" ? "read_only" : "read_write"',
    );
    expect(diagnosticCallback).toContain('scope: "read_only"');
    expect(diagnosticCallback).toContain('phase: "diagnosing"');
    expect(diagnosticCallback).toContain("triggerDiagnostic");
    expect(diagnosticCallback).not.toContain("reconcileWebhook");
    expect(diagnosticCallback).not.toContain("seedDefaultSequences");
    expect(firstPage).toMatchObject({ hasMore: true, nextCursor: "in_first" });
    expect(secondPage).toMatchObject({ hasMore: false, nextCursor: null });
    expect(stripe.invoices.list).toHaveBeenNthCalledWith(2, {
      limit: 100,
      created: { gte: 1_752_883_200, lte: 1_753_142_400 },
      expand: ["data.lines"],
      starting_after: "in_first",
    });
    expect(qualification).toMatchObject({
      verdict: "activation_recommended",
      qualificationBasis: "historical",
    });
    expect(monitoring).toContain('scope: "read_only"');
    expect(monitoring).toContain('phase: "monitoring"');
    expect(monitoring).not.toContain("setupWebhooks");

    expect(fixture.recoveryAttempts).toHaveLength(0);
    expect(fixture.emails).toHaveLength(0);
    expect(fixture.escalations).toHaveLength(0);
    expect(fixture.portalSessions).toHaveLength(0);
    expect(fixture.writeSideStripeCalls).toHaveLength(0);

    const { Route } = (await import("../../routes/api/stripe/webhook")) as {
      Route: WebhookRoute;
    };
    webhookMocks.getStripeConnectionByAccountId.mockResolvedValue({
      userId: fixture.userId,
      stripeAccountId: fixture.stripeAccountId,
      scope: "read_write",
      phase: "email_configured",
      recoveryActivatedAt: null,
      escalationThreshold: 50_000,
    });
    webhookMocks.constructEvent.mockReturnValue(
      failedInvoiceEvent(
        Math.floor(fixture.recoveryActivatedAt.getTime() / 1000) + 1,
      ),
    );
    await expect(deliverFailure(Route)).resolves.toMatchObject({ status: 200 });
    expect(webhookMocks.inserts).toEqual([]);
    expect(webhookMocks.sendAlertNotification).not.toHaveBeenCalled();

    expect(activationCallback).toContain('scope: "read_write"');
    expect(activationCallback).toContain("reconcileWebhook");
    expect(activationCallback).toContain(
      "seedDefaultSequences(session.user.id, { isActive: false })",
    );
    expect(confirmation).toContain("accepted: z.literal(true)");
    expect(confirmation).toContain("selectedSequenceIds");
    expect(confirmation).toContain("phase = 'email_configured'");
    expect(confirmation).toContain("phase = 'recovery_active'");
    expect(confirmation).toContain("recovery_activated_at = NOW()");

    expect(webhook).toContain('connection.phase !== "recovery_active"');
    expect(webhook).toContain("!connection.recoveryActivatedAt");
    expect(webhook).toContain(
      "event.created * 1000 < connection.recoveryActivatedAt.getTime()",
    );
    expect(webhook).toContain("eq(recoverySequence.isActive, true)");
    webhookMocks.getStripeConnectionByAccountId.mockResolvedValue({
      userId: fixture.userId,
      stripeAccountId: fixture.stripeAccountId,
      scope: "read_write",
      phase: "recovery_active",
      recoveryActivatedAt: fixture.recoveryActivatedAt,
      escalationThreshold: 50_000,
    });
    webhookMocks.constructEvent.mockReturnValue(
      failedInvoiceEvent(
        Math.floor(fixture.recoveryActivatedAt.getTime() / 1000) - 1,
      ),
    );
    await deliverFailure(Route);
    expect(webhookMocks.inserts).toEqual([]);

    webhookMocks.selectRows.push(
      [],
      [{ id: fixture.selectedSequenceIds[0] }],
      [{ id: "step_selected", stepNumber: 1, delayHours: 0 }],
    );
    webhookMocks.constructEvent.mockReturnValue(
      failedInvoiceEvent(
        Math.floor(fixture.recoveryActivatedAt.getTime() / 1000) + 1,
      ),
    );
    await expect(deliverFailure(Route)).resolves.toMatchObject({ status: 200 });
    expect(webhookMocks.inserts).toEqual([
      expect.objectContaining({
        table: expect.objectContaining({ id: "failed_payment_id" }),
      }),
      expect.objectContaining({
        table: expect.objectContaining({
          failedPaymentId: "recovery_attempt_payment_id",
        }),
        values: expect.objectContaining({
          sequenceStepId: "step_selected",
          status: "scheduled",
        }),
      }),
    ]);
    expect(fixture.selectedSequenceIds).toEqual(["sequence_card_declined"]);
  });
});
