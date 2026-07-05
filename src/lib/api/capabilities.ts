import { ApiError } from "./http";

/**
 * Capability flags for contract-first features whose backend endpoints have
 * not shipped yet (blogs, ads, custom notebooks, ad plans, advertiser opt-in).
 *
 * A feature starts "unknown"; the first call decides. A 404/501 marks it
 * unavailable (cached for a while so we do not hammer missing routes), any
 * success marks it available — so features light up automatically once the
 * backend ships them.
 */

export type Feature =
  | "blogs"
  | "ads"
  | "notebooks"
  | "adPlans"
  | "advertiser"
  | "announcements";

type FeatureState = "unknown" | "available" | "unavailable";

const RECHECK_MS = 5 * 60 * 1000;

const states = new Map<Feature, { state: FeatureState; at: number }>();

export function featureState(feature: Feature): FeatureState {
  const entry = states.get(feature);
  if (!entry) return "unknown";
  if (entry.state === "unavailable" && Date.now() - entry.at > RECHECK_MS) {
    return "unknown";
  }
  return entry.state;
}

function mark(feature: Feature, state: FeatureState) {
  states.set(feature, { state, at: Date.now() });
}

/**
 * Run a call behind a capability flag. Returns null when the feature is
 * missing or the call fails — callers render a clean empty/coming-soon state.
 */
export async function withFeature<T>(
  feature: Feature,
  call: () => Promise<T>,
): Promise<T | null> {
  if (featureState(feature) === "unavailable") return null;
  try {
    const result = await call();
    mark(feature, "available");
    return result;
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 501)) {
      mark(feature, "unavailable");
    }
    return null;
  }
}
