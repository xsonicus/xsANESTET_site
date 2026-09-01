import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { checkVkConnection } from "./vk-connector.mjs";
import { connectorSecretStoreReady, readConnectorSecrets } from "./connector-secret-store.mjs";

const DEFINITIONS = Object.freeze([
  {
    id: "onec",
    title: "1С",
    purpose: "Каталог, цены, остатки и передача заказов",
    fields: [
      { env: "ONEC_API_URL", label: "API endpoint", kind: "url" },
      { env: "ONEC_API_TOKEN", label: "Токен доступа", kind: "secret" },
    ],
  },
  {
    id: "cdek",
    title: "СДЭК",
    purpose: "Расчёт тарифа, ПВЗ и создание отправлений",
    fields: [
      { env: "CDEK_API_URL", label: "API endpoint", kind: "url" },
      { env: "CDEK_CLIENT_ID", label: "Client ID", kind: "secret" },
      { env: "CDEK_CLIENT_SECRET", label: "Client secret", kind: "secret" },
    ],
  },
  {
    id: "vk",
    title: "VK Видео",
    purpose: "Посты, видеопревью и ролики с привязкой к товарам",
    fields: [
      { env: "VK_GROUP_DOMAIN", label: "Домен сообщества", kind: "text", fallback: "queenkeyanestet" },
      { env: "VK_ACCESS_TOKEN", label: "Access token", kind: "secret" },
      { env: "VK_API_VERSION", label: "Версия API", kind: "text", fallback: "5.199" },
    ],
    adapter: "active",
  },
  {
    id: "universal",
    title: "Универсальный сервис",
    purpose: "Будущий CRM, ERP, Bitrix или промежуточный connector API",
    fields: [
      { env: "ANESTET_CONNECTOR_URL", label: "API endpoint", kind: "url" },
      { env: "ANESTET_CONNECTOR_TOKEN", label: "Токен доступа", kind: "secret" },
    ],
  },
]);

function envValue(name) {
  return process.env[name]?.trim() || "";
}

function urlIssue(value, envName) {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:") return `${envName}: требуется HTTPS`;
    if (parsed.username || parsed.password || parsed.search || parsed.hash) {
      return `${envName}: credentials, query и fragment запрещены в endpoint`;
    }
    return null;
  } catch {
    return `${envName}: некорректный URL`;
  }
}

function maskedValue(field, value) {
  if (!value) return "Не задано";
  if (field.kind === "url") return "HTTPS endpoint задан";
  if (field.kind === "text") return value;
  return "Задано · значение скрыто";
}

function buildStatus(definition, overrides = {}, secretsReady = false) {
  const values = definition.fields.map((field) => ({ field, value: overrides[field.env] || envValue(field.env) || field.fallback || "" }));
  const missing = values.filter(({ value }) => !value).map(({ field }) => field.env);
  const issues = values.flatMap(({ field, value }) => field.kind === "url" ? [urlIssue(value, field.env)].filter(Boolean) : []);
  const configured = missing.length === 0 && issues.length === 0;
  return {
    id: definition.id,
    title: definition.title,
    purpose: definition.purpose,
    configured,
    state: configured ? "configured" : "not_configured",
    fields: values.map(({ field, value }) => ({ label: field.label, value: maskedValue(field, value) })),
    missing,
    issues,
    externalRequestsEnabled: definition.adapter === "active" && configured,
    credentialStoreReady: secretsReady,
    editableValues: definition.id === "vk" ? {
      groupDomain: values.find(({ field }) => field.env === "VK_GROUP_DOMAIN")?.value || "queenkeyanestet",
      apiVersion: values.find(({ field }) => field.env === "VK_API_VERSION")?.value || "5.199",
    } : undefined,
  };
}

export async function listIntegrationStatuses(config) {
  const stored = config ? await readConnectorSecrets(config) : {};
  const vk = stored.vk || {};
  const overrides = {
    VK_GROUP_DOMAIN: vk.groupDomain,
    VK_ACCESS_TOKEN: vk.accessToken,
    VK_API_VERSION: vk.apiVersion,
  };
  return DEFINITIONS.map((definition) => buildStatus(definition, definition.id === "vk" ? overrides : {}, config ? connectorSecretStoreReady(config) : false));
}

async function auditCheck(config, actor, result) {
  await mkdir(dirname(config.auditStore), { recursive: true, mode: 0o750 });
  const entry = {
    at: result.checkedAt,
    actor,
    action: "integration.check",
    integrationId: result.integrationId,
    state: result.state,
    externalRequestMade: result.externalRequestMade,
  };
  await appendFile(config.auditStore, `${JSON.stringify(entry)}\n`, { encoding: "utf8", mode: 0o640 });
}

export async function checkIntegration(config, actor, id) {
  const integration = (await listIntegrationStatuses(config)).find((item) => item.id === id);
  if (!integration) return { status: 404, body: { ok: false, error: "Неизвестная интеграция", code: "UNKNOWN_INTEGRATION" } };
  const checkedAt = new Date().toISOString();
  if (!integration.configured) {
    const result = {
      ok: false,
      integrationId: integration.id,
      state: "not_configured",
      externalRequestMade: false,
      checkedAt,
      error: "Конфигурация неполная. Исходящий запрос не выполнялся",
    };
    await auditCheck(config, actor, result);
    return { status: 409, body: result };
  }
  if (integration.id === "vk") {
    try {
      const checked = await checkVkConnection(config);
      const result = {
        ok: true,
        integrationId: integration.id,
        state: "connected",
        externalRequestMade: true,
        checkedAt,
        postsAvailable: checked.postsAvailable,
      };
      await auditCheck(config, actor, result);
      return { status: 200, body: result };
    } catch (error) {
      const result = {
        ok: false,
        integrationId: integration.id,
        state: error?.externalRequestMade === false ? "not_configured" : "connection_failed",
        externalRequestMade: error?.externalRequestMade !== false,
        checkedAt,
        error: error instanceof Error ? error.message : "VK API недоступен",
      };
      await auditCheck(config, actor, result);
      return { status: error?.status || 502, body: result };
    }
  }
  const result = {
    ok: false,
    integrationId: integration.id,
    state: "adapter_pending",
    externalRequestMade: false,
    checkedAt,
    error: "Реквизиты настроены, но протокол конкретного адаптера ещё не активирован. Исходящий запрос не выполнялся",
  };
  await auditCheck(config, actor, result);
  return { status: 501, body: result };
}
