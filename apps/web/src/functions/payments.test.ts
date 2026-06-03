import { describe, expect, it, vi } from "vitest";

const userId = "user_1";
const stripeAccountId = "acct_1";
const now = new Date();

type Column = {
  table: string;
  name: string;
};

type Condition =
  | { op: "and"; conditions: Condition[] }
  | { op: "eq"; column: Column; value: unknown }
  | { op: "gte"; column: Column; value: unknown }
  | { op: "inArray"; column: Column; values: readonly unknown[] };

function column(table: string, name: string): Column {
  return { table, name };
}

const failedPaymentTable = {
  tableName: "failedPayment",
  id: column("failedPayment", "id"),
  userId: column("failedPayment", "userId"),
  stripeAccountId: column("failedPayment", "stripeAccountId"),
  status: column("failedPayment", "status"),
  createdAt: column("failedPayment", "createdAt"),
};

const stripeConnectionTable = {
  tableName: "stripeConnection",
  userId: column("stripeConnection", "userId"),
  updatedAt: column("stripeConnection", "updatedAt"),
};

const escalationTable = {
  tableName: "escalation",
  failedPaymentId: column("escalation", "failedPaymentId"),
  userId: column("escalation", "userId"),
  status: column("escalation", "status"),
};

const failedPayments = [
  {
    id: "fp_in_recovery",
    userId,
    stripeAccountId,
    amount: 1200,
    currency: "eur",
    status: "in_recovery",
    failureCode: "card_declined",
    customerName: "Alice",
    customerEmail: "alice@example.com",
    createdAt: now,
  },
  {
    id: "fp_escalated",
    userId,
    stripeAccountId,
    amount: 3400,
    currency: "eur",
    status: "escalated",
    failureCode: "card_declined",
    customerName: "Bob",
    customerEmail: "bob@example.com",
    createdAt: now,
  },
  {
    id: "fp_recovered",
    userId,
    stripeAccountId,
    amount: 5600,
    currency: "eur",
    status: "recovered",
    failureCode: "card_declined",
    customerName: "Cara",
    customerEmail: "cara@example.com",
    createdAt: now,
  },
];

function readColumn(row: Record<string, unknown>, columnToRead: Column) {
  return row[columnToRead.name];
}

function matchesCondition(row: Record<string, unknown>, condition?: Condition) {
  if (!condition) return true;

  if (condition.op === "and") {
    return condition.conditions.every((item) => matchesCondition(row, item));
  }

  if (condition.op === "eq") {
    return readColumn(row, condition.column) === condition.value;
  }

  if (condition.op === "gte") {
    return (
      readColumn(row, condition.column) instanceof Date &&
      condition.value instanceof Date &&
      readColumn(row, condition.column) >= condition.value
    );
  }

  return condition.values.includes(readColumn(row, condition.column));
}

class QueryBuilder {
  private table?: { tableName: string };
  private condition?: Condition;
  private limitValue?: number;

  from(table: { tableName: string }) {
    this.table = table;
    return this;
  }

  innerJoin() {
    return this;
  }

  where(condition: Condition) {
    this.condition = condition;
    return this;
  }

  orderBy() {
    return this;
  }

  limit(value: number) {
    this.limitValue = value;
    return this;
  }

  offset() {
    return this;
  }

  then<TResult1 = unknown[], TResult2 = never>(
    onfulfilled?:
      | ((value: unknown[]) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return Promise.resolve(this.execute()).then(onfulfilled, onrejected);
  }

  private execute() {
    let rows: unknown[] = [];

    if (this.table === stripeConnectionTable) {
      rows = [
        {
          userId,
          stripeAccountId,
          escalationCurrency: "eur",
          updatedAt: now,
        },
      ];
    }

    if (this.table === failedPaymentTable) {
      rows = failedPayments.filter((row) => matchesCondition(row, this.condition));
    }

    if (this.table === escalationTable) {
      rows = [];
    }

    return typeof this.limitValue === "number"
      ? rows.slice(0, this.limitValue)
      : rows;
  }
}

vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => {
    const builder = {
      middleware: () => builder,
      inputValidator: () => builder,
      handler: (handler: unknown) => handler,
    };
    return builder;
  },
}));

vi.mock("@tanstack/react-router", () => ({
  redirect: (options: unknown) => {
    throw options;
  },
}));

vi.mock("drizzle-orm", () => ({
  and: (...conditions: Condition[]) => ({ op: "and", conditions }),
  desc: (columnToSort: Column) => columnToSort,
  eq: (columnToCompare: Column, value: unknown) => ({
    op: "eq",
    column: columnToCompare,
    value,
  }),
  gte: (columnToCompare: Column, value: unknown) => ({
    op: "gte",
    column: columnToCompare,
    value,
  }),
  inArray: (columnToCompare: Column, values: readonly unknown[]) => ({
    op: "inArray",
    column: columnToCompare,
    values,
  }),
}));

vi.mock("@dunlo-v2/db", () => ({
  db: {
    select: () => new QueryBuilder(),
  },
}));

vi.mock("@dunlo-v2/db/schema/domain", () => ({
  escalation: escalationTable,
  failedPayment: failedPaymentTable,
  recoveryAttempt: { tableName: "recoveryAttempt" },
  sequenceStep: { tableName: "sequenceStep" },
  stripeConnection: stripeConnectionTable,
}));

vi.mock("@/functions/escalations", () => ({
  generateEscalationDraft: vi.fn(),
}));

vi.mock("@/lib/template", () => ({
  formatAmount: (amount: number, currency: string) => `${currency}:${amount}`,
  humanizeFailureCode: (code: string) => code,
}));

vi.mock("@/middleware/auth", () => ({
  authMiddleware: {},
}));

describe("getDashboardData", () => {
  it("counts escalated failed payments in MRR at risk", async () => {
    const { getDashboardData } = await import("./payments");
    const dashboardData = await getDashboardData({
      context: {
        session: {
          user: { id: userId },
        },
      },
    });

    expect(dashboardData.stats).toEqual(
      expect.objectContaining({
        inRecoveryCount: 1,
        mrrAtRisk: 4600,
      }),
    );
  });
});
