import { formatNaira } from "@/lib/format";

export type NewOrderAlert = {
  orderNumber: string;
  customerName: string;
  total: number;
  itemCount: number;
  zoneName: string;
};

export type NotifyResult = { sent: true } | { sent: false; reason: string };

// WhatsApp template values can't contain line breaks or long runs of spaces
function clean(value: string, max = 60): string {
  return value
    .replace(/[\r\n\t]+/g, " ")
    .replace(/ {2,}/g, " ")
    .trim()
    .slice(0, max);
}

function getConfig() {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const owner = (process.env.OWNER_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
  if (!token || !phoneNumberId || !owner) return null;
  if (!/^\d+$/.test(phoneNumberId)) return null;

  const version = process.env.WHATSAPP_API_VERSION || "v23.0";
  if (!/^v\d+\.\d+$/.test(version)) return null;

  return {
    token,
    phoneNumberId,
    owner,
    version,
    template: process.env.WHATSAPP_TEMPLATE_NAME || "new_order_alert",
    language: process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en",
  };
}

function readErrorMessage(data: unknown): string {
  if (typeof data === "object" && data !== null && "error" in data) {
    const error = (data as { error?: { message?: unknown } }).error;
    if (error && typeof error.message === "string") return error.message;
  }
  return "";
}

// Tells the shop owner about a new order on WhatsApp. It never throws, so a
// problem here can never stop an order from being saved.
export async function notifyNewOrder(
  alert: NewOrderAlert,
): Promise<NotifyResult> {
  const config = getConfig();
  if (!config) return { sent: false, reason: "WhatsApp alerts are not set up" };

  const parameters = [
    alert.orderNumber,
    alert.customerName,
    formatNaira(alert.total),
    String(alert.itemCount),
    alert.zoneName,
  ].map((text) => ({ type: "text", text: clean(text) || "-" }));

  try {
    const response = await fetch(
      `https://graph.facebook.com/${config.version}/${config.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: config.owner,
          type: "template",
          template: {
            name: config.template,
            language: { code: config.language },
            components: [{ type: "body", parameters }],
          },
        }),
        signal: AbortSignal.timeout(8000),
      },
    );

    if (!response.ok) {
      let detail = "";
      try {
        detail = readErrorMessage(await response.json());
      } catch {
        // the answer wasn't JSON: ignore
      }
      console.error(`WhatsApp alert failed (${response.status}): ${detail}`);
      return {
        sent: false,
        reason: `Meta answered ${response.status}${detail ? `: ${detail}` : ""}`,
      };
    }

    return { sent: true };
  } catch (error) {
    console.error(
      "WhatsApp alert failed:",
      error instanceof Error ? error.message : error,
    );
    return { sent: false, reason: "could not reach WhatsApp" };
  }
}