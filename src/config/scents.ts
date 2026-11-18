// The eight scent categories. Names, taglines and card colours live here only.
// The slug is the stable key stored on products and used in shop URLs.
export const scentFamilies = [
  "floral-bouquets",
  "woody-and-deep",
  "citrus-bright",
  "sweet-and-gourmand",
  "warm-and-sensual",
  "fresh-and-radiant",
  "soft-musk",
  "aromatic-and-herbal",
] as const;

export type ScentFamily = (typeof scentFamilies)[number];

// The card colour, taken from the brand palette (see globals.css)
export type CardTone = "plum" | "lavender" | "gold";

export type ScentCategory = {
  slug: ScentFamily;
  name: string;
  tagline: string;
  tone: CardTone;
  photo: string; // put the picture at this path inside /public
};

export const scentCategories: Record<ScentFamily, ScentCategory> = {
  "floral-bouquets": {
    slug: "floral-bouquets",
    name: "Floral Bouquets",
    tagline: "Soft. Romantic. Timeless.",
    tone: "lavender",
    photo: "/images/collections/floral.jpg",
  },
  "woody-and-deep": {
    slug: "woody-and-deep",
    name: "Woody & Deep",
    tagline: "Calm. Grounded. Lasting.",
    tone: "plum",
    photo: "/images/collections/woody.jpg",
  },
  "citrus-bright": {
    slug: "citrus-bright",
    name: "Citrus Bright",
    tagline: "Zesty. Sunny. Alive.",
    tone: "gold",
    photo: "/images/collections/citrus.jpg",
  },
  "sweet-and-gourmand": {
    slug: "sweet-and-gourmand",
    name: "Sweet & Gourmand",
    tagline: "Cozy. Playful. Delicious.",
    tone: "lavender",
    photo: "/images/collections/sweet.jpg",
  },
  "warm-and-sensual": {
    slug: "warm-and-sensual",
    name: "Warm & Sensual",
    tagline: "Rich. Alluring. Addictive.",
    tone: "plum",
    photo: "/images/collections/oriental.jpg",
  },
  "fresh-and-radiant": {
    slug: "fresh-and-radiant",
    name: "Fresh & Radiant",
    tagline: "Light. Elegant. Uplifting.",
    tone: "gold",
    photo: "/images/collections/fresh.jpg",
  },
  "soft-musk": {
    slug: "soft-musk",
    name: "Soft Musk",
    tagline: "Clean. Intimate. Skin-like.",
    tone: "lavender",
    photo: "/images/collections/musky.jpg",
  },
  "aromatic-and-herbal": {
    slug: "aromatic-and-herbal",
    name: "Aromatic & Herbal",
    tagline: "Crisp. Calm. Clean.",
    tone: "plum",
    photo: "/images/collections/aromatic.jpg",
  },
};

// The name customers see. Falls back to the key if it is ever unknown.
export function getScentName(slug: string): string {
  const category = scentCategories[slug as ScentFamily];
  return category ? category.name : slug;
}