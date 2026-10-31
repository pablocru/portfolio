import type {
  VocabularyEntry,
  VocabularyId,
  VocabularyLabel,
} from "../types/vocabulary.type";
import { PORTFOLIO_TOPIC_PREFIX } from "./portfolio";

const TIER_TOPIC_PREFIX = `${PORTFOLIO_TOPIC_PREFIX}tier-`;

/**
 * Tiers of the portfolio, in the order their sections render.
 */
export const TIERS = [
  { id: "featured", label: "Featured" },
  { id: "project", label: "Project" },
  { id: "lab", label: "Lab" },
] as const satisfies readonly VocabularyEntry[];

export type TierId = VocabularyId<typeof TIERS>;

export type TierLabel = VocabularyLabel<typeof TIERS>;

export const DEFAULT_TIER_ID = "project";

export const CATEGORIZED_TIER_ID = "project";

export function tierTopic(id: TierId): string {
  return `${TIER_TOPIC_PREFIX}${id}`;
}
