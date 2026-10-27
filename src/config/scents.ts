// The eight scent categories. Names, taglines and colours live here only.
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

export type ScentCategory = {
  slug: ScentFamily;
  name: string;
  tagline: string;
  photo: string; // put the photo at this path inside /public
  color: string; // a natural colour behind the photo, matching the scent
  text: "light" | "dark"; // the text colour that reads clearly on that colour
};

export const scentCategories: Record<ScentFamily, ScentCategory> = {
  "floral-bouquets": {
    slug: "floral-bouquets",
    name: "Floral Bouquets",
    tagline: "Soft. Romantic. Timeless.",
    photo: "/collections/floral.jpg",
    color: "#9a4562", // rose
    text: "light",
  },
  "woody-and-deep": {
    slug: "woody-and-deep",
    name: "Woody & Deep",
    tagline: "Calm. Grounded. Lasting.",
    photo: "/collections/woody.jpg",
    color: "#5b3a29", // walnut brown
    text: "light",
  },
  "citrus-bright": {
    slug: "citrus-bright",
    name: "Citrus Bright",
    tagline: "Zesty. Sunny. Alive.",
    photo: "/collections/citrus.jpg",
    color: "#f0b429", // lemon and orange
    text: "dark",
  },
  "sweet-and-gourmand": {
    slug: "sweet-and-gourmand",
    name: "Sweet & Gourmand",
    tagline: "Cozy. Playful. Delicious.",
    photo: "/collections/sweet.jpg",
    color: "#c98a4b", // caramel
    text: "dark",
  },
  "warm-and-sensual": {
    slug: "warm-and-sensual",
    name: "Warm & Sensual",
    tagline: "Rich. Alluring. Addictive.",
    photo: "/collections/oriental.jpg",
    color: "#8c2f39", // amber and deep red
    text: "light",
  },
  "fresh-and-radiant": {
    slug: "fresh-and-radiant",
    name: "Fresh & Radiant",
    tagline: "Light. Elegant. Uplifting.",
    photo: "/collections/fresh.jpg",
    color: "#276b5d", // sea green
    text: "light",
  },
  "soft-musk": {
    slug: "soft-musk",
    name: "Soft Musk",
    tagline: "Clean. Intimate. Skin-like.",
    photo: "/collections/musky.jpg",
    color: "#d9cbb8", // warm sand
    text: "dark",
  },
  "aromatic-and-herbal": {
    slug: "aromatic-and-herbal",
    name: "Aromatic & Herbal",
    tagline: "Crisp. Calm. Clean.",
    photo: "/collections/aromatic.jpg",
    color: "#4f6244", // sage
    text: "light",
  },
};

// The name customers see. Falls back to the key if it is ever unknown.
export function getScentName(slug: string): string {
  const category = scentCategories[slug as ScentFamily];
  return category ? category.name : slug;
}