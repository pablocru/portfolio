import {
  type GroupedTierEntry,
  isGroupedTier,
  type NonGroupedTierEntry,
  TIERS,
  type Tier,
} from "./tiers";

/**
 * Tier sets the tests pick a representative from. They are derived here rather
 * than in the configuration because the site reads `TIERS` and its predicates;
 * only the tests need to ask for "a tier of this shape".
 */
export const requiredTiers = TIERS.filter((tier) => tier.requiresCategory);
export const optionalTiers = TIERS.filter((tier) => !tier.requiresCategory);

const groupedTiers = TIERS.filter(isGroupedTier);
/** The declared tiers whose section is not divided by category. */
export const nonGroupedTiers = TIERS.filter(
  (tier): tier is NonGroupedTierEntry => !isGroupedTier(tier),
);

/**
 * Returns the tier, or throws when the configuration declares none of that
 * shape: a test that cannot pick its representative must fail loudly instead
 * of running with `undefined`.
 */
function mustFindTier<T>(tier: T | undefined, description: string): T {
  if (tier === undefined) {
    throw new Error(`The tier configuration declares no ${description}.`);
  }

  return tier;
}

/** A declared tier that requires a category. */
export function firstRequiredTier(): Tier {
  const [tier] = requiredTiers;

  return mustFindTier(tier, "tier that requires a category");
}

/** A declared tier whose section is divided by category. */
export function firstGroupedTier(): GroupedTierEntry {
  const [tier] = groupedTiers;

  return mustFindTier(tier, "tier whose section is divided by category");
}

/** A declared tier whose section is not divided by category. */
export function firstNonGroupedTier(): NonGroupedTierEntry {
  const [tier] = nonGroupedTiers;

  return mustFindTier(tier, "tier whose section is not divided by category");
}
