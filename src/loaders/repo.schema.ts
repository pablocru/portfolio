import { z } from "astro/zod";
import { CATEGORIES } from "../config/categories";
import { TIERS, tierRequiresCategory } from "../config/tiers";

/**
 * Schema of the `repos` content collection. A category is optional only for
 * the tiers that do not require one; an entry may still carry one there.
 */
export const repoSchema = z
  .object({
    name: z.string(),
    description: z.string().nullable(),
    language: z.string().nullable(),
    url: z.string(),
    archived: z.boolean(),
    pushedAt: z.string().nullable(),
    category: z.enum(CATEGORIES.map((category) => category.id)).nullable(),
    tier: z.enum(TIERS.map((tier) => tier.id)),
  })
  .superRefine((repo, ctx) => {
    if (repo.category === null && tierRequiresCategory(repo.tier)) {
      ctx.addIssue({
        code: "custom",
        message: `Tier "${repo.tier}" requires a category`,
        path: ["category"],
      });
    }
  });
