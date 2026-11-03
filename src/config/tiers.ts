import type {
  VocabularyEntry,
  VocabularyId,
  VocabularyLabel,
} from "../types/vocabulary.type";
import { PORTFOLIO_TOPIC_PREFIX } from "./portfolio";

const TIER_TOPIC_PREFIX = `${PORTFOLIO_TOPIC_PREFIX}tier-`;

/** An entry of the tier vocabulary: whether the tier requires a category. */
export type TierEntry = VocabularyEntry & {
  readonly requiresCategory: boolean;
};

/**
 * Tiers of the portfolio, in the order their sections render.
 */
export const TIERS = [
  { id: "featured", label: "Featured", requiresCategory: true },
  { id: "project", label: "Project", requiresCategory: true },
  { id: "lab", label: "Lab", requiresCategory: false },
] as const satisfies readonly TierEntry[];

export type TierId = VocabularyId<typeof TIERS>;

export type TierLabel = VocabularyLabel<typeof TIERS>;

export const DEFAULT_TIER_ID = "project";

export const CATEGORIZED_TIER_ID = "project";

/** Whether a published repository of this tier must declare a category. */
export function tierRequiresCategory(id: TierId): boolean {
  const tier = TIERS.find((entry) => entry.id === id);

  if (tier === undefined) {
    throw new Error(`Tier "${id}" is not declared.`);
  }

  return tier.requiresCategory;
}

export function tierTopic(id: TierId): string {
  return `${TIER_TOPIC_PREFIX}${id}`;
}
