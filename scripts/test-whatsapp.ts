import { notifyNewOrder } from "../src/lib/notify-owner";

async function main() {
  const result = await notifyNewOrder({
    orderNumber: "CA-TEST01",
    customerName: "Test Customer",
    total: 42000,
    itemCount: 2,
    zoneName: "Lekki / Ajah",
  });

  if (result.sent) {
    console.log("Test alert sent. Check WhatsApp on the owner's phone.");
  } else {
    console.log(`Not sent: ${result.reason}`);
    process.exitCode = 1;
  }
}

main();