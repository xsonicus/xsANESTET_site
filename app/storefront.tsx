"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowIcon, BagIcon, CloseIcon, MinusIcon, PlusIcon, SparkIcon } from "./icons";
import { formatPrice, products } from "./products";

type CartLine = { id: number; quantity: number };

const CART_STORAGE_KEY = "anestet-cart-v1";
const SITE_RELEASE = "2026.08.28-v10.2";
const GITHUB_RELEASES_URL = "https://github.com/xsonicus/xsANESTET_site/releases";
const productIds = new Set(products.map((product) => product.id));

function parseStoredCart(value: string | null): CartLine[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((line) => {
      if (!line || typeof line !== "object") return [];
      const { id, quantity } = line as Partial<CartLine>;
      if (typeof id !== "number" || !productIds.has(id) || typeof quantity !== "number") return [];
      return [{ id, quantity: Math.min(99, Math.max(1, Math.floor(quantity))) }];
    });
  } catch {
    return [];
  }
}

const themes = [
  { id: "clinical", number: "01", title: "Clinical Luxe", note: "светлая / точность / стекло" },
  { id: "serum", number: "02", title: "Chromatic Serum", note: "тёмная / navy / глубина" },
] as const;

type ThemeId = (typeof themes)[number]["id"];

const themeCopy: Record<ThemeId, { eyebrow: string; title: string; accent: string; lead: string }> = {
  clinical: {
    eyebrow: "Профессиональный уход · Москва",
    title: "Точная формула",
    accent: "успокоенной кожи",
    lead: "Средства для ухода до и после косметологических процедур — с понятной навигацией по этапам и форматам.",
  },
  serum: {
    eyebrow: "Ночная лаборатория · Professional care",
    title: "Точная формула",
    accent: "успокоенной кожи",
    lead: "Профессиональные формулы ANESTET для подготовки кожи, сопровождения процедуры и восстановления после ухода.",
  },
};

const careStages = [
  {
    number: "01",
    id: "guide-preparation",
    title: "Подготовка",
    description: "Средства до процедуры",
    brands: "ANESTET · FION · LIGHT DEP · LIGHT FROST",
    purpose: "Первичные охлаждающие гели и кремы используют для подготовки кожи перед косметологическими и эстетическими процедурами.",
    points: [
      "Базовая формула: ANESTET base или Light Dep для стандартного сценария подготовки.",
      "Усиленная формула: FION ultra, Light Dep Professional или Light Frost, когда важны более быстрое начало действия и плотная текстура.",
      "Формат: 30 мл — компактный объём; 75–150 мл — регулярная работа; 300–400 мл — профессиональный запас.",
    ],
    lines: ["ANESTET base", "FION ultra", "Light Dep", "Light Frost", "Анестодерм", "Mildep"],
  },
  {
    number: "02",
    id: "guide-secondary",
    title: "Второй этап",
    description: "Продолжение процедуры",
    brands: "ANESTET BASE · FION ULTRA",
    purpose: "Средства второго этапа в исходном каталоге предназначены для использования после первичного средства во время процедуры.",
    points: [
      "ANESTET base — базовый вариант второго этапа.",
      "FION ultra — усиленная формула линейки второго этапа.",
      "Объёмы 5 мл подходят для точечной работы, 30 мл — для регулярного профессионального использования.",
    ],
    lines: ["2 base · 5 мл", "2 base · 30 мл", "FION 2 ultra · 5 мл", "FION 2 ultra · 30 мл"],
  },
  {
    number: "03",
    id: "guide-recovery",
    title: "Восстановление",
    description: "Уход после процедуры",
    brands: "QUEEN KEY · RECOVERY CARE",
    purpose: "Восстанавливающие средства помогают вернуть коже увлажнённость и комфорт после ухода.",
    points: [
      "Repair Cream with Ceramide — для лица: церамиды поддерживают липидный барьер, масла и сквален питают кожу.",
      "Recovery Milk с Д-пантенолом — для тела: увлажнение, питание и смягчение кожи.",
      "Выбирайте формат по зоне применения: средство для лица или средство для тела.",
    ],
    lines: ["Ceramide Repair · лицо", "Recovery Milk · тело", "Д-пантенол", "масло ши", "бисаболол"],
  },
] as const;

const proof = [
  { value: "23", label: "позиции в текущем каталоге" },
  { value: "3", label: "этапа понятного выбора" },
  { value: "7", label: "деклараций соответствия" },
];

const queenKeyHeroProducts = [60, 42].flatMap((id) => {
  const product = products.find((item) => item.id === id);
  return product ? [product] : [];
});

type ShoppingMode = "catalog" | "guide";
type SiteMode = "onepage" | "full";

export default function Storefront() {
  const [theme, setTheme] = useState<ThemeId>("clinical");
  const [followsSystemTheme, setFollowsSystemTheme] = useState(true);
  const [filter, setFilter] = useState("Все");
  const [shoppingMode, setShoppingMode] = useState<ShoppingMode>("catalog");
  const [siteMode, setSiteMode] = useState<SiteMode>("full");
  const [heroProductIndex, setHeroProductIndex] = useState(0);
  const [heroCarouselPaused, setHeroCarouselPaused] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartReady, setCartReady] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const cartDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const requestedMode = new URLSearchParams(window.location.search).get("site");
    setSiteMode(requestedMode === "onepage" ? "onepage" : "full");
  }, []);

  useEffect(() => {
    try {
      setCart(parseStoredCart(window.localStorage.getItem(CART_STORAGE_KEY)));
    } catch {
      setCart([]);
    }
    setCartReady(true);
  }, []);

  useEffect(() => {
    if (!cartReady) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // The cart stays functional for this visit when browser storage is unavailable.
    }
  }, [cart, cartReady]);

  useEffect(() => {
    const dialog = cartDialogRef.current;
    if (!dialog) return;
    if (cartOpen && !dialog.open) dialog.showModal();
    if (!cartOpen && dialog.open) dialog.close();

    const previousOverflow = document.body.style.overflow;
    if (cartOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [cartOpen]);

  useEffect(() => {
    if (heroCarouselPaused || queenKeyHeroProducts.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = window.setInterval(() => {
      if (!document.hidden) {
        setHeroProductIndex((current) => (current + 1) % queenKeyHeroProducts.length);
      }
    }, 4600);
    return () => window.clearInterval(interval);
  }, [heroCarouselPaused]);

  useEffect(() => {
    if (!followsSystemTheme) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applySystemTheme = () => setTheme(media.matches ? "serum" : "clinical");
    applySystemTheme();
    media.addEventListener("change", applySystemTheme);
    return () => media.removeEventListener("change", applySystemTheme);
  }, [followsSystemTheme]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((node) => node.dataset.visible = "true");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).dataset.visible = "true";
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.12 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [theme, filter, shoppingMode]);

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>("[data-motion]");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const refresh = () => nodes.forEach((node) => {
      node.dataset.active = String(node.dataset.inView === "true" && !document.hidden);
    });
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          (entry.target as HTMLElement).dataset.inView = String(entry.isIntersecting);
        });
        refresh();
      },
      { threshold: 0.08 },
    );
    nodes.forEach((node) => observer.observe(node));
    document.addEventListener("visibilitychange", refresh);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [theme, shoppingMode]);

  const filters = ["Все", "ANESTET", "LIGHT DEP", "Уход"];
  const visibleProducts = useMemo(() => {
    if (filter === "Все") return products;
    if (filter === "Уход") return products.filter((product) => [42, 58, 60].includes(product.id));
    return products.filter((product) => product.brand === filter || (filter === "LIGHT DEP" && product.brand.startsWith("LIGHT DEP")));
  }, [filter]);

  const copy = themeCopy[theme];
  const heroProduct = (queenKeyHeroProducts[heroProductIndex] ?? queenKeyHeroProducts[0])!;
  const cartEntries = useMemo(() => cart.flatMap((line) => {
    const product = products.find((item) => item.id === line.id);
    return product ? [{ ...line, product }] : [];
  }), [cart]);
  const cartCount = cart.reduce((total, line) => total + line.quantity, 0);
  const cartSubtotal = cartEntries.reduce((total, line) => total + line.product.price * line.quantity, 0);
  const checkoutHref = useMemo(() => {
    const lines = cartEntries.map(({ product, quantity }) => `• ${product.compactTitle} — ${quantity} × ${formatPrice(product.price)}`);
    const message = [
      "Здравствуйте! Хочу оформить заказ ANESTET:",
      "",
      ...lines,
      "",
      `Итого: ${formatPrice(cartSubtotal)}`,
      "",
      "Подскажите, пожалуйста, условия оплаты и доставки.",
    ].join("\n");
    return `https://wa.me/79101774142?text=${encodeURIComponent(message)}`;
  }, [cartEntries, cartSubtotal]);

  const addToCart = (id: number) => setCart((current) => {
    const existing = current.find((line) => line.id === id);
    if (!existing) return [...current, { id, quantity: 1 }];
    return current.map((line) => line.id === id ? { ...line, quantity: Math.min(99, line.quantity + 1) } : line);
  });
  const changeCartQuantity = (id: number, delta: number) => setCart((current) => current.flatMap((line) => {
    if (line.id !== id) return [line];
    const quantity = line.quantity + delta;
    return quantity > 0 ? [{ ...line, quantity: Math.min(99, quantity) }] : [];
  }));
  const removeFromCart = (id: number) => setCart((current) => current.filter((line) => line.id !== id));
  const showHeroProduct = (direction: number) => setHeroProductIndex((current) => (
    current + direction + queenKeyHeroProducts.length
  ) % queenKeyHeroProducts.length);
  const chooseSiteMode = (mode: SiteMode) => {
    setSiteMode(mode);
    const url = new URL(window.location.href);
    url.searchParams.set("site", mode);
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  };

  return (
    <main className="site-shell">
      <a className="skip-link" href="#shopping">К выбору товаров</a>

      <nav className="site-mode-switcher" aria-label="Версия сайта">
        <span>Версия сайта</span>
        <a href="https://qkcosmetic.ru/">Было</a>
        <button type="button" className={siteMode === "onepage" ? "active" : ""} aria-pressed={siteMode === "onepage"} onClick={() => chooseSiteMode("onepage")}>Одностраничный</button>
        <button type="button" className={siteMode === "full" ? "active" : ""} aria-pressed={siteMode === "full"} onClick={() => chooseSiteMode("full")}>Полный сайт</button>
      </nav>

      <div className="design-switcher" aria-label="Выбор визуальной версии">
        <button
          className={followsSystemTheme ? "switcher-kicker active" : "switcher-kicker"}
          type="button"
          aria-pressed={followsSystemTheme}
          onClick={() => setFollowsSystemTheme(true)}
        >
          {followsSystemTheme ? "Авто · тема браузера" : "Включить авто-тему"}
        </button>
        <div className="switcher-options" role="radiogroup" aria-label="Визуальная версия сайта">
          {themes.map((item) => (
            <button
              type="button"
              key={item.id}
              role="radio"
              aria-checked={theme === item.id}
              className={theme === item.id ? "theme-button active" : "theme-button"}
              onClick={() => {
                setFollowsSystemTheme(false);
                setTheme(item.id);
              }}
            >
              <span>{item.number}</span>
              <strong>{item.title}</strong>
              <small>{item.note}</small>
            </button>
          ))}
        </div>
      </div>

      <header className="site-header">
        <a className="wordmark" href="#top">
          <Image className="brand-logo" src="/assets/img/anestet-logo-2024-blue.png" alt="ANESTET" width={2709} height={1042} loading="eager" />
        </a>
        <nav aria-label="Главное меню">
          <a href="#shopping" onClick={() => setShoppingMode("catalog")}>Каталог</a>
          <a href="#shopping" onClick={() => setShoppingMode("guide")}>Система ухода</a>
          <a href="#proof">О бренде</a>
        </nav>
        <button
          className="cart-button"
          type="button"
          aria-label={`Корзина ${String(cartCount).padStart(2, "0")}: открыть, ${cartCount} товаров`}
          aria-haspopup="dialog"
          aria-expanded={cartOpen}
          onClick={() => setCartOpen(true)}
        >
          <BagIcon />
          <span>{String(cartCount).padStart(2, "0")}</span>
        </button>
      </header>

      <dialog
        className="cart-dialog"
        ref={cartDialogRef}
        aria-labelledby="cart-title"
        onCancel={() => setCartOpen(false)}
        onClose={() => setCartOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setCartOpen(false);
        }}
      >
        <div className="cart-panel">
          <header className="cart-panel-header">
            <div>
              <p>Корзина / {String(cartCount).padStart(2, "0")}</p>
              <h2 id="cart-title">Ваш заказ</h2>
            </div>
            <button type="button" className="cart-close" onClick={() => setCartOpen(false)} aria-label="Закрыть корзину">
              <CloseIcon size={22} />
            </button>
          </header>

          {cartEntries.length === 0 ? (
            <div className="cart-empty">
              <BagIcon size={34} title="" />
              <h3>Корзина пока пуста</h3>
              <p>Добавьте подходящие средства из каталога — выбранные позиции сохранятся в браузере.</p>
              <a href="#shopping" onClick={() => { setShoppingMode("catalog"); setCartOpen(false); }}>Перейти к каталогу <ArrowIcon /></a>
            </div>
          ) : (
            <>
              <div className="cart-lines" aria-live="polite">
                {cartEntries.map(({ product, quantity }) => (
                  <article className="cart-line" key={product.id}>
                    <div className="cart-line-image">
                      <Image src={product.image} alt="" width={180} height={180} />
                    </div>
                    <div className="cart-line-copy">
                      <p>{product.brand}</p>
                      <h3>{product.compactTitle}</h3>
                      <strong>{formatPrice(product.price * quantity)}</strong>
                      <div className="cart-line-actions">
                        <div className="quantity-control" aria-label={`Количество: ${product.compactTitle}`}>
                          <button type="button" onClick={() => changeCartQuantity(product.id, -1)} aria-label={`Уменьшить количество ${product.compactTitle}`}><MinusIcon /></button>
                          <output aria-live="polite">{quantity}</output>
                          <button type="button" onClick={() => changeCartQuantity(product.id, 1)} aria-label={`Увеличить количество ${product.compactTitle}`}><PlusIcon /></button>
                        </div>
                        <button type="button" className="cart-remove" onClick={() => removeFromCart(product.id)}>Удалить</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <footer className="cart-summary">
                <div><span>Товары · {cartCount}</span><strong>{formatPrice(cartSubtotal)}</strong></div>
                <p>Оплата и доставка подтверждаются менеджером после отправки состава заказа.</p>
                <a className="cart-checkout" href={checkoutHref} target="_blank" rel="noreferrer">
                  Оформить в WhatsApp <ArrowIcon />
                </a>
                <button type="button" className="cart-clear" onClick={() => setCart([])}>Очистить корзину</button>
              </footer>
            </>
          )}
        </div>
      </dialog>

      <section className="hero" id="top" aria-labelledby="hero-title" data-motion>
        <div className="hero-atmosphere" aria-hidden="true">
          <span className="serum-orb serum-orb-a" />
          <span className="serum-orb serum-orb-b" />
          <span className="clinical-grid" />
        </div>
        <div className="hero-brand-rail" aria-hidden="true">
          <div className="hero-brand-track">
            {[0, 1].map((group) => (
              <div className="hero-brand-group" key={group}>
                <Image src="/assets/img/anestet-logo-2024-blue.png" alt="" width={2709} height={1042} />
                <span>CLINICAL CARE</span>
                <span>PROFESSIONAL CARE</span>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-brand-rail hero-brand-rail-secondary" aria-hidden="true">
          <div className="hero-brand-track hero-brand-track-secondary">
            {[0, 1].map((group) => (
              <div className="hero-brand-group hero-brand-group-secondary" key={group}>
                <Image className="hero-brand-secondary-logo" src="/assets/img/anestet-logo-2024-blue.png" alt="" width={2709} height={1042} />
              </div>
            ))}
          </div>
        </div>
        <div className="hero-copy" data-reveal data-visible="true">
          <p className="eyebrow"><SparkIcon /> {copy.eyebrow}</p>
          <h1 id="hero-title">{copy.title}<em>{copy.accent}</em></h1>
          <p className="hero-lead">{copy.lead}</p>
          <div className="hero-actions">
            <a className="primary-action" href="#shopping" onClick={() => setShoppingMode("catalog")}>Выбрать средство <ArrowIcon /></a>
            <a className="text-action" href="#shopping" onClick={() => setShoppingMode("guide")}>Как выбрать</a>
          </div>
        </div>
        <div
          className="hero-product"
          data-reveal
          data-visible="true"
          onMouseEnter={() => setHeroCarouselPaused(true)}
          onMouseLeave={() => setHeroCarouselPaused(false)}
          onFocus={() => setHeroCarouselPaused(true)}
          onBlur={() => setHeroCarouselPaused(false)}
        >
          <div className="product-halo" aria-hidden="true" />
          <p className="hero-product-code">QK / NEW / {heroProduct.id}</p>
          <Image
            className="hero-product-image"
            key={heroProduct.id}
            src={heroProduct.image}
            alt={heroProduct.title}
            width={900}
            height={900}
            loading="eager"
            fetchPriority="high"
          />
          <div className="hero-product-controls" aria-label="Новые продукты Queen Key">
            <button type="button" className="previous" onClick={() => showHeroProduct(-1)} aria-label="Предыдущий продукт"><ArrowIcon /></button>
            <span>{String(heroProductIndex + 1).padStart(2, "0")} / {String(queenKeyHeroProducts.length).padStart(2, "0")}</span>
            <button type="button" onClick={() => showHeroProduct(1)} aria-label="Следующий продукт"><ArrowIcon /></button>
          </div>
          <div className="hero-product-label" aria-live="polite">
            <span>{heroProduct.tag}</span>
            <strong>{heroProduct.compactTitle}</strong>
            <span>{formatPrice(heroProduct.price)}</span>
            <button type="button" className="hero-product-add" onClick={() => addToCart(heroProduct.id)}>
              В корзину <BagIcon size={16} title="" />
            </button>
          </div>
        </div>
        <p className="hero-side-note">Профессиональные формулы<br />для ежедневной практики</p>
        <div className="scroll-cue" aria-hidden="true"><span /> Листайте</div>
      </section>

      {siteMode === "full" ? <section className="shopping-navigation" id="shopping" aria-labelledby="shopping-title">
        <div>
          <p className="section-index">Быстрый маршрут</p>
          <h2 id="shopping-title">Сразу купить<br />или подобрать</h2>
        </div>
        <div className="shopping-tabs" role="group" aria-label="Режим просмотра магазина">
          <button id="shopping-tab-catalog" type="button" aria-pressed={shoppingMode === "catalog"} className={shoppingMode === "catalog" ? "active" : ""} onClick={() => setShoppingMode("catalog")}>
            <span>01</span><strong>Каталог товаров</strong><small>Для тех, кто уже знает, что нужно</small>
          </button>
          <button id="shopping-tab-guide" type="button" aria-pressed={shoppingMode === "guide"} className={shoppingMode === "guide" ? "active" : ""} onClick={() => setShoppingMode("guide")}>
            <span>02</span><strong>Подбор по этапам</strong><small>Понятный маршрут до, во время и после процедуры</small>
          </button>
        </div>
      </section> : <div className="onepage-anchor" id="shopping" />}

      {(shoppingMode === "guide" || siteMode === "onepage") && (
        <div id="shopping-panel-guide" role="region" aria-label="Подбор средств по этапам">
        <section className="care-system" id="system">
        <div className="section-heading" data-reveal>
          <p className="section-index">Система / 01—03</p>
          <h2>Выбор по этапу, не по догадке</h2>
          <p>Вместо длинной витрины — три ясные задачи. Это помогает быстрее найти подходящий формат и объём.</p>
        </div>
        <div className="care-steps" data-motion>
          {careStages.map((stage) => (
            <a key={stage.number} className="care-step" href={`#${stage.id}`} data-reveal aria-label={`${stage.title}: открыть подробный выбор`}>
              <span className="step-glint" aria-hidden="true" />
              <span className="step-number">{stage.number}</span>
              <h3>{stage.title}</h3>
              <p>{stage.description}</p>
              <small>{stage.brands}</small>
              <ArrowIcon />
            </a>
          ))}
        </div>
      </section>

      <section className="selection-guide" id="guide" aria-labelledby="guide-title">
        <div className="guide-heading" data-reveal>
          <p className="section-index">Как выбрать / полный маршрут</p>
          <h2 id="guide-title">Сначала задача.<br />Затем формула.</h2>
          <p>Выберите момент применения, формат работы и зону ухода. Ниже — подробная навигация по данным и описаниям текущего каталога ANESTET.</p>
        </div>

        <div className="guide-route" aria-hidden="true" data-motion>
          <span>01</span><i /><span>02</span><i /><span>03</span>
        </div>

        <div className="guide-stages">
          {careStages.map((stage) => (
            <article className="guide-stage" id={stage.id} key={stage.id} data-reveal>
              <header>
                <span>{stage.number}</span>
                <div>
                  <p>{stage.description}</p>
                  <h3>{stage.title}</h3>
                </div>
              </header>
              <div className="guide-stage-copy">
                <p className="guide-purpose">{stage.purpose}</p>
                <ul>
                  {stage.points.map((point) => <li key={point}>{point}</li>)}
                </ul>
                <div className="guide-lines" aria-label={`Линейки: ${stage.lines.join(", ")}`}>
                  {stage.lines.map((line) => <span key={line}>{line}</span>)}
                </div>
                <a className="guide-action" href="#shopping" onClick={() => setShoppingMode("catalog")}>
                  Перейти к товарам <ArrowIcon />
                </a>
              </div>
            </article>
          ))}
        </div>

        <p className="guide-note" data-reveal>
          Точное назначение, способ применения, время экспозиции и ограничения всегда сверяйте с карточкой конкретного продукта и информацией на упаковке. Профессиональные средства следует применять в соответствии с инструкцией производителя.
        </p>
        </section>
        </div>
      )}

      {(shoppingMode === "catalog" || siteMode === "onepage") && (
      <section className="catalog" id="catalog" role="region" aria-label="Каталог товаров">
        <div className="catalog-head" data-reveal>
          <div>
            <p className="section-index">Каталог / избранное</p>
            <h2>Проверенные форматы</h2>
          </div>
          <p>Реальные товары и цены из текущего интернет-магазина.</p>
        </div>
        <div className="filters" role="group" aria-label="Фильтр каталога" data-reveal>
          {filters.map((item) => (
            <button type="button" key={item} className={filter === item ? "active" : ""} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>
          ))}
        </div>
        <div className="product-grid" aria-live="polite">
          {visibleProducts.map((product, index) => {
            const cartQuantity = cart.find((line) => line.id === product.id)?.quantity ?? 0;
            return (
              <article className="product-card" key={product.id} data-reveal style={{ "--card-index": index } as React.CSSProperties}>
                <div className="product-media">
                  <span className="product-tag">{product.tag}</span>
                  <Image src={product.image} alt={product.title} width={720} height={720} loading="lazy" />
                </div>
                <button type="button" className={cartQuantity ? "quick-add selected" : "quick-add"} onClick={() => addToCart(product.id)} aria-label={cartQuantity ? `Добавить ещё: ${product.title}. В корзине ${cartQuantity}` : `Добавить ${product.title} в корзину`}>
                  {cartQuantity ? `В корзине · ${cartQuantity}` : "В корзину"}
                  <BagIcon size={18} title="" />
                </button>
                <div className="product-info">
                  <p>{product.brand}</p>
                  <h3>{product.compactTitle}</h3>
                  <strong>{formatPrice(product.price)}</strong>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      )}

      <section className="proof-strip" id="proof" aria-label="Факты о каталоге">
        {proof.map((item) => (
          <div key={item.label} data-reveal>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
        <p data-reveal>Все цифры основаны на текущем каталоге и опубликованных документах сайта.</p>
      </section>

      <section className="evidence" aria-labelledby="evidence-title">
        <div className="evidence-image" data-reveal>
          <Image src="/assets/img/about/anestet-recovery-hand-v2.webp" alt="Восстанавливающие сливки Queen Key в профессиональной beauty-среде" width={1254} height={1254} loading="lazy" />
        </div>
        <div className="evidence-copy" data-reveal>
          <p className="section-index">Прозрачность / документы</p>
          <h2 id="evidence-title">Красота любит доказательства</h2>
          <p>Для ключевых линеек опубликованы декларации соответствия. Документы помогают проверить назначение и происхождение средств перед выбором.</p>
          <a href="https://qkcosmetic.ru/certificates" target="_blank" rel="noreferrer">Посмотреть сертификаты <ArrowIcon /></a>
        </div>
      </section>

      <footer className="footer" data-motion>
        <div className="footer-brand-stage">
          <div className="footer-brand-primary" data-reveal>
            <p className="footer-brand-kicker"><span>ANESTET / PROFESSIONAL CARE</span><span>МОСКВА · 2026</span></p>
            <Image className="footer-anestet-logo" src="/assets/img/anestet-logo-2024-blue.png" alt="ANESTET" width={2709} height={1042} />
            <p className="footer-brand-statement">Профессиональный уход<br />до процедуры, во время и после.</p>
          </div>
          <div className="footer-brand-secondary" data-reveal>
            <div className="footer-brand-orbit" aria-hidden="true">
              <span className="footer-orbit-ring" />
              <Image className="footer-qk-logo" src="/assets/img/queen-key-logo-original.png" alt="" width={3188} height={3677} />
            </div>
            <p><strong>QUEEN KEY</strong><span>PROFESSIONAL CARE</span></p>
          </div>
        </div>
        <div className="footer-marquee" aria-hidden="true">
          <div className="footer-marquee-track">
            {[0, 1].map((group) => (
              <div className="footer-marquee-group" key={group}>
                <Image src="/assets/img/anestet-logo-2024-blue.png" alt="" width={2709} height={1042} />
                <span>CLINICAL CARE</span>
                <span>PROFESSIONAL CARE</span>
              </div>
            ))}
          </div>
        </div>
        <div className="footer-grid">
          <div><p>Связаться</p><a href="mailto:support@anestet.com">support@anestet.com</a><a href="tel:+79101774142">+7 910 177-41-42</a></div>
          <div><p>Адрес</p><span>Москва, ул. Иловайская,<br />д. 20, корп. 2</span></div>
          <div><p>Режим работы</p><span>Пн—Пт / 09:00—18:00<br />Сб—Вс / выходной</span></div>
          <div><p>Дизайн</p><span>{themes.find((item) => item.id === theme)?.number} / {themes.find((item) => item.id === theme)?.title}</span></div>
        </div>
        <div className="footer-bottom">
          <div>
            <p className="footer-note">ANESTET · профессиональные средства для косметологического ухода</p>
            <a className="site-release-link" href={GITHUB_RELEASES_URL} target="_blank" rel="noreferrer">Модификация {SITE_RELEASE}</a>
          </div>
          <a href="#top">Наверх <span aria-hidden="true">↑</span></a>
        </div>
      </footer>
    </main>
  );
}
