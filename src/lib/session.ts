import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const SESSION_COOKIE = "ca_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type AdminSession = { adminId: string };

// The secret ink, turned into the form the signing tool wants
function getSecretKey(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET is missing or too short (min 32 characters) in .env.local",
    );
  }
  return new TextEncoder().encode(secret);
}

// Clip the wristband on: sign a token and store it in a protected cookie.
export async function createSession(adminId: string): Promise<void> {
  const token = await new SignJWT({ adminId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true, // scripts on the page cannot read it
    secure: process.env.NODE_ENV === "production", // HTTPS only when live
    sameSite: "lax", // not sent along with requests started by other sites
    path: "/",
    maxAge: SESSION_DURATION_SECONDS, // the browser throws it away after 7 days
  });
}


export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  // Outside the try on purpose: a setup mistake should be loud
  const secretKey = getSecretKey();

  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });
    if (typeof payload.adminId === "string") {
      return { adminId: payload.adminId };
    }
  } catch {
    // Expired, forged or garbled: all mean "no valid wristband"
  }

  return null;
}

// Cut the wristband off.
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
