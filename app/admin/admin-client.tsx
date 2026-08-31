"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type {
  AdminCatalogResponse,
  AdminIntegration,
  AdminIntegrationsResponse,
  AdminProduct,
  AdminProductInput,
  AdminSession,
  AdminSessionState,
} from "../../lib/admin/contract";
import { AdminDashboard } from "./admin-dashboard";
import { AdminIcon } from "./admin-icons";
import { AdminIntegrations } from "./admin-integrations";
import { brandGroups, filterProducts, groupedProducts, type CatalogStatusFilter } from "./admin-catalog-model";
import styles from "./admin.module.css";

type ProductDraft = Omit<AdminProductInput, "compareAtPrice"> & { compareAtPrice: number | "" };
type ApiResult<T> = T & { ok?: boolean; error?: string };

const emptyProduct: ProductDraft = {
  id: 0,
  sku: "",
  brand: "",
  title: "",
  compactTitle: "",
  tag: "",
  image: "/assets/img/",
  price: 0,
  compareAtPrice: "",
  isNew: false,
  isDiscount: false,
  active: true,
};

function toDraft(product: AdminProduct): ProductDraft {
  const { revision: _revision, updatedAt: _updatedAt, ...input } = product;
  return { ...input, compareAtPrice: input.compareAtPrice ?? "" };
}

async function api<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  const response = await fetch(path, { credentials: "same-origin", cache: "no-store", ...init });
  const body = await response.json().catch(() => ({ error: "Сервис вернул некорректный ответ" }));
  if (!response.ok) throw new Error(body.error || `Ошибка ${response.status}`);
  return body;
}

export function AdminClient() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [view, setView] = useState<"overview" | "catalog" | "integrations">("overview");
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [integrations, setIntegrations] = useState<AdminIntegration[]>([]);
  const [checkingIntegration, setCheckingIntegration] = useState<string | null>(null);
  const [integrationMessages, setIntegrationMessages] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draft, setDraft] = useState<ProductDraft>(emptyProduct);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<CatalogStatusFilter>("all");

  const selected = useMemo(() => products.find((product) => product.id === selectedId) || null, [products, selectedId]);
  const visibleProductGroups = useMemo(
    () => groupedProducts(filterProducts(products, search, brandFilter, statusFilter)),
    [products, search, brandFilter, statusFilter],
  );
  const visibleProductCount = visibleProductGroups.reduce((total, group) => total + group.products.length, 0);

  const loadProducts = useCallback(async () => {
    const result = await api<AdminCatalogResponse>("/api/admin/products");
    setProducts(result.products);
  }, []);

  const loadIntegrations = useCallback(async () => {
    const result = await api<AdminIntegrationsResponse>("/api/admin/integrations");
    setIntegrations(result.integrations);
  }, []);

  useEffect(() => {
    let active = true;
    api<AdminSessionState>("/api/admin/session")
      .then(async (result) => {
        if (!active) return;
        if (!result.authenticated) return;
        setSession(result);
        await loadProducts();
      })
      .catch(() => undefined)
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [loadProducts]);

  function chooseProduct(product: AdminProduct) {
    setSelectedId(product.id);
    setDraft(toDraft(product));
    setMessage("");
  }

  function startCreate() {
    setSelectedId(null);
    setDraft(emptyProduct);
    setMessage("");
  }

  function update<K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSaving(true);
    setMessage("");
    try {
      const result = await api<AdminSession>("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: data.get("username"), password: data.get("password") }),
      });
      setSession(result);
      await loadProducts();
      event.currentTarget.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось войти");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    if (!session) return;
    try {
      await api("/api/admin/session", { method: "DELETE", headers: { "X-CSRF-Token": session.csrfToken } });
    } finally {
      setSession(null);
      setProducts([]);
      setIntegrations([]);
      startCreate();
    }
  }

  async function openIntegrations() {
    setView("integrations");
    setMessage("");
    try {
      await loadIntegrations();
    } catch (error) {
      setIntegrationMessages({ global: error instanceof Error ? error.message : "Не удалось загрузить интеграции" });
    }
  }

  function openCatalog(status: CatalogStatusFilter = "all", brand = "all") {
    setStatusFilter(status);
    setBrandFilter(brand);
    setSearch("");
    setView("catalog");
  }

  async function checkConnection(integration: AdminIntegration) {
    if (!session) return;
    setCheckingIntegration(integration.id);
    setIntegrationMessages((current) => ({ ...current, [integration.id]: "" }));
    try {
      await api(`/api/admin/integrations/${integration.id}/check`, {
        method: "POST",
        headers: { "X-CSRF-Token": session.csrfToken },
      });
      setIntegrationMessages((current) => ({ ...current, [integration.id]: "Подключение подтверждено" }));
    } catch (error) {
      setIntegrationMessages((current) => ({
        ...current,
        [integration.id]: error instanceof Error ? error.message : "Проверка не выполнена",
      }));
    } finally {
      setCheckingIntegration(null);
      await loadIntegrations().catch(() => undefined);
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;
    setSaving(true);
    setMessage("");
    const product: AdminProductInput = { ...draft, compareAtPrice: draft.compareAtPrice === "" ? null : draft.compareAtPrice };
    try {
      if (selected) {
        await api(`/api/admin/products/${selected.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "X-CSRF-Token": session.csrfToken },
          body: JSON.stringify({ revision: selected.revision, product }),
        });
      } else {
        await api("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-CSRF-Token": session.csrfToken },
          body: JSON.stringify(product),
        });
      }
      await loadProducts();
      if (!selected) startCreate();
      setMessage(selected ? "Изменения сохранены" : "Товар добавлен");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось сохранить товар");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <section className={styles.centerCard}>Проверяем защищённую сессию…</section>;

  if (!session) {
    return (
      <section className={styles.loginCard}>
        <p className={styles.eyebrow}>QK COSMETIC · CONTROL</p>
        <h1>Управление каталогом</h1>
        <p>Войдите с серверной учётной записью. Пароль не хранится в браузере и не включён в сборку сайта.</p>
        <form onSubmit={login} className={styles.loginForm}>
          <label>Логин<input name="username" autoComplete="username" required /></label>
          <label>Пароль<input name="password" type="password" autoComplete="current-password" required /></label>
          <button disabled={saving}>{saving ? "Входим…" : "Войти"}</button>
          {message && <p className={styles.error} role="alert">{message}</p>}
        </form>
      </section>
    );
  }

  return (
    <div className={styles.adminApp}>
      <a className={styles.skipLink} href="#admin-content">К основному содержимому</a>
      <aside className={styles.sidebar}>
        <div className={styles.brandMark}><span>QK</span><div><strong>Cosmetic</strong><small>Control room</small></div></div>
        <nav className={styles.sideNav} aria-label="Разделы управления">
          <button aria-label="Обзор" aria-current={view === "overview" ? "page" : undefined} onClick={() => setView("overview")}><AdminIcon name="overview" /><span>Обзор</span></button>
          <button aria-label="Каталог" aria-current={view === "catalog" ? "page" : undefined} onClick={() => openCatalog(statusFilter, brandFilter)}><AdminIcon name="catalog" /><span>Каталог</span><small>{products.length}</small></button>
          <button aria-label="Интеграции" aria-current={view === "integrations" ? "page" : undefined} onClick={openIntegrations}><AdminIcon name="integrations" /><span>Интеграции</span></button>
        </nav>
        <div className={styles.sidebarAccount}>
          <div><span>{session.username.slice(0, 1).toUpperCase()}</span><p><strong>{session.username}</strong><small>Администратор</small></p></div>
          <button aria-label="Выйти" onClick={logout}><AdminIcon name="logout" /><span>Выйти</span></button>
        </div>
      </aside>
      <section className={styles.mainArea} id="admin-content" tabIndex={-1}>
        <header className={styles.topbar}>
          <div><p className={styles.eyebrow}>QK COSMETIC · ADMIN</p><h1>{view === "overview" ? "Обзор магазина" : view === "catalog" ? "Управление каталогом" : "Интеграции"}</h1></div>
          <span className={styles.liveState}><i />Защищённая сессия</span>
        </header>

        {view === "overview" && <AdminDashboard products={products} onOpenCatalog={openCatalog} />}

        {view === "catalog" && (
          <div className={styles.catalogView}>
            <section className={styles.filterBar} aria-label="Фильтры каталога">
              <label className={styles.searchField}><span className={styles.srOnly}>Поиск товаров</span><AdminIcon name="search" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Название, SKU или ID" /></label>
              <label><span>Бренд</span><select value={brandFilter} onChange={(event) => setBrandFilter(event.target.value)}><option value="all">Все бренды</option>{brandGroups.map((brand) => <option key={brand.id} value={brand.id}>{brand.label}</option>)}</select></label>
              <label><span>Статус</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as CatalogStatusFilter)}><option value="all">Все товары</option><option value="published">Опубликовано</option><option value="new">Новинки</option><option value="discount">Со скидкой</option></select></label>
              <button className={styles.addProduct} onClick={() => { startCreate(); setView("catalog"); }}>+ Добавить товар</button>
            </section>
            <div className={styles.workspace}>
              <aside className={styles.catalogPanel}>
                <div className={styles.panelTitle}><div><p className={styles.eyebrow}>РЕЗУЛЬТАТ</p><h2>{visibleProductCount} из {products.length}</h2></div></div>
                <div className={styles.productList}>
                  {visibleProductGroups.map((group) => (
                    <section className={styles.productGroup} key={group.id} aria-labelledby={`brand-${group.id}`}>
                      <h3 id={`brand-${group.id}`}><span>{group.label}</span><small>{group.products.length}</small></h3>
                      {group.products.map((product) => (
                        <button key={product.id} className={`${styles.productRow} ${selectedId === product.id ? styles.selected : ""}`} onClick={() => chooseProduct(product)}>
                          <span className={styles.productIdentity}><b>{product.compactTitle}</b><small>SKU {product.sku} · ID {product.id}</small><span className={styles.productFlags}>{product.active ? <i>Опубликован</i> : <i>Скрыт</i>}{product.isNew && <i>Новинка</i>}{product.isDiscount && <i>Скидка</i>}</span></span>
                          <span className={styles.price}>{product.compareAtPrice && <s>{product.compareAtPrice.toLocaleString("ru-RU")} ₽</s>}<strong>{product.price.toLocaleString("ru-RU")} ₽</strong></span>
                        </button>
                      ))}
                    </section>
                  ))}
                  {!visibleProductCount && <div className={styles.empty}><strong>Товары не найдены</strong><p>Измените поиск или фильтры. Данные каталога не изменялись.</p></div>}
                </div>
              </aside>
              <section className={styles.editorPanel}>
                <div className={styles.panelTitle}><div><p className={styles.eyebrow}>{selected ? `ID ${selected.id} · ВЕРСИЯ ${selected.revision}` : "НОВЫЙ ТОВАР"}</p><h2>{selected ? selected.compactTitle : "Добавление товара"}</h2></div></div>
                <form onSubmit={save} className={styles.editorForm}>
                  <div className={styles.twoColumns}>
                    <label>ID<input type="number" min="1" value={draft.id || ""} disabled={Boolean(selected)} onChange={(event) => update("id", Number(event.target.value))} required /></label>
                    <label>SKU<input value={draft.sku} onChange={(event) => update("sku", event.target.value)} required /></label>
                    <label>Бренд<input value={draft.brand} onChange={(event) => update("brand", event.target.value)} required /></label>
                    <label>Короткое название<input value={draft.compactTitle} onChange={(event) => update("compactTitle", event.target.value)} required /></label>
                  </div>
                  <label>Полное название<input value={draft.title} onChange={(event) => update("title", event.target.value)} required /></label>
                  <div className={styles.twoColumns}>
                    <label>Категория / тег<input value={draft.tag} onChange={(event) => update("tag", event.target.value)} required /></label>
                    <label>Путь к изображению<input value={draft.image} onChange={(event) => update("image", event.target.value)} required /><small>Только опубликованный локальный файл `/assets/…`; загрузка медиа появится отдельным защищённым модулем.</small></label>
                    <label>Текущая цена, ₽<input type="number" min="0" step="1" value={draft.price} onChange={(event) => update("price", Number(event.target.value))} required /></label>
                    <label>Старая цена, ₽<input type="number" min="0" step="1" value={draft.compareAtPrice} disabled={!draft.isDiscount} onChange={(event) => update("compareAtPrice", event.target.value === "" ? "" : Number(event.target.value))} /></label>
                  </div>
                  <div className={styles.toggles}>
                    <label><input type="checkbox" checked={draft.isNew} onChange={(event) => update("isNew", event.target.checked)} /><span>Новинка</span></label>
                    <label><input type="checkbox" checked={draft.isDiscount} onChange={(event) => { update("isDiscount", event.target.checked); if (!event.target.checked) update("compareAtPrice", ""); }} /><span>Скидка</span></label>
                    <label><input type="checkbox" checked={draft.active} onChange={(event) => update("active", event.target.checked)} /><span>Опубликован</span></label>
                  </div>
                  <div className={styles.saveRow}><button disabled={saving}>{saving ? "Сохраняем…" : selected ? "Сохранить изменения" : "Добавить товар"}</button>{message && <p role="status" aria-live="polite">{message}</p>}</div>
                </form>
              </section>
            </div>
          </div>
        )}

        {view === "integrations" && <AdminIntegrations integrations={integrations} messages={integrationMessages} checkingId={checkingIntegration} onCheck={checkConnection} />}
      </section>
    </div>
  );
}
