import type {
  VocabularyEntry,
  VocabularyId,
  VocabularyLabel,
} from "../types/vocabulary.type";
import { PORTFOLIO_TOPIC_PREFIX } from "./portfolio";

const CATEGORY_TOPIC_PREFIX = `${PORTFOLIO_TOPIC_PREFIX}cat-`;

/**
 * Categories of the portfolio, in the order their sections render.
 */
export const CATEGORIES = [
  { id: "web", label: "Web" },
  { id: "data", label: "Data" },
  { id: "cloud-devops", label: "Cloud & DevOps" },
] as const satisfies readonly VocabularyEntry[];

export type CategoryId = VocabularyId<typeof CATEGORIES>;

export type CategoryLabel = VocabularyLabel<typeof CATEGORIES>;

export function categoryTopic(id: CategoryId): string {
  return `${CATEGORY_TOPIC_PREFIX}${id}`;
}
