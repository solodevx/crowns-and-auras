// The fixed list of scent families. Your sister picks from these in the admin.
export const scentFamilies = [
  "Fresh",
  "Citrus",
  "Floral",
  "Woody",
  "Oriental",
  "Sweet",
  "Musky",
  "Aromatic",
] as const;

export type ScentFamily = (typeof scentFamilies)[number];