import { useEffect, useState } from "react";
import type { AdminIntegration } from "../../lib/admin/contract";
import styles from "./admin.module.css";

type Props = {
  integrations: AdminIntegration[];
  messages: Record<string, string>;
  checkingId: string | null;
  savingVkSettings: boolean;
  onCheck: (integration: AdminIntegration) => void;
  onSaveVk: (settings: { groupDomain: string; apiVersion: string; accessToken: string }) => Promise<void>;
};

export function AdminIntegrations({ integrations, messages, checkingId, savingVkSettings, onCheck, onSaveVk }: Props) {
  const vk = integrations.find((integration) => integration.id === "vk");
  const [groupDomain, setGroupDomain] = useState("queenkeyanestet");
  const [apiVersion, setApiVersion] = useState("5.199");
  const [accessToken, setAccessToken] = useState("");
  useEffect(() => {
    setGroupDomain(vk?.editableValues?.groupDomain || "queenkeyanestet");
    setApiVersion(vk?.editableValues?.apiVersion || "5.199");
  }, [vk?.editableValues?.groupDomain, vk?.editableValues?.apiVersion]);

  return (
    <section className={styles.integrationsPanel}>
      <div className={styles.sectionHeading}>
        <div><p className={styles.eyebrow}>SERVER-SIDE CONNECTORS</p><h2>Готовность внешних систем</h2></div>
        <p>VK-токен можно сохранить здесь в зашифрованном серверном хранилище. После сохранения значение не возвращается в браузер; остальные коннекторы проверяются отдельными кнопками.</p>
      </div>
      {messages.global && <p className={styles.error} role="alert">{messages.global}</p>}
      <div className={styles.integrationGrid}>
        {integrations.map((integration) => (
          <article className={styles.integrationCard} key={integration.id}>
            <div className={styles.integrationTop}>
              <div><p className={styles.eyebrow}>{integration.id.toUpperCase()}</p><h3>{integration.title}</h3></div>
              <span className={`${styles.statusBadge} ${integration.configured ? styles.statusReady : styles.statusOff}`}>{integration.configured ? "Настроено" : "Не настроено"}</span>
            </div>
            <p className={styles.integrationPurpose}>{integration.purpose}</p>
            <dl className={styles.maskedFields}>
              {integration.fields.map((field) => <div key={field.label}><dt>{field.label}</dt><dd>{field.value}</dd></div>)}
            </dl>
            {(integration.missing.length > 0 || integration.issues.length > 0) && (
              <div className={styles.integrationWarnings}>
                {integration.missing.length > 0 && <p>Не заданы: {integration.missing.join(", ")}</p>}
                {integration.issues.map((issue) => <p key={issue}>{issue}</p>)}
              </div>
            )}
            {integration.id === "vk" && (
              <form
                className={styles.vkSettingsForm}
                onSubmit={async (event) => {
                  event.preventDefault();
                  await onSaveVk({ groupDomain, apiVersion, accessToken });
                  setAccessToken("");
                }}
              >
                <label><span>Домен сообщества</span><input value={groupDomain} onChange={(event) => setGroupDomain(event.target.value)} autoComplete="off" required /></label>
                <label><span>Версия VK API</span><input value={apiVersion} onChange={(event) => setApiVersion(event.target.value)} inputMode="decimal" autoComplete="off" required /></label>
                <label><span>Access token</span><input type="password" value={accessToken} onChange={(event) => setAccessToken(event.target.value)} autoComplete="new-password" placeholder={integration.configured ? "Оставьте пустым, чтобы не менять" : "Вставьте токен компании"} /></label>
                {!integration.credentialStoreReady && <p>Серверный ключ шифрования ещё не установлен. Сохранение будет доступно после настройки `ANESTET_CONNECTOR_SECRETS_KEY`.</p>}
                <button type="submit" disabled={savingVkSettings || !integration.credentialStoreReady}>{savingVkSettings ? "Шифруем и сохраняем…" : "Сохранить реквизиты VK"}</button>
              </form>
            )}
            <div className={styles.integrationAction}>
              <button onClick={() => onCheck(integration)} disabled={checkingId === integration.id}>{checkingId === integration.id ? "Проверяем…" : "Проверить подключение"}</button>
              {messages[integration.id] && <p role="status">{messages[integration.id]}</p>}
            </div>
          </article>
        ))}
      </div>
      <p className={styles.failClosedNote}>1С, СДЭК и универсальный коннектор остаются fail-closed до установки адаптеров. VK выполняет запрос только после сохранения токена; секрет шифруется на сервере и никогда не возвращается в панель.</p>
    </section>
  );
}
