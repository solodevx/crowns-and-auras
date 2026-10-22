// The public address of the site. Set SITE_URL in the hosting settings
// when we deploy (your real domain once you have one).
export const siteUrl = (
  process.env.SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");