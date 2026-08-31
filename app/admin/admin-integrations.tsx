import type { AdminIntegration } from "../../lib/admin/contract";
import styles from "./admin.module.css";

type Props = {
  integrations: AdminIntegration[];
  messages: Record<string, string>;
  checkingId: string | null;
  onCheck: (integration: AdminIntegration) => void;
};

export function AdminIntegrations({ integrations, messages, checkingId, onCheck }: Props) {
  return (
    <section className={styles.integrationsPanel}>
      <div className={styles.sectionHeading}>
        <div><p className={styles.eyebrow}>SERVER-SIDE CONNECTORS</p><h2>Готовность внешних систем</h2></div>
        <p>Ключи задаются только в закрытом env-файле сервера. Панель не принимает и не показывает секреты.</p>
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
            <div className={styles.integrationAction}>
              <button onClick={() => onCheck(integration)} disabled={checkingId === integration.id}>{checkingId === integration.id ? "Проверяем…" : "Проверить подключение"}</button>
              {messages[integration.id] && <p role="status">{messages[integration.id]}</p>}
            </div>
          </article>
        ))}
      </div>
      <p className={styles.failClosedNote}>Без активированного адаптера проверка безопасно завершится статусом «адаптер ожидается» и не выполнит внешний запрос.</p>
    </section>
  );
}
