import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { appendFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

function encryptionKey(config) {
  if (!config.connectorSecretsKey) return null;
  const key = Buffer.from(config.connectorSecretsKey, "base64");
  return key.length === 32 ? key : null;
}

export function connectorSecretStoreReady(config) {
  return Boolean(encryptionKey(config));
}

async function readEnvelope(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

export async function readConnectorSecrets(config) {
  const key = encryptionKey(config);
  if (!key) return {};
  const envelope = await readEnvelope(config.connectorSecretsStore);
  if (!envelope) return {};
  if (envelope.schemaVersion !== 1) throw new Error("Connector secret store schema is unsupported");
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(envelope.iv, "base64"));
  decipher.setAuthTag(Buffer.from(envelope.authTag, "base64"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(envelope.ciphertext, "base64")),
    decipher.final(),
  ]);
  return JSON.parse(plaintext.toString("utf8"));
}

async function writeConnectorSecrets(config, value) {
  const key = encryptionKey(config);
  if (!key) {
    const error = new Error("Зашифрованное хранилище ключей не настроено на сервере");
    error.status = 503;
    throw error;
  }
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  const envelope = {
    schemaVersion: 1,
    algorithm: "aes-256-gcm",
    iv: iv.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
    ciphertext: ciphertext.toString("base64"),
    updatedAt: new Date().toISOString(),
  };
  await mkdir(dirname(config.connectorSecretsStore), { recursive: true, mode: 0o750 });
  const temporary = `${config.connectorSecretsStore}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify(envelope)}\n`, { encoding: "utf8", mode: 0o600 });
  await rename(temporary, config.connectorSecretsStore);
}

export async function saveVkSettings(config, actor, input) {
  const domain = String(input?.groupDomain || "").trim();
  const apiVersion = String(input?.apiVersion || "").trim();
  const accessToken = String(input?.accessToken || "").trim();
  if (!/^[a-zA-Z0-9_.-]{2,80}$/.test(domain)) {
    const error = new Error("Некорректный домен сообщества VK");
    error.status = 422;
    throw error;
  }
  if (!/^\d+\.\d+$/.test(apiVersion)) {
    const error = new Error("Версия VK API должна иметь формат 5.199");
    error.status = 422;
    throw error;
  }
  if (accessToken && (accessToken.length < 20 || accessToken.length > 4096 || /\s/.test(accessToken))) {
    const error = new Error("VK access token имеет некорректный формат");
    error.status = 422;
    throw error;
  }
  const current = await readConnectorSecrets(config);
  const previous = current.vk || {};
  const vk = {
    groupDomain: domain,
    apiVersion,
    accessToken: accessToken || previous.accessToken || "",
  };
  await writeConnectorSecrets(config, { ...current, vk });
  await mkdir(dirname(config.auditStore), { recursive: true, mode: 0o750 });
  await appendFile(config.auditStore, `${JSON.stringify({
    at: new Date().toISOString(),
    actor,
    action: "integration.vk.settings.update",
    groupDomain: domain,
    apiVersion,
    tokenReplaced: Boolean(accessToken),
  })}\n`, { encoding: "utf8", mode: 0o640 });
  return { groupDomain: domain, apiVersion, tokenConfigured: Boolean(vk.accessToken) };
}
