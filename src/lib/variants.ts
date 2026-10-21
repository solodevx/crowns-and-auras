// The first number in a size label: "50ml" -> 50, "3.4 oz" -> 3.4.
// Labels with no number (like "Full size") sort last.
export function getSizeNumber(size: string): number {
  const match = size.match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : Number.POSITIVE_INFINITY;
}

export function sortVariantsBySize<T extends { size: string }>(
  variants: T[],
): T[] {
  return [...variants].sort((first, second) => {
    const firstNumber = getSizeNumber(first.size);
    const secondNumber = getSizeNumber(second.size);
    if (firstNumber === secondNumber) return first.size.localeCompare(second.size);
    return firstNumber < secondNumber ? -1 : 1;
  });
}
