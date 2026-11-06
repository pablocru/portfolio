import type {
  VocabularyEntry,
  VocabularyId,
  VocabularyLabel,
} from "../types/vocabulary.type";
import { PORTFOLIO_TOPIC_PREFIX } from "./portfolio";

export const TIER_TOPIC_PREFIX = `${PORTFOLIO_TOPIC_PREFIX}tier-`;

/** An entry of the tier vocabulary: whether the tier requires a category and
 * whether its section is divided by category. */
export type TierEntry =
  | (VocabularyEntry & {
      readonly requiresCategory: true;
      readonly groupedByCategory: boolean;
    })
  | (VocabularyEntry & {
      readonly requiresCategory: false;
      readonly groupedByCategory?: never;
    });

/**
 * Tiers of the portfolio, in the order their sections render.
 */
export const TIERS = [
  {
    id: "featured",
    label: "Featured",
    requiresCategory: true,
    groupedByCategory: false,
  },
  {
    id: "project",
    label: "Project",
    requiresCategory: true,
    groupedByCategory: true,
  },
  { id: "lab", label: "Lab", requiresCategory: false },
] as const satisfies readonly TierEntry[];

/** The declared tier entries, with their literal ids. */
type Tier = (typeof TIERS)[number];

/** Tier entries whose section is divided by category. */
export type GroupedTierEntry = Extract<
  Tier,
  { requiresCategory: true; groupedByCategory: true }
>;

/** Tier entries whose section is not divided by category. */
export type NonGroupedTierEntry = Exclude<Tier, GroupedTierEntry>;

/** Tier ids whose section is divided by category. */
export type GroupedTierId = GroupedTierEntry["id"];

export type TierId = VocabularyId<typeof TIERS>;

export type TierLabel = VocabularyLabel<typeof TIERS>;

/** Whether a published repository of this tier must declare a category. */
export function tierRequiresCategory(id: TierId): boolean {
  const tier = TIERS.find((entry) => entry.id === id);

  if (tier === undefined) {
    throw new Error(`Tier "${id}" is not declared.`);
  }

  return tier.requiresCategory;
}

/** Whether this declared tier entry's section is divided by category. */
export function isGroupedTier(tier: Tier): tier is GroupedTierEntry {
  return tier.requiresCategory === true && tier.groupedByCategory === true;
}

export function tierTopic(id: TierId): string {
  return `${TIER_TOPIC_PREFIX}${id}`;
}
