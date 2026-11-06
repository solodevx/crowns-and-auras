// The perfume notes your sister can pick from. The slug is the stable key stored
// on products. Each note's picture lives at /public/images/notes/<slug>.jpg
export const noteSlugs = [
  "bergamot",
  "lemon",
  "orange",
  "grapefruit",
  "pear",
  "apple",
  "lavender",
  "mint",
  "pink-pepper",
  "black-pepper",
  "cardamom",
  "cinnamon",
  "saffron",
  "rose",
  "jasmine",
  "iris",
  "orange-blossom",
  "tuberose",
  "peony",
  "violet",
  "sandalwood",
  "cedarwood",
  "oud",
  "vetiver",
  "patchouli",
  "vanilla",
  "tonka-bean",
  "amber",
  "musk",
  "caramel",
  "leather",
] as const;

export type NoteSlug = (typeof noteSlugs)[number];

// A perfume can show at most this many notes
export const NOTE_LIMIT = 9;

const noteNames: Record<NoteSlug, string> = {
  bergamot: "Bergamot",
  lemon: "Lemon",
  orange: "Orange",
  grapefruit: "Grapefruit",
  pear: "Pear",
  apple: "Apple",
  lavender: "Lavender",
  mint: "Mint",
  "pink-pepper": "Pink Pepper",
  "black-pepper": "Black Pepper",
  cardamom: "Cardamom",
  cinnamon: "Cinnamon",
  saffron: "Saffron",
  rose: "Rose",
  jasmine: "Jasmine",
  iris: "Iris",
  "orange-blossom": "Orange Blossom",
  tuberose: "Tuberose",
  peony: "Peony",
  violet: "Violet",
  sandalwood: "Sandalwood",
  cedarwood: "Cedarwood",
  oud: "Oud (Agarwood)",
  vetiver: "Vetiver",
  patchouli: "Patchouli",
  vanilla: "Vanilla",
  "tonka-bean": "Tonka Bean",
  amber: "Amber",
  musk: "Musk",
  caramel: "Caramel",
  leather: "Leather",
};

export function getNoteName(slug: string): string {
  return noteNames[slug as NoteSlug] ?? slug;
}

export function getNoteImage(slug: string): string {
  return `/images/notes/${slug}.jpg`;
}