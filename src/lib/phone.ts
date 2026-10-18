// Saves every Nigerian number in one format.
//   "08012345678"    -> "+2348012345678"
//   "+2348012345678" -> "+2348012345678" (unchanged)
export function toInternationalPhone(phone: string): string {
  if (phone.startsWith("+234")) return phone;
  if (phone.startsWith("0")) return "+234" + phone.slice(1);
  return phone;
}