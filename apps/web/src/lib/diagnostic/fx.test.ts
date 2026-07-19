import { describe, expect, it, vi } from "vitest";

import { createEcbReferenceRateAdapter, selectDominantCurrency } from "./fx";

const NOW = new Date("2026-07-19T12:00:00.000Z");

const csvResponse = (body: string) => ({
  ok: true,
  text: async () => body,
});

const csvRate = (date: string, rate: number) =>
  `KEY,FREQ,CURRENCY,CURRENCY_DENOM,EXR_TYPE,SERIES_VARIATION,UNIT_MULT,DECIMALS,TIME_PERIOD,OBS_VALUE\nEXR.D.USD.EUR.SP00.A,D,USD,EUR,SP00,A,0,4,${date},${rate}\n`;

describe("selectDominantCurrency", () => {
  it("rejects a largest currency at 79.99% of MRR", () => {
    expect(selectDominantCurrency({ usd: 7_999, eur: 2_001 })).toBeNull();
  });

  it("accepts a largest currency at 80% of MRR", () => {
    expect(selectDominantCurrency({ usd: 8_000, eur: 2_000 })).toEqual({
      currency: "usd",
      shareBps: 8_000,
    });
  });
});

describe("createEcbReferenceRateAdapter", () => {
  it("uses an identity USD rate without an external request", async () => {
    const fetch = vi.fn();
    const adapter = createEcbReferenceRateAdapter({ fetch, now: () => NOW });

    await expect(adapter.getRateToUsd("usd")).resolves.toEqual({
      status: "available",
      metadata: {
        source: "identity",
        seriesKeys: [],
        rateDate: "2026-07-19",
        fetchedAt: NOW.toISOString(),
        rateToUsd: 1,
      },
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("calculates a EUR-to-USD rate from the ECB USD/EUR series", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(csvResponse(csvRate("2026-07-18", 1.2)));
    const adapter = createEcbReferenceRateAdapter({ fetch, now: () => NOW });

    await expect(adapter.getRateToUsd("eur")).resolves.toEqual({
      status: "available",
      metadata: {
        source: "ecb_reference_rates",
        seriesKeys: ["EXR.D.USD.EUR.SP00.A"],
        rateDate: "2026-07-18",
        fetchedAt: NOW.toISOString(),
        rateToUsd: 1.2,
      },
    });
  });

  it("persists both ECB series and their newest common rate metadata for cross rates", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(csvResponse(csvRate("2026-07-18", 1.2)))
      .mockResolvedValueOnce(
        csvResponse(
          "KEY,FREQ,CURRENCY,CURRENCY_DENOM,EXR_TYPE,SERIES_VARIATION,UNIT_MULT,DECIMALS,TIME_PERIOD,OBS_VALUE\nEXR.D.GBP.EUR.SP00.A,D,GBP,EUR,SP00,A,0,4,2026-07-18,0.8\n",
        ),
      );
    const adapter = createEcbReferenceRateAdapter({ fetch, now: () => NOW });

    await expect(adapter.getRateToUsd("gbp")).resolves.toEqual({
      status: "available",
      metadata: {
        source: "ecb_reference_rates",
        seriesKeys: ["EXR.D.GBP.EUR.SP00.A", "EXR.D.USD.EUR.SP00.A"],
        rateDate: "2026-07-18",
        fetchedAt: NOW.toISOString(),
        rateToUsd: 1.5,
      },
    });
  });

  it("accepts a successful cached ECB rate that is seven calendar days old", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(csvResponse(csvRate("2026-07-12", 1.2)));
    const adapter = createEcbReferenceRateAdapter({ fetch, now: () => NOW });

    await expect(adapter.getRateToUsd("eur")).resolves.toMatchObject({
      status: "available",
      metadata: { rateDate: "2026-07-12", rateToUsd: 1.2 },
    });

    await expect(adapter.getRateToUsd("eur")).resolves.toMatchObject({
      status: "available",
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("rejects a successful cached ECB rate that is eight calendar days old", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(csvResponse(csvRate("2026-07-11", 1.2)));
    let now = new Date("2026-07-18T12:00:00.000Z");
    const adapter = createEcbReferenceRateAdapter({ fetch, now: () => now });

    await expect(adapter.getRateToUsd("eur")).resolves.toMatchObject({
      status: "available",
      metadata: { rateDate: "2026-07-11" },
    });
    now = NOW;

    await expect(adapter.getRateToUsd("eur")).resolves.toEqual({
      status: "unavailable",
      reason: "stale_rate",
      currency: "eur",
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
