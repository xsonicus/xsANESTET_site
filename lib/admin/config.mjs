import { resolve } from "node:path";

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function integer(name, fallback, min, max) {
  const value = Number(process.env[name] || fallback);
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max}`);
  }
  return value;
}

export function loadConfig() {
  const origin = new URL(required("ANESTET_ADMIN_ORIGIN")).origin;
  return Object.freeze({
    host: process.env.ANESTET_ADMIN_HOST?.trim() || "127.0.0.1",
    port: integer("ANESTET_ADMIN_PORT", 4318, 1, 65535),
    origin,
    username: required("ANESTET_ADMIN_USERNAME"),
    passwordHash: required("ANESTET_ADMIN_PASSWORD_HASH"),
    catalogStore: resolve(process.env.ANESTET_CATALOG_STORE?.trim() || "/var/lib/anestet/catalog.json"),
    auditStore: resolve(process.env.ANESTET_ADMIN_AUDIT_STORE?.trim() || "/var/lib/anestet/admin-audit.jsonl"),
    cookieName: process.env.ANESTET_ADMIN_COOKIE_NAME?.trim() || "anestet_admin_session",
    cookieSecure: process.env.ANESTET_ADMIN_COOKIE_SECURE !== "false",
    sessionHours: integer("ANESTET_ADMIN_SESSION_HOURS", 8, 1, 24),
    maxBodyBytes: integer("ANESTET_ADMIN_MAX_BODY_BYTES", 65536, 4096, 262144),
  });
}
