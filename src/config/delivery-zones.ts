export type DeliveryZone = {
  id: string; // stable label used in code, never shown to customers
  name: string; // what customers see
  fee: number; // whole naira
};

// PLACEHOLDER zones and fees: guessed, to be replaced with the client's real ones.
export const deliveryZones: DeliveryZone[] = [
  { id: "island", name: "Lagos Island (Ikoyi, Victoria Island)", fee: 3000 },
  { id: "lekki-ajah", name: "Lekki / Ajah", fee: 4000 },
  { id: "mainland", name: "Lagos Mainland (Yaba, Surulere, Ikeja)", fee: 3500 },
  { id: "outskirts", name: "Outskirts (Ikorodu, Badagry, Epe)", fee: 5000 },
];

export function getDeliveryZone(zoneId: string): DeliveryZone | undefined {
  return deliveryZones.find((zone) => zone.id === zoneId);
}