import { describe, expect, it } from "vitest";

import { monitoringNotificationReason } from "./notifications";

const currentPlanPriceUsd = 9_900;

describe("monitoringNotificationReason", () => {
  it("notifies when a non-activation verdict becomes activation recommended", () => {
    expect(
      monitoringNotificationReason(
        {
          verdict: "monitoring_recommended",
          monthlyAddressable: 30_000,
          planPriceUsd: currentPlanPriceUsd,
        },
        {
          verdict: "activation_recommended",
          monthlyAddressable: 30_000,
          planPriceUsd: currentPlanPriceUsd,
        },
      ),
    ).toBe("verdict_upgrade");
  });

  it("notifies when monthly addressable rises by 25% and one current plan month", () => {
    expect(
      monitoringNotificationReason(
        {
          verdict: "monitoring_recommended",
          monthlyAddressable: 40_000,
          planPriceUsd: 4_900,
        },
        {
          verdict: "monitoring_recommended",
          monthlyAddressable: 50_000,
          planPriceUsd: 4_900,
        },
      ),
    ).toBe("addressable_increase");
  });

  it("stays quiet when the verdict is unchanged", () => {
    expect(
      monitoringNotificationReason(
        {
          verdict: "monitoring_recommended",
          monthlyAddressable: 40_000,
          planPriceUsd: currentPlanPriceUsd,
        },
        {
          verdict: "monitoring_recommended",
          monthlyAddressable: 40_000,
          planPriceUsd: currentPlanPriceUsd,
        },
      ),
    ).toBeNull();
  });

  it("stays quiet for a 24.99% increase", () => {
    expect(
      monitoringNotificationReason(
        {
          verdict: "monitoring_recommended",
          monthlyAddressable: 100_000,
          planPriceUsd: currentPlanPriceUsd,
        },
        {
          verdict: "monitoring_recommended",
          monthlyAddressable: 124_990,
          planPriceUsd: currentPlanPriceUsd,
        },
      ),
    ).toBeNull();
  });

  it("stays quiet when the increase is smaller than one current plan month", () => {
    expect(
      monitoringNotificationReason(
        {
          verdict: "monitoring_recommended",
          monthlyAddressable: 30_000,
          planPriceUsd: currentPlanPriceUsd,
        },
        {
          verdict: "monitoring_recommended",
          monthlyAddressable: 37_500,
          planPriceUsd: currentPlanPriceUsd,
        },
      ),
    ).toBeNull();
  });
});
