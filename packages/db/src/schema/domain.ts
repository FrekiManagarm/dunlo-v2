import { relations } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const failedPaymentStatus = pgEnum("failed_payment_status", [
  "in_recovery",
  "recovered",
  "escalated",
  "failed",
  "dismissed",
]);

export const recoveryAttemptStatus = pgEnum("recovery_attempt_status", [
  "scheduled",
  "sent",
  "failed",
  "dismissed",
]);

export const escalationStatus = pgEnum("escalation_status", [
  "pending",
  "sent",
  "dismissed",
]);

export const processorEnum = pgEnum("processor", [
  "stripe",
  "paddle",
  "adyen",
  "mollie",
  "mangopay",
]);

export const stripeConnection = pgTable(
  "stripe_connection",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    stripeAccountId: text("stripe_account_id").notNull().unique(),
    accessToken: text("access_token").notNull(),
    publishableKey: text("publishable_key"),
    webhookEndpointId: text("webhook_endpoint_id"),
    webhookSecret: text("webhook_secret").notNull(),
    scope: text("scope").default("read_write").notNull(),
    escalationThreshold: integer("escalation_threshold").default(50000),
    escalationCurrency: text("escalation_currency").default("eur").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("stripe_connection_user_id_idx").on(table.userId),
    index("stripe_connection_stripe_account_id_idx").on(table.stripeAccountId),
  ],
);

export const emailProvider = pgTable(
  "email_provider",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    provider: text("provider").default("resend").notNull(),
    apiKey: text("api_key").notNull(),
    domain: text("domain"),
    fromEmail: text("from_email").notNull(),
    fromName: text("from_name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("email_provider_user_id_idx").on(table.userId)],
);

export const failedPayment = pgTable(
  "failed_payment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    stripePaymentIntentId: text("stripe_payment_intent_id").notNull().unique(),
    stripeCustomerId: text("stripe_customer_id").notNull(),
    stripeInvoiceId: text("stripe_invoice_id"),
    amount: integer("amount").notNull(),
    currency: text("currency").default("eur").notNull(),
    failureCode: text("failure_code").notNull(),
    failureMessage: text("failure_message"),
    customerName: text("customer_name"),
    customerEmail: text("customer_email").notNull(),
    lastFour: text("last_four"),
    description: text("description"),
    status: failedPaymentStatus("status").default("in_recovery").notNull(),
    recoveredAt: timestamp("recovered_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("failed_payment_user_id_idx").on(table.userId),
    index("failed_payment_status_idx").on(table.status),
    index("failed_payment_created_at_idx").on(table.createdAt),
  ],
);

export const recoverySequence = pgTable(
  "recovery_sequence",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    failureCode: text("failure_code").notNull(),
    name: text("name").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("recovery_sequence_user_failure_unique").on(
      table.userId,
      table.failureCode,
    ),
    index("recovery_sequence_user_id_idx").on(table.userId),
  ],
);

export const sequenceStep = pgTable(
  "sequence_step",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    sequenceId: text("sequence_id")
      .notNull()
      .references(() => recoverySequence.id, { onDelete: "cascade" }),
    stepNumber: integer("step_number").notNull(),
    delayHours: integer("delay_hours").default(0).notNull(),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("sequence_step_sequence_id_idx").on(table.sequenceId),
    uniqueIndex("sequence_step_sequence_step_unique").on(
      table.sequenceId,
      table.stepNumber,
    ),
  ],
);

export const recoveryAttempt = pgTable(
  "recovery_attempt",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    failedPaymentId: text("failed_payment_id")
      .notNull()
      .references(() => failedPayment.id, { onDelete: "cascade" }),
    sequenceStepId: text("sequence_step_id")
      .notNull()
      .references(() => sequenceStep.id),
    status: recoveryAttemptStatus("status").default("scheduled").notNull(),
    scheduledAt: timestamp("scheduled_at").notNull(),
    sentAt: timestamp("sent_at"),
    resendEmailId: text("resend_email_id"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("recovery_attempt_status_scheduled_at_idx").on(
      table.status,
      table.scheduledAt,
    ),
    index("recovery_attempt_failed_payment_id_idx").on(table.failedPaymentId),
  ],
);

export const escalation = pgTable(
  "escalation",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    failedPaymentId: text("failed_payment_id")
      .notNull()
      .unique()
      .references(() => failedPayment.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    draftSubject: text("draft_subject"),
    draftBody: text("draft_body"),
    status: escalationStatus("status").default("pending").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("escalation_user_id_idx").on(table.userId)],
);

export const notificationSettings = pgTable(
  "notification_settings",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    emailOnFailure: boolean("email_on_failure").default(true).notNull(),
    emailOnRecovery: boolean("email_on_recovery").default(true).notNull(),
    emailOnEscalation: boolean("email_on_escalation").default(true).notNull(),
    emailOnEmailSent: boolean("email_on_email_sent").default(false).notNull(),
    slackOnFailure: boolean("slack_on_failure").default(false).notNull(),
    slackOnRecovery: boolean("slack_on_recovery").default(false).notNull(),
    slackOnEscalation: boolean("slack_on_escalation").default(true).notNull(),
    slackOnEmailSent: boolean("slack_on_email_sent").default(false).notNull(),
    slackWebhookUrl: text("slack_webhook_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("notification_settings_user_id_idx").on(table.userId)],
);

export const benchmarkSnapshot = pgTable(
  "benchmark_snapshot",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    sampleStartsAt: timestamp("sample_starts_at").notNull(),
    sampleEndsAt: timestamp("sample_ends_at").notNull(),
    totalChargeCount: integer("total_charge_count").default(0).notNull(),
    failedChargeCount: integer("failed_charge_count").default(0).notNull(),
    recoveredFailureCount: integer("recovered_failure_count")
      .default(0)
      .notNull(),
    failedPaymentRateBps: integer("failed_payment_rate_bps")
      .default(0)
      .notNull(),
    recoveryRateBps: integer("recovery_rate_bps").default(0).notNull(),
    cardExpiredRateBps: integer("card_expired_rate_bps").default(0).notNull(),
    insufficientFundsRateBps: integer("insufficient_funds_rate_bps")
      .default(0)
      .notNull(),
    doNotHonorRateBps: integer("do_not_honor_rate_bps").default(0).notNull(),
    cardVelocityExceededRateBps: integer("card_velocity_exceeded_rate_bps")
      .default(0)
      .notNull(),
    otherRateBps: integer("other_rate_bps").default(0).notNull(),
    mrrRange: text("mrr_range").default("unknown").notNull(),
    benchmarkOptOut: boolean("benchmark_opt_out").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("benchmark_snapshot_user_id_idx").on(table.userId),
    index("benchmark_snapshot_opt_out_idx").on(table.benchmarkOptOut),
    index("benchmark_snapshot_updated_at_idx").on(table.updatedAt),
  ],
);

// ---------- Relations ----------

export const stripeConnectionRelations = relations(
  stripeConnection,
  ({ one }) => ({
    user: one(user, {
      fields: [stripeConnection.userId],
      references: [user.id],
    }),
  }),
);

export const emailProviderRelations = relations(emailProvider, ({ one }) => ({
  user: one(user, {
    fields: [emailProvider.userId],
    references: [user.id],
  }),
}));

export const failedPaymentRelations = relations(
  failedPayment,
  ({ one, many }) => ({
    user: one(user, {
      fields: [failedPayment.userId],
      references: [user.id],
    }),
    attempts: many(recoveryAttempt),
    escalation: one(escalation, {
      fields: [failedPayment.id],
      references: [escalation.failedPaymentId],
    }),
  }),
);

export const recoverySequenceRelations = relations(
  recoverySequence,
  ({ one, many }) => ({
    user: one(user, {
      fields: [recoverySequence.userId],
      references: [user.id],
    }),
    steps: many(sequenceStep),
  }),
);

export const sequenceStepRelations = relations(
  sequenceStep,
  ({ one, many }) => ({
    sequence: one(recoverySequence, {
      fields: [sequenceStep.sequenceId],
      references: [recoverySequence.id],
    }),
    attempts: many(recoveryAttempt),
  }),
);

export const recoveryAttemptRelations = relations(
  recoveryAttempt,
  ({ one }) => ({
    failedPayment: one(failedPayment, {
      fields: [recoveryAttempt.failedPaymentId],
      references: [failedPayment.id],
    }),
    step: one(sequenceStep, {
      fields: [recoveryAttempt.sequenceStepId],
      references: [sequenceStep.id],
    }),
  }),
);

export const escalationRelations = relations(escalation, ({ one }) => ({
  failedPayment: one(failedPayment, {
    fields: [escalation.failedPaymentId],
    references: [failedPayment.id],
  }),
  user: one(user, {
    fields: [escalation.userId],
    references: [user.id],
  }),
}));

export const notificationSettingsRelations = relations(
  notificationSettings,
  ({ one }) => ({
    user: one(user, {
      fields: [notificationSettings.userId],
      references: [user.id],
    }),
  }),
);

export const benchmarkSnapshotRelations = relations(
  benchmarkSnapshot,
  ({ one }) => ({
    user: one(user, {
      fields: [benchmarkSnapshot.userId],
      references: [user.id],
    }),
  }),
);
