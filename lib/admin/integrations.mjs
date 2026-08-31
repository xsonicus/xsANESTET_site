import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

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
  return "Задано · значение скрыто";
}

function buildStatus(definition) {
  const values = definition.fields.map((field) => ({ field, value: envValue(field.env) }));
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
    externalRequestsEnabled: false,
  };
}

export function listIntegrationStatuses() {
  return DEFINITIONS.map(buildStatus);
}

async function auditCheck(config, actor, result) {
  await mkdir(dirname(config.auditStore), { recursive: true, mode: 0o750 });
  const entry = {
    at: result.checkedAt,
    actor,
    action: "integration.check",
    integrationId: result.integrationId,
    state: result.state,
    externalRequestMade: false,
  };
  await appendFile(config.auditStore, `${JSON.stringify(entry)}\n`, { encoding: "utf8", mode: 0o640 });
}

export async function checkIntegration(config, actor, id) {
  const integration = listIntegrationStatuses().find((item) => item.id === id);
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
