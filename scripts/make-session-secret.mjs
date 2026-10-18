import { readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const file = ".env.local";

// Keep every line EXCEPT the old (empty) session secrets
const kept = readFileSync(file, "utf8")
  .split(/\r?\n/)
  .filter((line) => !line.startsWith("ADMIN_SESSION_SECRET="));

// Drop trailing blank lines, then add one fresh secret
while (kept.length > 0 && kept[kept.length - 1] === "") kept.pop();
kept.push(`ADMIN_SESSION_SECRET=${randomBytes(32).toString("base64url")}`, "");

writeFileSync(file, kept.join("\n"));
console.log("Session secret written.");
