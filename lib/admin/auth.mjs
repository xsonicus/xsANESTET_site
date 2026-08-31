import { createHash, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

const sessions = new Map();
const loginAttempts = new Map();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_LIMIT = 5;

function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && timingSafeEqual(a, b);
}

function tokenKey(token) {
  return createHash("sha256").update(token).digest("hex");
}

function parsePasswordHash(encoded) {
  const [scheme, iterationsRaw, saltEncoded, digestEncoded] = encoded.split("$");
  const iterations = Number(iterationsRaw);
  if (scheme !== "pbkdf2-sha256" || !Number.isInteger(iterations) || iterations < 310_000) {
    throw new Error("ANESTET_ADMIN_PASSWORD_HASH must use pbkdf2-sha256 with at least 310000 iterations");
  }
  const salt = Buffer.from(saltEncoded || "", "base64url");
  const digest = Buffer.from(digestEncoded || "", "base64url");
  if (salt.length < 16 || digest.length !== 32) throw new Error("ANESTET_ADMIN_PASSWORD_HASH is malformed");
  return { iterations, salt, digest };
}

export function validateAuthConfig(config) {
  parsePasswordHash(config.passwordHash);
}

export function verifyCredentials(config, username, password) {
  const parsed = parsePasswordHash(config.passwordHash);
  const candidate = pbkdf2Sync(String(password), parsed.salt, parsed.iterations, parsed.digest.length, "sha256");
  return safeEqual(username, config.username) && timingSafeEqual(candidate, parsed.digest);
}

export function isLoginRateLimited(address) {
  const now = Date.now();
  const attempts = (loginAttempts.get(address) || []).filter((timestamp) => now - timestamp < LOGIN_WINDOW_MS);
  loginAttempts.set(address, attempts);
  return attempts.length >= LOGIN_LIMIT;
}

export function recordLoginFailure(address) {
  const attempts = loginAttempts.get(address) || [];
  attempts.push(Date.now());
  loginAttempts.set(address, attempts);
}

export function clearLoginFailures(address) {
  loginAttempts.delete(address);
}

export function createSession(config) {
  const token = randomBytes(32).toString("base64url");
  const csrfToken = randomBytes(24).toString("base64url");
  const expiresAt = Date.now() + config.sessionHours * 60 * 60 * 1000;
  sessions.set(tokenKey(token), { username: config.username, csrfToken, expiresAt });
  return { token, csrfToken, expiresAt };
}

export function readSession(config, cookieHeader) {
  const cookies = Object.fromEntries(String(cookieHeader || "").split(";").map((part) => {
    const index = part.indexOf("=");
    return index < 0 ? [part.trim(), ""] : [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1))];
  }));
  const token = cookies[config.cookieName];
  if (!token) return null;
  const key = tokenKey(token);
  const session = sessions.get(key);
  if (!session || session.expiresAt <= Date.now()) {
    sessions.delete(key);
    return null;
  }
  return { ...session, tokenKey: key };
}

export function destroySession(session) {
  if (session?.tokenKey) sessions.delete(session.tokenKey);
}

export function sessionCookie(config, token, expiresAt) {
  const secure = config.cookieSecure ? "; Secure" : "";
  return `${config.cookieName}=${encodeURIComponent(token)}; Path=/api/admin; HttpOnly; SameSite=Strict; Expires=${new Date(expiresAt).toUTCString()}${secure}`;
}

export function expiredSessionCookie(config) {
  const secure = config.cookieSecure ? "; Secure" : "";
  return `${config.cookieName}=; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}
