/** An entry of a closed vocabulary: a stable id and its display label. */
export type VocabularyEntry = {
  readonly id: string;
  readonly label: string;
};

/** The union of the ids declared by a vocabulary. */
export type VocabularyId<T extends readonly VocabularyEntry[]> =
  T[number]["id"];

/** The union of the labels declared by a vocabulary. */
export type VocabularyLabel<T extends readonly VocabularyEntry[]> =
  T[number]["label"];
