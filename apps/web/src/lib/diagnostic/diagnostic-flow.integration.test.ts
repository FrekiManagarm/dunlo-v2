import { describe, expect, it, vi } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";

import { qualifyDiagnostic } from "./qualification";
import {
  createStripeDiagnosticSource,
  type StripeReadClient,
} from "./stripe-source";

const webhookMocks = vi.hoisted(() => {
  const selectRows: unknown[][] = [];
  const inserts: Array<{ table: unknown; values: unknown }> = [];
  const updates: unknown[] = [];
  let fixture: any;
  const constructEvent = vi.fn();
  const getStripeConnectionByAccountId = vi.fn();
  const getStripeConnectionById = vi.fn();
  const reconcileWebhook = vi.fn();
  const triggerDiagnostic = vi.fn();
  const seedDefaultSequences = vi.fn();
  const sendAlertNotification = vi.fn();
  const generateEscalationDraft = vi.fn();
  const getConnectedStripe = vi.fn();
  const execute = vi.fn();
  const authSession = vi.fn();
  const select = vi.fn(() => {
    const nextRows = () => selectRows.shift() ?? [];
    const query = {
      from: vi.fn(),
      innerJoin: vi.fn(),
      where: vi.fn(),
      orderBy: vi.fn(),
      limit: vi.fn(),
      then: undefined as unknown,
    };
    query.from.mockReturnValue(query);
    query.innerJoin.mockReturnValue(query);
    query.where.mockReturnValue(query);
    query.orderBy.mockReturnValue(query);
    query.limit.mockImplementation(async () => nextRows());
    query.then = (onfulfilled: (rows: unknown[]) => unknown) =>
      Promise.resolve(nextRows()).then(onfulfilled);
    return query;
  });
  const insert = vi.fn((table: unknown) => ({
    values: vi.fn(async (values: unknown) => {
      inserts.push({ table, values });
      if (!fixture) return;
      if (
        typeof values === "object" &&
        values !== null &&
        "failedPaymentId" in values
      ) {
        fixture.recoveryAttempts.push(values);
      } else if (
        typeof values === "object" &&
        values !== null &&
        "stripePaymentIntentId" in values
      ) {
        fixture.failedPayments.push(values);
      } else if (
        typeof values === "object" &&
        values !== null &&
        "draftSubject" in values
      ) {
        fixture.escalations.push(values);
      }
    }),
  }));
  const update = vi.fn(() => {
    const query = {
      set: vi.fn(),
      where: vi.fn(),
      returning: vi.fn(),
      then: undefined as unknown,
    };
    query.set.mockImplementation((values: unknown) => {
      updates.push(values);
      if (
        fixture &&
        typeof values === "object" &&
        values !== null &&
        ("phase" in values || "scope" in values)
      ) {
        Object.assign(fixture.connection, values);
      }
      return query;
    });
    query.where.mockReturnValue(query);
    query.returning.mockImplementation(async () => {
      if (
        fixture &&
        updates.at(-1) &&
        typeof updates.at(-1) === "object" &&
        updates.at(-1) !== null &&
        "monitoringEnabled" in updates.at(-1) &&
        (!fixture.hasReadySnapshot ||
          fixture.connection.scope !== "read_only" ||
          fixture.connection.phase !== "monitoring")
      ) {
        return [];
      }
      return [{ id: "conn_fixture" }];
    });
    query.then = (onfulfilled: () => unknown) =>
      Promise.resolve(undefined).then(onfulfilled);
    return query;
  });

  return {
    selectRows,
    inserts,
    updates,
    constructEvent,
    getStripeConnectionByAccountId,
    getStripeConnectionById,
    reconcileWebhook,
    triggerDiagnostic,
    seedDefaultSequences,
    sendAlertNotification,
    generateEscalationDraft,
    getConnectedStripe,
    execute,
    authSession,
    setFixture: (nextFixture: unknown) => {
      fixture = nextFixture;
    },
    db: { select, insert, update, execute },
  };
});

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => ({ options }),
}));
vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => {
    const builder = {
      middleware: () => builder,
      inputValidator: () => builder,
      handler: (handler: unknown) => handler,
    };
    return builder;
  },
  createMiddleware: () => ({ server: () => ({}) }),
}));
vi.mock("@dunlo-v2/db", () => ({ db: webhookMocks.db }));
vi.mock("@dunlo-v2/auth", () => ({
  auth: { api: { getSession: webhookMocks.authSession } },
}));
vi.mock("@dunlo-v2/db/encrypt", () => ({ encrypt: (value: string) => value }));
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
  stripeConnection: {
    id: "connection_id",
    userId: "connection_user_id",
    stripeAccountId: "connection_account_id",
    phase: "connection_phase",
  },
  diagnosticSnapshot: {
    id: "snapshot_id",
    connectionId: "snapshot_connection_id",
    isCurrent: "snapshot_current",
    verdict: "snapshot_verdict",
  },
  emailProvider: { userId: "email_provider_user_id" },
}));
vi.mock("drizzle-orm", async () => {
  const actual =
    await vi.importActual<typeof import("drizzle-orm")>("drizzle-orm");
  return {
    ...actual,
    and: (...conditions: unknown[]) => conditions,
    eq: (...condition: unknown[]) => condition,
    inArray: (...condition: unknown[]) => condition,
  };
});
vi.mock("@/functions/stripe", () => ({
  getStripeConnectionByAccountId: webhookMocks.getStripeConnectionByAccountId,
  getStripeConnectionById: webhookMocks.getStripeConnectionById,
  seedDefaultSequences: webhookMocks.seedDefaultSequences,
}));
vi.mock("@/lib/stripe-webhooks", () => ({
  reconcileWebhook: webhookMocks.reconcileWebhook,
}));
vi.mock("@/functions/escalations", () => ({
  generateEscalationDraft: webhookMocks.generateEscalationDraft,
}));
vi.mock("@/lib/stripe", () => ({
  getPlatformStripe: () => ({
    webhooks: { constructEvent: webhookMocks.constructEvent },
  }),
  getConnectedStripe: webhookMocks.getConnectedStripe,
}));
vi.mock("@/lib/notifications", () => ({
  sendAlertNotification: webhookMocks.sendAlertNotification,
}));
vi.mock("@dunlo-v2/env/server", () => ({
  env: {
    STRIPE_WEBHOOK_SECRET: "whsec_fixture",
    BETTER_AUTH_SECRET: "a-test-secret-that-is-long-enough-for-hmac-signing",
    NODE_ENV: "test",
    STRIPE_SECRET_KEY: "sk_fixture",
  },
}));
vi.mock("@/trigger/run-diagnostic", () => ({
  triggerDiagnostic: webhookMocks.triggerDiagnostic,
}));
vi.mock("@/middleware/auth", () => ({ authMiddleware: {} }));
vi.mock("@/lib/email-providers", () => ({
  EMAIL_PROVIDERS: ["postmark", "resend", "mailgun", "sendgrid"],
  sendUserEmail: vi.fn(),
}));
vi.mock("@/lib/email-wrapper", () => ({ wrapEmail: (value: string) => value }));
vi.mock(
  "@/lib/stripe-oauth-state",
  async () => import("../../lib/stripe-oauth-state"),
);

type SafetyFixture = {
  readonly userId: string;
  readonly connectionId: string;
  readonly stripeAccountId: string;
  readonly selectedSequenceIds: string[];
  readonly recoveryActivatedAt: Date;
  readonly hasReadySnapshot: boolean;
  readonly failedPayments: unknown[];
  readonly recoveryAttempts: unknown[];
  readonly emails: unknown[];
  readonly escalations: unknown[];
  readonly portalSessions: unknown[];
  readonly writeSideStripeCalls: unknown[];
  readonly sequences: Array<{ id: string; isActive: boolean }>;
  readonly confirmationQueries: Array<{ sql: string; params: unknown[] }>;
  connection: {
    userId: string;
    stripeAccountId: string;
    scope: "read_only" | "read_write";
    phase:
      | "diagnosing"
      | "monitoring"
      | "write_authorized"
      | "email_configured"
      | "recovery_active";
    recoveryActivatedAt: Date | null;
    escalationThreshold: number | null;
  };
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
    hasReadySnapshot: true,
    failedPayments: [],
    recoveryAttempts: [],
    emails: [],
    escalations: [],
    portalSessions: [],
    writeSideStripeCalls: [],
    sequences: [
      { id: "sequence_card_declined", isActive: false },
      { id: "sequence_expired_card", isActive: false },
    ],
    confirmationQueries: [],
    connection: {
      userId: "user_fixture",
      stripeAccountId: "acct_fixture",
      scope: "read_only",
      phase: "diagnostic_ready",
      recoveryActivatedAt: null,
      escalationThreshold: 50_000,
    },
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

function oauthToken(scope: "read_only" | "read_write") {
  return new Response(
    JSON.stringify({
      access_token: "access_fixture",
      scope,
      stripe_user_id: "acct_fixture",
      livemode: true,
    }),
    { status: 200 },
  );
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
    webhookMocks.setFixture(fixture);
    webhookMocks.selectRows.length = 0;
    webhookMocks.inserts.length = 0;
    webhookMocks.updates.length = 0;
    webhookMocks.constructEvent.mockReset();
    webhookMocks.getStripeConnectionByAccountId.mockReset();
    webhookMocks.getStripeConnectionById.mockReset();
    webhookMocks.reconcileWebhook.mockReset();
    webhookMocks.triggerDiagnostic.mockReset().mockResolvedValue(undefined);
    webhookMocks.seedDefaultSequences.mockReset().mockResolvedValue(undefined);
    webhookMocks.sendAlertNotification
      .mockReset()
      .mockImplementation(async (notification) => {
        fixture.emails.push(notification);
      });
    webhookMocks.generateEscalationDraft
      .mockReset()
      .mockImplementation(async (escalationId) => {
        fixture.escalations.push({ escalationId, drafted: true });
      });
    webhookMocks.getConnectedStripe.mockReset().mockImplementation(() => ({
      invoices: {
        pay: async (invoiceId: string) => {
          fixture.writeSideStripeCalls.push({ type: "invoice_pay", invoiceId });
        },
      },
      billingPortal: {
        sessions: {
          create: async (input: unknown) => {
            fixture.portalSessions.push(input);
            return { url: "https://stripe.test/portal" };
          },
        },
      },
    }));
    webhookMocks.execute.mockReset();
    webhookMocks.authSession.mockReset().mockResolvedValue({
      user: { id: fixture.userId },
    });
    const stripe = createReadOnlyStripeFixture();
    const readOnlySource = createStripeDiagnosticSource(stripe);

    const { createStripeOAuthState } =
      await import("../../lib/stripe-oauth-state");
    const { Route: callbackRoute } =
      (await import("../../routes/api/stripe/callback")) as {
        Route: {
          options: {
            server: {
              handlers: { GET(input: { request: Request }): Promise<Response> };
            };
          };
        };
      };
    const oauthSecret = "a-test-secret-that-is-long-enough-for-hmac-signing";
    const diagnosticState = createStripeOAuthState(
      {
        nonce: "diagnostic_fixture",
        userId: fixture.userId,
        intent: "diagnostic",
        issuedAt: new Date(),
        returnPath: "/onboarding?step=2",
      },
      oauthSecret,
    );
    webhookMocks.selectRows.push([]);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(oauthToken("read_only")));
    await expect(
      callbackRoute.options.server.handlers.GET({
        request: new Request(
          `https://app.dunlo.test/api/stripe/callback?state=${diagnosticState.nonce}&code=code_fixture`,
          {
            headers: { cookie: `stripe_oauth_state=${diagnosticState.sealed}` },
          },
        ),
      }),
    ).resolves.toMatchObject({ status: 302 });
    expect(webhookMocks.triggerDiagnostic).toHaveBeenCalledWith({
      connectionId: expect.any(String),
      reason: "initial",
    });
    expect(webhookMocks.inserts[0]).toMatchObject({
      values: expect.objectContaining({
        scope: "read_only",
        phase: "diagnosing",
        webhookEndpointId: null,
      }),
    });
    expect(webhookMocks.reconcileWebhook).not.toHaveBeenCalled();

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

    const { enableMonitoring } = await import("../../functions/diagnostic");
    webhookMocks.selectRows.push([fixture.connection]);
    await expect(
      enableMonitoring({
        context: { session: { user: { id: fixture.userId } } },
        data: { connectionId: fixture.connectionId },
      }),
    ).resolves.toEqual({ ok: true });
    expect(fixture.connection).toMatchObject({
      scope: "read_only",
      phase: "monitoring",
    });

    expect(fixture.recoveryAttempts).toHaveLength(0);
    expect(fixture.emails).toHaveLength(0);
    expect(fixture.escalations).toHaveLength(0);
    expect(fixture.portalSessions).toHaveLength(0);
    expect(fixture.writeSideStripeCalls).toHaveLength(0);
    expect(webhookMocks.sendAlertNotification).not.toHaveBeenCalled();
    expect(webhookMocks.generateEscalationDraft).not.toHaveBeenCalled();
    expect(webhookMocks.getConnectedStripe).not.toHaveBeenCalled();
    expect(webhookMocks.reconcileWebhook).not.toHaveBeenCalled();

    const activationState = createStripeOAuthState(
      {
        nonce: "activation_fixture",
        userId: fixture.userId,
        intent: "activation",
        targetStripeAccountId: fixture.stripeAccountId,
        issuedAt: new Date(),
        returnPath: "/onboarding?step=3",
      },
      oauthSecret,
    );
    webhookMocks.selectRows.push([{ id: fixture.connectionId }], []);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(oauthToken("read_write")));
    await expect(
      callbackRoute.options.server.handlers.GET({
        request: new Request(
          `https://app.dunlo.test/api/stripe/callback?state=${activationState.nonce}&code=code_fixture`,
          {
            headers: { cookie: `stripe_oauth_state=${activationState.sealed}` },
          },
        ),
      }),
    ).resolves.toMatchObject({ status: 302 });
    expect(webhookMocks.reconcileWebhook).not.toHaveBeenCalled();
    expect(webhookMocks.seedDefaultSequences).toHaveBeenCalledWith(
      fixture.userId,
      { isActive: false },
    );
    vi.unstubAllGlobals();

    const { Route } = (await import("../../routes/api/stripe/webhook")) as {
      Route: WebhookRoute;
    };
    webhookMocks.getStripeConnectionByAccountId.mockResolvedValue(
      fixture.connection,
    );
    webhookMocks.constructEvent.mockReturnValue(
      failedInvoiceEvent(
        Math.floor(fixture.recoveryActivatedAt.getTime() / 1000) + 1,
      ),
    );
    const insertsBeforeConfirmation = webhookMocks.inserts.length;
    await expect(deliverFailure(Route)).resolves.toMatchObject({ status: 200 });
    expect(webhookMocks.inserts).toHaveLength(insertsBeforeConfirmation);
    expect(webhookMocks.sendAlertNotification).not.toHaveBeenCalled();

    const { saveEmailProvider } =
      await import("../../functions/email-provider");
    webhookMocks.selectRows.push([]);
    await expect(
      saveEmailProvider({
        context: { session: { user: { id: fixture.userId } } },
        data: {
          provider: "postmark",
          apiKey: "email-key",
          fromEmail: "owner@example.test",
          fromName: "Fixture Owner",
        },
      }),
    ).resolves.toEqual({ ok: true });
    expect(webhookMocks.updates).toContainEqual({
      phase: "email_configured",
    });
    const insertsBeforeRecovery = webhookMocks.inserts.length;

    expect(fixture.connection).toMatchObject({
      scope: "read_write",
      phase: "email_configured",
    });
    webhookMocks.getStripeConnectionById.mockResolvedValue({
      id: fixture.connectionId,
      ...fixture.connection,
      accessToken: "access_fixture",
      webhookSecret: null,
    });
    const { Route: confirmationRoute } =
      (await import("../../routes/api/stripe/recovery/confirm")) as {
        Route: {
          options: {
            server: {
              handlers: {
                POST(input: { request: Request }): Promise<Response>;
              };
            };
          };
        };
      };
    const confirm = async () =>
      await confirmationRoute.options.server.handlers.POST({
        request: new Request(
          "https://app.dunlo.test/api/stripe/recovery/confirm",
          {
            method: "POST",
            body: JSON.stringify({
              connectionId: fixture.connectionId,
              accepted: true,
              workflowVersion: "recovery-v1",
              selectedSequenceIds: fixture.selectedSequenceIds,
            }),
          },
        ),
      });
    webhookMocks.reconcileWebhook.mockResolvedValueOnce(null);
    await expect(confirm()).resolves.toMatchObject({ status: 503 });
    expect(webhookMocks.execute).not.toHaveBeenCalled();

    webhookMocks.reconcileWebhook.mockImplementation(async () => {
      fixture.writeSideStripeCalls.push({ type: "webhook" });
      return {
        webhookEndpointId: "we_fixture",
        webhookSecret: "whsec_fixture",
      };
    });
    webhookMocks.execute.mockImplementation(async (statement) => {
      const query = new PgDialect().sqlToQuery(statement);
      fixture.confirmationQueries.push(query);
      const selectedIds = fixture.sequences
        .filter((sequence) => query.params.includes(sequence.id))
        .map((sequence) => sequence.id);
      const hasExactSelection =
        query.sql.includes("WITH selected AS") &&
        query.sql.includes("(SELECT count(*) FROM selected)") &&
        selectedIds.length === fixture.selectedSequenceIds.length &&
        fixture.selectedSequenceIds.every((id) => selectedIds.includes(id));
      if (
        fixture.connection.scope !== "read_write" ||
        fixture.connection.phase !== "recovery_confirming" ||
        !hasExactSelection
      )
        return { rows: [] };
      for (const sequence of fixture.sequences) {
        sequence.isActive = selectedIds.includes(sequence.id);
      }
      fixture.connection.phase = "recovery_active";
      fixture.connection.recoveryActivatedAt = fixture.recoveryActivatedAt;
      return { rows: [{ user_id: fixture.userId }] };
    });
    const confirmationResponse = await confirm();
    expect(confirmationResponse.status).toBe(200);
    expect(webhookMocks.execute).toHaveBeenCalledOnce();
    expect(webhookMocks.reconcileWebhook).toHaveBeenCalledWith(
      fixture.stripeAccountId,
      "access_fixture",
      { connectionId: fixture.connectionId, phase: "recovery_confirming" },
    );
    expect(fixture.connection).toMatchObject({
      scope: "read_write",
      phase: "recovery_active",
      recoveryActivatedAt: fixture.recoveryActivatedAt,
    });
    expect(fixture.confirmationQueries).toHaveLength(1);
    expect(fixture.confirmationQueries[0]).toMatchObject({
      sql: expect.stringContaining("WITH selected AS"),
    });
    expect(fixture.sequences).toEqual([
      { id: "sequence_card_declined", isActive: true },
      { id: "sequence_expired_card", isActive: false },
    ]);

    const sideEffectsBeforeHistoricalEvent = {
      failedPayments: fixture.failedPayments.length,
      recoveryAttempts: fixture.recoveryAttempts.length,
      emails: fixture.emails.length,
      escalations: fixture.escalations.length,
      portalSessions: fixture.portalSessions.length,
      writeSideStripeCalls: fixture.writeSideStripeCalls.length,
    };
    webhookMocks.constructEvent.mockReturnValue(
      failedInvoiceEvent(
        Math.floor(fixture.recoveryActivatedAt.getTime() / 1000) - 1,
      ),
    );
    await expect(deliverFailure(Route)).resolves.toMatchObject({ status: 200 });
    expect({
      failedPayments: fixture.failedPayments.length,
      recoveryAttempts: fixture.recoveryAttempts.length,
      emails: fixture.emails.length,
      escalations: fixture.escalations.length,
      portalSessions: fixture.portalSessions.length,
      writeSideStripeCalls: fixture.writeSideStripeCalls.length,
    }).toEqual(sideEffectsBeforeHistoricalEvent);
    expect(webhookMocks.sendAlertNotification).not.toHaveBeenCalled();
    expect(webhookMocks.generateEscalationDraft).not.toHaveBeenCalled();
    expect(webhookMocks.getConnectedStripe).not.toHaveBeenCalled();

    webhookMocks.selectRows.push(
      [],
      fixture.sequences.filter((sequence) => sequence.isActive),
      [{ id: "step_selected", stepNumber: 1, delayHours: 0 }],
    );
    webhookMocks.constructEvent.mockReturnValue(
      failedInvoiceEvent(
        Math.floor(fixture.recoveryActivatedAt.getTime() / 1000) + 1,
      ),
    );
    await expect(deliverFailure(Route)).resolves.toMatchObject({ status: 200 });
    expect(fixture.failedPayments).toHaveLength(1);
    expect(fixture.recoveryAttempts).toEqual([
      expect.objectContaining({
        sequenceStepId: "step_selected",
        status: "scheduled",
      }),
    ]);
    expect(webhookMocks.inserts.slice(insertsBeforeRecovery)).toEqual([
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
    expect(webhookMocks.sendAlertNotification).toHaveBeenCalledOnce();
  });
});
