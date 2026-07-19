import type { MoneyByCurrency } from "./types";

export const ECB_REFERENCE_RATE_SOURCE = "ecb_reference_rates";

export type DominantCurrency = {
  currency: string;
  shareBps: number;
};

export type FxRateMetadata = {
  source: typeof ECB_REFERENCE_RATE_SOURCE | "identity";
  seriesKeys: string[];
  rateDate: string;
  fetchedAt: string;
  rateToUsd: number;
};

export type FxRateResult =
  | { status: "available"; metadata: FxRateMetadata }
  | {
      status: "unavailable";
      reason: "rate_unavailable" | "stale_rate" | "unsupported_currency";
      currency: string;
    };

type FetchResponse = {
  ok: boolean;
  text(): Promise<string>;
};

type Fetch = (input: string) => Promise<FetchResponse>;

export type EcbReferenceRateAdapter = {
  getRateToUsd(currency: string): Promise<FxRateResult>;
};

export type EcbReferenceRateAdapterOptions = {
  fetch: Fetch;
  now: () => Date;
};

const ECB_API_BASE_URL = "https://data-api.ecb.europa.eu/service/data/EXR";
const ECB_MAX_RATE_AGE_DAYS = 7;
const ECB_SUPPORTED_CURRENCIES = new Set([
  "aud",
  "bgn",
  "brl",
  "cad",
  "chf",
  "cny",
  "czk",
  "dkk",
  "eur",
  "gbp",
  "hkd",
  "huf",
  "idr",
  "ils",
  "inr",
  "isk",
  "jpy",
  "krw",
  "mxn",
  "myr",
  "nok",
  "nzd",
  "php",
  "pln",
  "ron",
  "sek",
  "sgd",
  "thb",
  "try",
  "usd",
  "zar",
]);

export function selectDominantCurrency(
  mrrByCurrency: MoneyByCurrency,
): DominantCurrency | null {
  const entries = Object.entries(mrrByCurrency).filter(
    ([, amount]) => Number.isSafeInteger(amount) && amount > 0,
  );
  const total = entries.reduce((sum, [, amount]) => sum + amount, 0);

  if (!Number.isSafeInteger(total) || total <= 0) {
    return null;
  }

  const [currency, amount] = entries.reduce((largest, entry) =>
    entry[1] > largest[1] ? entry : largest,
  );

  if (amount * 10_000 < total * 8_000) {
    return null;
  }

  return {
    currency,
    shareBps: Math.floor((amount * 10_000) / total),
  };
}

export function createEcbReferenceRateAdapter(
  options: EcbReferenceRateAdapterOptions,
): EcbReferenceRateAdapter {
  const cache = new Map<string, FxRateMetadata>();

  return {
    async getRateToUsd(inputCurrency: string): Promise<FxRateResult> {
      const currency = inputCurrency.trim().toLowerCase();
      const now = options.now();

      if (currency === "usd") {
        return {
          status: "available",
          metadata: identityRate(now),
        };
      }

      if (!ECB_SUPPORTED_CURRENCIES.has(currency)) {
        return unavailable("unsupported_currency", currency);
      }

      const cached = cache.get(currency);

      if (cached) {
        return isCurrent(cached.rateDate, now)
          ? { status: "available", metadata: cached }
          : unavailable("stale_rate", currency);
      }

      const rate = await loadRate(currency, options.fetch, now);

      if (rate.status === "available") {
        cache.set(currency, rate.metadata);
      }

      return rate;
    },
  };
}

function identityRate(now: Date): FxRateMetadata {
  return {
    source: "identity",
    seriesKeys: [],
    rateDate: dateOnly(now),
    fetchedAt: now.toISOString(),
    rateToUsd: 1,
  };
}

async function loadRate(
  currency: string,
  fetch: Fetch,
  now: Date,
): Promise<FxRateResult> {
  const usdObservations = await loadSeries("usd", fetch);

  if (!usdObservations) {
    return unavailable("rate_unavailable", currency);
  }

  const baseObservations =
    currency === "eur"
      ? new Map([...usdObservations.keys()].map((date) => [date, 1] as const))
      : await loadSeries(currency, fetch);

  if (!baseObservations) {
    return unavailable("rate_unavailable", currency);
  }

  const sharedObservation = latestSharedObservation(
    usdObservations,
    baseObservations,
  );

  if (!sharedObservation) {
    return unavailable("rate_unavailable", currency);
  }

  if (!isCurrent(sharedObservation.date, now)) {
    return unavailable("stale_rate", currency);
  }

  const seriesKeys =
    currency === "eur"
      ? [seriesKey("usd")]
      : [seriesKey(currency), seriesKey("usd")];

  return {
    status: "available",
    metadata: {
      source: ECB_REFERENCE_RATE_SOURCE,
      seriesKeys,
      rateDate: sharedObservation.date,
      fetchedAt: now.toISOString(),
      rateToUsd: roundedRate(
        sharedObservation.usdPerEur / sharedObservation.currencyPerEur,
      ),
    },
  };
}

async function loadSeries(
  currency: string,
  fetch: Fetch,
): Promise<Map<string, number> | null> {
  try {
    const response = await fetch(
      `${ECB_API_BASE_URL}/D.${currency.toUpperCase()}.EUR.SP00.A?format=csvdata`,
    );

    if (!response.ok) {
      return null;
    }

    const observations = parseCsvObservations(await response.text());

    return observations.size > 0 ? observations : null;
  } catch {
    return null;
  }
}

function parseCsvObservations(csv: string): Map<string, number> {
  const rows = csv.trim().split(/\r?\n/);
  const headers = rows
    .shift()
    ?.split(",")
    .map((header) => header.trim());

  if (!headers) {
    return new Map();
  }

  const dateIndex = headers.indexOf("TIME_PERIOD");
  const valueIndex = headers.indexOf("OBS_VALUE");

  if (dateIndex < 0 || valueIndex < 0) {
    return new Map();
  }

  const observations = new Map<string, number>();

  for (const row of rows) {
    const values = row.split(",");
    const date = values[dateIndex]?.trim();
    const value = Number(values[valueIndex]);

    if (
      date &&
      /^\d{4}-\d{2}-\d{2}$/.test(date) &&
      Number.isFinite(value) &&
      value > 0
    ) {
      observations.set(date, value);
    }
  }

  return observations;
}

function latestSharedObservation(
  usdObservations: Map<string, number>,
  currencyObservations: Map<string, number>,
): { date: string; usdPerEur: number; currencyPerEur: number } | null {
  const sharedDates = [...usdObservations.keys()]
    .filter((date) => currencyObservations.has(date))
    .sort((left, right) => right.localeCompare(left));
  const date = sharedDates[0];

  if (!date) {
    return null;
  }

  return {
    date,
    usdPerEur: usdObservations.get(date)!,
    currencyPerEur: currencyObservations.get(date)!,
  };
}

function seriesKey(currency: string): string {
  return `EXR.D.${currency.toUpperCase()}.EUR.SP00.A`;
}

function isCurrent(rateDate: string, now: Date): boolean {
  const rateTime = Date.parse(`${rateDate}T00:00:00.000Z`);
  const todayTime = Date.parse(`${dateOnly(now)}T00:00:00.000Z`);

  return (
    Number.isFinite(rateTime) &&
    (todayTime - rateTime) / 86_400_000 <= ECB_MAX_RATE_AGE_DAYS
  );
}

function dateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function roundedRate(rate: number): number {
  return Number(rate.toFixed(10));
}

function unavailable(
  reason: Extract<FxRateResult, { status: "unavailable" }>["reason"],
  currency: string,
): FxRateResult {
  return { status: "unavailable", reason, currency };
}
