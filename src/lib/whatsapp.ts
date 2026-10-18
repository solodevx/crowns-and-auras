export function buildWhatsAppLink(phoneNumber: string, message: string): string {
  const digitsOnly = phoneNumber.replace(/\D/g, "");
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}

export function toWhatsAppNumber(phone: string): string {
  if (phone.startsWith("+234")) return phone.slice(1);
  if (phone.startsWith("0")) return "234" + phone.slice(1);
  return phone;
}
