export function slugify(text: string): string {
  return text
    .normalize("NFD") // "é" becomes "e" plus a separate accent mark...
    .replace(/[\u0300-\u036f]/g, "") // ...and the accent marks are removed
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "") // delete apostrophes, so "L'Aube" becomes "laube"
    .replace(/[^a-z0-9]+/g, "-") // anything else becomes a single hyphen
    .replace(/^-+|-+$/g, ""); // no hyphens at the ends
}