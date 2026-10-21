// Turns text into a safe web address piece.
//   "Nova & Co  Citrus Dawn!" -> "nova-and-co-citrus-dawn"
//   "Chloé" -> "chloe"   "L'Aube" -> "laube"
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
