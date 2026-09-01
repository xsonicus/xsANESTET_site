import type { AdminProduct, AdminVkFeedResponse, VkFeedItem } from "../../lib/admin/contract";
import styles from "./admin.module.css";

type Props = {
  feed: AdminVkFeedResponse | null;
  products: AdminProduct[];
  connectorReady: boolean;
  syncing: boolean;
  updatingId: string | null;
  message: string;
  onSync: () => void;
  onUpdate: (item: VkFeedItem, patch: { productId: number | null; published: boolean }) => void;
};

function formatDuration(seconds: number) {
  if (!seconds) return "Пост";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

export function AdminVkFeed({ feed, products, connectorReady, syncing, updatingId, message, onSync, onUpdate }: Props) {
  return (
    <section className={styles.vkFeedPanel} aria-labelledby="vk-feed-title">
      <div className={styles.sectionHeading}>
        <div><p className={styles.eyebrow}>VK CONTENT PIPELINE</p><h2 id="vk-feed-title">Публикации из сообщества</h2></div>
        <p>Синхронизация импортирует все доступные публикации с видео или фотографиями и сразу добавляет их в ленту. Здесь материал можно скрыть или дополнительно связать с товаром.</p>
      </div>
      <div className={styles.vkFeedToolbar}>
        <div>
          <strong>{feed?.items.length ?? 0} публикаций</strong>
          <small>{feed?.syncedAt ? `Последняя синхронизация: ${new Date(feed.syncedAt).toLocaleString("ru-RU")}` : "Синхронизация ещё не выполнялась"}</small>
        </div>
        <button type="button" onClick={onSync} disabled={!connectorReady || syncing}>{syncing ? "Получаем из VK…" : "Синхронизировать VK"}</button>
      </div>
      {message && <p className={styles.vkFeedMessage} role="status">{message}</p>}
      {!connectorReady && <p className={styles.vkFeedEmpty}>Добавьте `VK_ACCESS_TOKEN` в закрытый env-файл сервера. Домен `queenkeyanestet` и версия API уже предусмотрены; токен в панель и браузер не передаётся.</p>}
      {connectorReady && feed && feed.items.length === 0 && <p className={styles.vkFeedEmpty}>Нажмите «Синхронизировать VK»: доступные публикации с изображениями будут добавлены в движущуюся ленту.</p>}
      {feed && feed.items.length > 0 && (
        <div className={styles.vkFeedList}>
          {feed.items.map((item) => {
            const busy = updatingId === item.id;
            return (
              <article className={styles.vkFeedItem} key={item.id}>
                <a className={styles.vkFeedPoster} href={item.sourceUrl} target="_blank" rel="noreferrer" aria-label={`Открыть исходный пост: ${item.title}`}>
                  <img src={item.posterUrl} alt="" width={item.posterWidth} height={item.posterHeight} loading="lazy" referrerPolicy="no-referrer" />
                  <span>{item.kind === "video" ? formatDuration(item.duration) : "Новость"}</span>
                </a>
                <div className={styles.vkFeedCopy}>
                  <div><p className={styles.eyebrow}>VK · {item.kind === "video" ? "ВИДЕО" : "НОВОСТЬ"} · {new Date(item.publishedAt).toLocaleDateString("ru-RU")}</p><h3>{item.title}</h3></div>
                  <label>Привязка к товару
                    <select
                      value={item.productId ?? ""}
                      disabled={busy}
                      onChange={(event) => onUpdate(item, { productId: event.target.value ? Number(event.target.value) : null, published: item.published })}
                    >
                      <option value="">Без привязки к товару</option>
                      {products.filter((product) => product.active).map((product) => <option key={product.id} value={product.id}>ID {product.id} · {product.compactTitle}</option>)}
                    </select>
                  </label>
                  <label className={styles.vkPublishToggle}>
                    <input
                      type="checkbox"
                      checked={item.published}
                      disabled={busy}
                      onChange={(event) => onUpdate(item, { productId: item.productId, published: event.target.checked })}
                    />
                    <span>{item.published ? "Опубликовано на витрине" : "Скрыто от посетителей"}</span>
                  </label>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
