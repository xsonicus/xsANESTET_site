"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowIcon, BagIcon, CloseIcon, MinusIcon, PlusIcon, SparkIcon } from "./icons";
import { formatPrice, products } from "./products";

type CartLine = { id: number; quantity: number };
type DeliveryId = "pickup" | "moscow-courier" | "cdek-door" | "cdek-pvz" | "ozon-pvz";
type OrderForm = {
  name: string;
  phone: string;
  email: string;
  postalCode: string;
  address: string;
  comment: string;
  delivery: DeliveryId;
  payment: "cash";
};

const CART_STORAGE_KEY = "anestet-cart-v1";
const SITE_RELEASE = "2026.08.28-v11.1.0";
const GITHUB_RELEASES_URL = "https://github.com/xsonicus/xsANESTET_site/releases";
const HERO_WORDMARK_PATH = "M1784 0H1502L1341 344H457L296 0H14L734 1500H1064ZM899 1291 559 562H1239ZM3248 298V1500H3504V0H3168L2222 1216V0H1966V1500H2310ZM4147 640 4081 228H5096V0H3788L3908 750L3788 1500H5086V1272H4081L4147 860H5038V640ZM5548 488Q5560 398 5623 330Q5686 262 5790.5 225Q5895 188 6030 188Q6163 188 6262 216.5Q6361 245 6414.5 298Q6468 351 6468 422Q6468 482 6438.5 520Q6409 558 6341.5 581.5Q6274 605 6154 620L5830 662Q5647 686 5533.5 737Q5420 788 5366 871.5Q5312 955 5312 1078Q5312 1214 5395 1315.5Q5478 1417 5630.5 1472.5Q5783 1528 5986 1528Q6186 1528 6343.5 1468Q6501 1408 6593 1299.5Q6685 1191 6694 1050H6426Q6416 1129 6359 1188Q6302 1247 6204.5 1279.5Q6107 1312 5980 1312Q5858 1312 5766.5 1285Q5675 1258 5625.5 1207Q5576 1156 5576 1088Q5576 1033 5604 997.5Q5632 962 5695.5 938.5Q5759 915 5868 900L6196 854Q6401 826 6516.5 778.5Q6632 731 6682 653Q6732 575 6732 450Q6732 307 6644 198.5Q6556 90 6396 31Q6236 -28 6026 -28Q5812 -28 5645.5 36.5Q5479 101 5383.5 218Q5288 335 5280 488ZM6842 1500H8346V1268H7726V0H7462V1268H6842ZM8853 640 8787 228H9802V0H8494L8614 750L8494 1500H9792V1272H8787L8853 860H9744V640ZM9942 1500H11446V1268H10826V0H10562V1268H9942Z";
const SUPPORT_EMAIL = "support@anestet.com";
const SUPPORT_PHONE = "+7 910 177-41-42";
const initialOrderForm: OrderForm = {
  name: "",
  phone: "",
  email: "",
  postalCode: "",
  address: "",
  comment: "",
  delivery: "pickup",
  payment: "cash",
};
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

const themeCopy: Record<ThemeId, { eyebrow: string; title: string; accent: string; closing: string; lead: string }> = {
  clinical: {
    eyebrow: "Профессиональный уход · Москва",
    title: "Точная формула,",
    accent: "спокойная кожа,",
    closing: "всегда",
    lead: "Уход, который говорит сам за себя. Профессиональные средства до, во время и после косметологических процедур.",
  },
  serum: {
    eyebrow: "Ночная лаборатория · Professional care",
    title: "Точная формула,",
    accent: "спокойная кожа,",
    closing: "всегда",
    lead: "Уход, который говорит сам за себя. Формулы ANESTET для подготовки кожи, сопровождения процедуры и восстановления.",
  },
};

const deliveryOptions: Array<{ id: DeliveryId; title: string; note: string; cost: (subtotal: number) => number | null }> = [
  { id: "pickup", title: "Самовывоз", note: "Москва, ул. Иловайская, д. 20, корп. 2", cost: () => 0 },
  { id: "moscow-courier", title: "Курьер по Москве", note: "500 ₽, бесплатно от 4 000 ₽", cost: (subtotal) => subtotal >= 4000 ? 0 : 500 },
  { id: "cdek-door", title: "CDEK до двери", note: "Стоимость и срок подтверждаются после расчёта CDEK", cost: () => null },
  { id: "cdek-pvz", title: "CDEK до пункта выдачи", note: "Укажите город и удобный ПВЗ в адресе или комментарии", cost: () => null },
  { id: "ozon-pvz", title: "OZON до пункта выдачи", note: "250 ₽, бесплатно от 2 000 ₽", cost: (subtotal) => subtotal >= 2000 ? 0 : 250 },
];

const brandPrinciples = [
  ["Поддержка мастеров", "Профессиональные средства создаются с учётом реальных процедур, особенностей кожи и условий работы мастера."],
  ["Развитие и инновации", "Формулы развиваются на основе опыта специалистов. Так появились FION и Queen Key."],
  ["Честные результаты", "Стабильность и предсказуемость продукта поддерживаются контролем качества в собственной лаборатории."],
  ["Фокус на формуле", "В центре продукта — рабочий состав, эффективность и удобство применения."],
] as const;

const socialCards = [
  { network: "VK", icon: "/assets/icons/social/vk.svg", eyebrow: "Видео", title: "Процедуры и продукты в работе", note: "Официальная видеолента ANESTET", href: "https://vk.com/video/@queenkeyanestet" },
  { network: "VK", icon: "/assets/icons/social/vk.svg", eyebrow: "Новости", title: "Запуски, формулы и события", note: "Сообщество Queen Key × ANESTET", href: "https://vk.com/queenkeyanestet" },
  { network: "Telegram", icon: "/assets/icons/social/telegram.svg", eyebrow: "Канал", title: "Коротко о главном для мастеров", note: "Официальный Telegram ANESTET", href: "https://t.me/Anestetprofessional" },
  { network: "Taplink", icon: "/assets/icons/social/taplink.svg", eyebrow: "Все площадки", title: "Контакты и актуальные ссылки", note: "Официальный Taplink бренда", href: "https://taplink.cc/anestet" },
] as const;

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

const heroProducts = products.filter((product) => product.isNew);
const productPackshot = (id: number) => `/assets/img/optimized/cards/${id}.webp`;

type ShoppingMode = "catalog" | "guide";
type SiteMode = "onepage" | "full";
type CompanySection = "partners" | "delivery" | "certificates" | "contacts";

const companySections: Array<{ id: CompanySection; label: string }> = [
  { id: "partners", label: "Партнёрам" },
  { id: "delivery", label: "Доставка и оплата" },
  { id: "certificates", label: "Сертификаты" },
  { id: "contacts", label: "Контакты" },
];

const partnerLogos = [
  ["golden-apple.png", "Золотое яблоко"], ["pmu-market.png", "PMU Market"],
  ["permanentum.png", "Permanentum"], ["materialova.png", "Materialova"],
  ["aurabeauty.png", "Aura Beauty"], ["tattoo-barracuda.jpg", "Tattoo Barracuda"],
  ["kdv.jpg", "KDV"], ["velvet-handles.png", "Velvet Handles"],
  ["allget-market.png", "Allget Market"], ["browuska.png", "Browuska"],
  ["clinique.png", "Clinique"], ["dom24.png", "DOM 24"],
  ["estetik.png", "Estetik"], ["icolorpmu.png", "iColor PMU"],
  ["inkcastleshop.png", "Ink Castle Shop"], ["permanentlux.png", "Permanent Lux"],
  ["pm-magaz.jpg", "PM Magazin"], ["pm24shop.jpg", "PM24 Shop"],
  ["pro-pmu-shop.jpg", "Pro PMU Shop"], ["shira-studio.jpg", "Shira Studio"],
  ["siberica.png", "Siberica"], ["syndromeshop.png", "Syndrome Shop"],
  ["tatu-shop.png", "Tatu Shop"], ["extreme.png", "Extreme"],
] as const;

const certificateDocuments = [
  ["ds-geli-dlya-pervichnogo-ohlazhdeniya.png", "Гели для первичного охлаждения ANESTET"],
  ["ds-geli-dlya-pervichnogo-ohlazhdeniya-fion.png", "Гели для первичного охлаждения FION"],
  ["ds-geli-dlya-vtorichnogo-ohlazhdeniya.png", "Гели для второго этапа ANESTET"],
  ["ds-geli-dlya-vtorichnogo-ohlazhdeniya-fion.png", "Гели для второго этапа FION"],
  ["ds-krem-queen-key.png", "Крем Queen Key"],
  ["ds-vosstanavlivayushhie-slivki-s-d-pantenolom-queen-key.png", "Восстанавливающие сливки Queen Key"],
  ["ds-delikatnyij-gel-s-romashkoj-queen-key.png", "Деликатный гель с ромашкой Queen Key"],
] as const;

export default function Storefront() {
  const [theme, setTheme] = useState<ThemeId>("clinical");
  const [followsSystemTheme, setFollowsSystemTheme] = useState(true);
  const [filter, setFilter] = useState("Все");
  const [shoppingMode, setShoppingMode] = useState<ShoppingMode>("catalog");
  const [siteMode, setSiteMode] = useState<SiteMode>("full");
  const [companySection, setCompanySection] = useState<CompanySection>("partners");
  const [heroProductIndex, setHeroProductIndex] = useState(0);
  const [heroCarouselPaused, setHeroCarouselPaused] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartReady, setCartReady] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderForm, setOrderForm] = useState<OrderForm>(initialOrderForm);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<{ id?: string; error?: string } | null>(null);
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
    if (heroCarouselPaused || heroProducts.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = window.setInterval(() => {
      if (!document.hidden) {
        setHeroProductIndex((current) => (current + 1) % heroProducts.length);
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
  const heroProduct = (heroProducts[heroProductIndex] ?? heroProducts[0])!;
  const cartEntries = useMemo(() => cart.flatMap((line) => {
    const product = products.find((item) => item.id === line.id);
    return product ? [{ ...line, product }] : [];
  }), [cart]);
  const cartCount = cart.reduce((total, line) => total + line.quantity, 0);
  const cartSubtotal = cartEntries.reduce((total, line) => total + line.product.price * line.quantity, 0);
  const selectedDelivery = deliveryOptions.find((option) => option.id === orderForm.delivery) ?? deliveryOptions[0];
  const deliveryCost = selectedDelivery.cost(cartSubtotal);
  const orderTotal = cartSubtotal + (deliveryCost ?? 0);
  const checkoutHref = useMemo(() => {
    const lines = cartEntries.map(({ product, quantity }) => `• ${product.compactTitle} — ${quantity} × ${formatPrice(product.price)}`);
    const message = [
      "Здравствуйте! Хочу оформить заказ ANESTET:",
      "",
      ...lines,
      "",
      `Товары: ${formatPrice(cartSubtotal)}`,
      `Доставка: ${selectedDelivery.title}${deliveryCost === null ? " — требуется расчёт" : ` — ${formatPrice(deliveryCost)}`}`,
      `Итого без неподтверждённого тарифа: ${formatPrice(orderTotal)}`,
      orderForm.name ? `Получатель: ${orderForm.name}` : "",
      orderForm.phone ? `Телефон: ${orderForm.phone}` : "",
      orderForm.email ? `E-mail: ${orderForm.email}` : "",
      orderForm.postalCode ? `Индекс: ${orderForm.postalCode}` : "",
      orderForm.address ? `Адрес / ПВЗ: ${orderForm.address}` : "",
      orderForm.comment ? `Комментарий: ${orderForm.comment}` : "",
      "",
      "Пожалуйста, подтвердите наличие, итоговую стоимость и срок доставки.",
    ].filter(Boolean).join("\n");
    return `https://wa.me/79101774142?text=${encodeURIComponent(message)}`;
  }, [cartEntries, cartSubtotal, deliveryCost, orderForm, orderTotal, selectedDelivery.title]);

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
  const updateOrderField = <Key extends keyof OrderForm>(key: Key, value: OrderForm[Key]) => {
    setOrderForm((current) => ({ ...current, [key]: value }));
    setOrderResult(null);
  };
  const submitOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cartEntries.length || orderSubmitting) return;
    setOrderSubmitting(true);
    setOrderResult(null);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name: orderForm.name, phone: orderForm.phone, email: orderForm.email },
          delivery: { id: orderForm.delivery, postalCode: orderForm.postalCode, address: orderForm.address },
          payment: orderForm.payment,
          comment: orderForm.comment,
          items: cartEntries.map(({ product, quantity }) => ({ id: product.id, quantity })),
          source: siteMode,
          release: SITE_RELEASE,
        }),
      });
      const contentType = response.headers.get("content-type") || "";
      const result = contentType.includes("application/json")
        ? await response.json() as { ok?: boolean; orderId?: string; error?: string }
        : null;
      if (!result) throw new Error("Сервис оформления временно недоступен. Отправьте заказ через WhatsApp или поддержку.");
      if (!response.ok || !result.ok || !result.orderId) throw new Error(result.error || "Не удалось записать заказ");
      setOrderResult({ id: result.orderId });
    } catch (error) {
      setOrderResult({ error: error instanceof Error ? error.message : "Не удалось записать заказ" });
    } finally {
      setOrderSubmitting(false);
    }
  };
  const showHeroProduct = (direction: number) => setHeroProductIndex((current) => (
    current + direction + heroProducts.length
  ) % heroProducts.length);
  const chooseSiteMode = (mode: SiteMode) => {
    setSiteMode(mode);
    const url = new URL(window.location.href);
    url.searchParams.set("site", mode);
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  };
  const openCompanySection = (section: CompanySection) => {
    setCompanySection(section);
    window.requestAnimationFrame(() => document.querySelector("#company-info")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return (
    <main className="site-shell">
      <a className="skip-link" href="#shopping">К выбору товаров</a>

      <nav className="site-mode-switcher" aria-label="Версия сайта">
        <span>Версия сайта</span>
        <a href="#company-info" onClick={() => openCompanySection("partners")}>Информация</a>
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
        <nav className="primary-nav" aria-label="Главное меню">
          <a href="#shopping" onClick={() => setShoppingMode("catalog")}>Каталог</a>
          <a href="#shopping" onClick={() => setShoppingMode("guide")}>Система ухода</a>
          {siteMode === "full" && <a href="#about">О бренде</a>}
          <a href="#company-info" onClick={() => openCompanySection("contacts")}>Поддержка</a>
        </nav>
        <div className="header-actions">
          <nav className="header-socials" aria-label="Социальные сети и поддержка">
            <a href="https://vk.com/queenkeyanestet" target="_blank" rel="noreferrer" aria-label="ANESTET во ВКонтакте">
              <Image src="/assets/icons/social/vk.svg" alt="" width={24} height={24} aria-hidden="true" />
            </a>
            <a href="https://t.me/Anestetprofessional" target="_blank" rel="noreferrer" aria-label="ANESTET в Telegram">
              <Image src="/assets/icons/social/telegram.svg" alt="" width={24} height={24} aria-hidden="true" />
            </a>
          </nav>
          <a className="header-support-button" href="#company-info" onClick={() => openCompanySection("contacts")} aria-label={`Поддержка — открыть контакты: ${SUPPORT_EMAIL}`}>
            <span>Поддержка</span><small>{SUPPORT_EMAIL}</small>
          </a>
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
        </div>
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

          {orderResult?.id ? (
            <div className="cart-empty cart-success" role="status">
              <SparkIcon />
              <h3>Заказ принят</h3>
              <p>Номер {orderResult.id}. Менеджер проверит наличие, тариф доставки и свяжется с вами для подтверждения.</p>
              <a href={checkoutHref} target="_blank" rel="noreferrer">Продублировать в WhatsApp <ArrowIcon /></a>
              <button type="button" className="cart-clear" onClick={() => { setCart([]); setOrderResult(null); setCheckoutOpen(false); }}>Готово, очистить корзину</button>
            </div>
          ) : cartEntries.length === 0 ? (
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
                      <Image src={productPackshot(product.id)} alt="" width={180} height={180} />
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
                {!checkoutOpen ? (
                  <>
                    <p>Выберите доставку, оставьте контакты и получите номер заказа. Наличие и внешние тарифы подтверждаются менеджером.</p>
                    <button type="button" className="cart-checkout" onClick={() => setCheckoutOpen(true)}>
                      Перейти к оформлению <ArrowIcon />
                    </button>
                  </>
                ) : (
                  <form className="checkout-form" onSubmit={submitOrder}>
                    <fieldset>
                      <legend>Способы доставки</legend>
                      <div className="delivery-options">
                        {deliveryOptions.map((option) => (
                          <label key={option.id} className={orderForm.delivery === option.id ? "selected" : ""}>
                            <input type="radio" name="delivery" value={option.id} checked={orderForm.delivery === option.id} onChange={() => updateOrderField("delivery", option.id)} />
                            <span><strong>{option.title}</strong><small>{option.note}</small></span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <fieldset>
                      <legend>Получатель и адрес</legend>
                      <div className="checkout-fields">
                        <label><span>Имя *</span><input required autoComplete="name" value={orderForm.name} onChange={(event) => updateOrderField("name", event.target.value)} /></label>
                        <label><span>Телефон *</span><input required type="tel" autoComplete="tel" placeholder="+7 999 000-00-00" value={orderForm.phone} onChange={(event) => updateOrderField("phone", event.target.value)} /></label>
                        <label><span>E-mail *</span><input required type="email" autoComplete="email" value={orderForm.email} onChange={(event) => updateOrderField("email", event.target.value)} /></label>
                        {orderForm.delivery !== "pickup" && <label><span>Почтовый индекс</span><input inputMode="numeric" autoComplete="postal-code" value={orderForm.postalCode} onChange={(event) => updateOrderField("postalCode", event.target.value)} /></label>}
                        {orderForm.delivery !== "pickup" && <label className="wide"><span>Адрес доставки / выбранный ПВЗ *</span><textarea required autoComplete="street-address" value={orderForm.address} onChange={(event) => updateOrderField("address", event.target.value)} /></label>}
                        <label className="wide"><span>Комментарий</span><textarea value={orderForm.comment} onChange={(event) => updateOrderField("comment", event.target.value)} /></label>
                      </div>
                    </fieldset>
                    <fieldset>
                      <legend>Способ оплаты</legend>
                      <label className="payment-option selected"><input type="radio" name="payment" checked readOnly /><span><strong>Оплата при подтверждении</strong><small>Менеджер согласует доступный способ после проверки заказа</small></span></label>
                    </fieldset>
                    <div className="checkout-total">
                      <span>Доставка</span><strong>{deliveryCost === null ? "По тарифу" : formatPrice(deliveryCost)}</strong>
                      <span>Предварительный итог</span><strong>{formatPrice(orderTotal)}</strong>
                    </div>
                    {orderResult?.error && <p className="checkout-error" role="alert">{orderResult.error}. Можно отправить заказ через WhatsApp ниже.</p>}
                    <button className="cart-checkout" type="submit" disabled={orderSubmitting}>{orderSubmitting ? "Записываем заказ…" : "Подтвердить заказ"}<ArrowIcon /></button>
                    <a className="checkout-fallback" href={checkoutHref} target="_blank" rel="noreferrer">Или отправить в WhatsApp</a>
                    <p className="checkout-legal">Отправляя форму, вы соглашаетесь на обработку данных для оформления и обратной связи по заказу.</p>
                  </form>
                )}
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
                <svg className="hero-brand-logo-stencil" viewBox="0 0 11478 1556" aria-hidden="true" focusable="false">
                  <path d={HERO_WORDMARK_PATH} transform="translate(0 1528) scale(1 -1)" />
                </svg>
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
                <svg className="hero-brand-logo-stencil hero-brand-secondary-logo" viewBox="0 0 11478 1556" aria-hidden="true" focusable="false">
                  <path d={HERO_WORDMARK_PATH} transform="translate(0 1528) scale(1 -1)" />
                </svg>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-copy" data-reveal data-visible="true">
          <p className="eyebrow"><SparkIcon /> {copy.eyebrow}</p>
          <h1 id="hero-title"><span className="hero-title-opening">{copy.title}</span><em>{copy.accent}</em><span className="hero-title-closing">{copy.closing}</span></h1>
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
          <p className="hero-product-code">{heroProduct.brand} / NEW / {heroProduct.id}</p>
          <div className="hero-packshot-frame">
            <Image
              className="hero-product-image"
              key={heroProduct.id}
              src={productPackshot(heroProduct.id)}
              alt={heroProduct.title}
              fill
              sizes="(max-width: 760px) 92vw, 46vw"
              loading="eager"
              fetchPriority="high"
              style={{ "--hero-product-scale": heroProduct.heroScale ?? 1 } as React.CSSProperties}
            />
          </div>
          <div className="hero-product-controls" aria-label="Все новинки ANESTET">
            <button type="button" className="previous" onClick={() => showHeroProduct(-1)} aria-label="Предыдущий продукт"><ArrowIcon /></button>
            <span>{String(heroProductIndex + 1).padStart(2, "0")} / {String(heroProducts.length).padStart(2, "0")}</span>
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
        <p className="hero-side-note">Профессиональные формулы<br />{" "}для ежедневной практики</p>
        <div className="scroll-cue" aria-hidden="true"><span /> Листайте</div>
      </section>

      {siteMode === "full" ? <section className="shopping-navigation" id="shopping" aria-labelledby="shopping-title">
        <div>
          <p className="section-index">Быстрый маршрут</p>
          <h2 id="shopping-title">Сразу купить<br />{" "}или подобрать</h2>
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
          <h2 id="guide-title">Сначала задача.<br />{" "}Затем формула.</h2>
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
                  {product.isNew && <span className="product-new">Новинка</span>}
                  <div className="product-packshot-frame">
                    <Image src={productPackshot(product.id)} alt={product.title} fill sizes="(max-width: 390px) 100vw, (max-width: 760px) 50vw, (max-width: 1100px) 33vw, 25vw" loading="lazy" />
                  </div>
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

      {siteMode === "full" && (
        <section className="about-brand" id="about" aria-labelledby="about-title">
          <div className="about-portrait" data-reveal>
            <span className="about-year">2016—2026</span>
            <Image src="/assets/img/partners/alexander-portrait-hq-v2.webp" alt="Александр, представитель ANESTET" width={1363} height={1154} loading="lazy" />
          </div>
          <div className="about-copy" data-reveal>
            <p className="section-index">О бренде / собственная лаборатория</p>
            <h2 id="about-title">Создаём то, что нужно вашей работе</h2>
            <p className="about-intro">Мы начали путь в 2016 году с профессиональных средств для мастеров перманента и косметологов. В 2024 году появились FION — развитие формул ANESTET — и Queen Key, премиальная уходовая косметика для лица. Продукты разрабатываются и производятся в собственной лаборатории в Москве с контролем качества на каждом этапе.</p>
            <div className="about-principles">
              {brandPrinciples.map(([title, text], index) => (
                <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{text}</p></div></article>
              ))}
            </div>
            <nav className="brand-links" aria-label="Материалы о компании">
              <a href="#company-info" onClick={() => openCompanySection("partners")}>Партнёрам <ArrowIcon /></a>
              <a href="#company-info" onClick={() => openCompanySection("delivery")}>Доставка и оплата <ArrowIcon /></a>
              <a href="#company-info" onClick={() => openCompanySection("certificates")}>Сертификаты <ArrowIcon /></a>
              <a href="#company-info" onClick={() => openCompanySection("contacts")}>Контакты <ArrowIcon /></a>
            </nav>
          </div>
        </section>
      )}

      <section className="company-info" id="company-info" aria-labelledby="company-info-title">
        <header data-reveal>
          <div>
            <p className="section-index">Всё внутри нового сайта</p>
            <h2 id="company-info-title">Информация и документы</h2>
          </div>
          <p>Материалы перенесены из исходного сайта и теперь открываются здесь — без перехода в старый магазин.</p>
        </header>
        <div className="company-tabs" role="tablist" aria-label="Информация о компании">
          {companySections.map((section, index) => (
            <button
              type="button"
              role="tab"
              id={`company-tab-${section.id}`}
              aria-selected={companySection === section.id}
              aria-controls="company-panel"
              tabIndex={companySection === section.id ? 0 : -1}
              className={companySection === section.id ? "active" : ""}
              onClick={() => setCompanySection(section.id)}
              onKeyDown={(event) => {
                const currentIndex = companySections.findIndex((item) => item.id === section.id);
                const lastIndex = companySections.length - 1;
                let nextIndex: number | null = null;
                if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
                if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
                if (event.key === "Home") nextIndex = 0;
                if (event.key === "End") nextIndex = lastIndex;
                if (nextIndex === null) return;
                event.preventDefault();
                const nextSection = companySections[nextIndex];
                setCompanySection(nextSection.id);
                window.requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(`#company-tab-${nextSection.id}`)?.focus());
              }}
              key={section.id}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>{section.label}
            </button>
          ))}
        </div>
        <div className="company-panel" role="tabpanel" id="company-panel" aria-labelledby={`company-tab-${companySection}`} data-reveal>
          {companySection === "partners" && (
            <div className="partners-panel">
              <div className="company-panel-copy"><p>Партнёрская сеть</p><h3>ANESTET рядом с мастерами</h3><p>Продукцию представляют профессиональные магазины и профильные площадки. По вопросам сотрудничества напишите команде бренда.</p><a href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Партнёрство с ANESTET")}`}>Стать партнёром <ArrowIcon /></a></div>
              <div className="partner-logo-grid">
                {partnerLogos.map(([file, name]) => <div key={file}><Image src={`/assets/img/partners/${file}`} alt={name} width={190} height={92} loading="lazy" /></div>)}
              </div>
            </div>
          )}
          {companySection === "delivery" && (
            <div className="delivery-panel">
              <div className="company-panel-copy"><p>Оформление заказа</p><h3>Доставка и оплата</h3><p>Точный тариф CDEK подтверждается после расчёта. При оформлении заказа можно указать адрес, индекс, ПВЗ и комментарий.</p><button type="button" onClick={() => setCartOpen(true)}>Открыть корзину <ArrowIcon /></button></div>
              <div className="delivery-info-list">
                {deliveryOptions.map((option) => <article key={option.id}><strong>{option.title}</strong><p>{option.note}</p></article>)}
                <article><strong>Оплата</strong><p>Наличными при согласованном способе получения. Подключение онлайн-оплаты выполняется после выдачи рабочего платёжного шлюза.</p></article>
              </div>
            </div>
          )}
          {companySection === "certificates" && (
            <div className="certificates-panel">
              <div className="company-panel-copy"><p>7 документов</p><h3>Декларации соответствия</h3><p>Откройте документ в полном размере. Все файлы хранятся на новом сайте.</p></div>
              <div className="certificate-grid">
                {certificateDocuments.map(([file, title], index) => (
                  <a href={`/assets/img/certificates/${file}`} target="_blank" rel="noreferrer" key={file}>
                    <Image src={`/assets/img/certificates/${file}`} alt={title} width={320} height={440} loading="lazy" />
                    <span>{String(index + 1).padStart(2, "0")}</span><strong>{title}</strong><ArrowIcon />
                  </a>
                ))}
              </div>
            </div>
          )}
          {companySection === "contacts" && (
            <div className="contacts-panel">
              <div className="company-panel-copy"><p>Связаться с нами</p><h3>Контакты ANESTET</h3><p>Поддержка по продуктам, заказам, доставке и партнёрству.</p></div>
              <div className="contact-cards">
                <a href={`mailto:${SUPPORT_EMAIL}`}><span>E-mail</span><strong>{SUPPORT_EMAIL}</strong><ArrowIcon /></a>
                <a href="tel:+79101774142"><span>Телефон</span><strong>{SUPPORT_PHONE}</strong><ArrowIcon /></a>
                <article><span>Самовывоз</span><strong>Москва, ул. Иловайская, д. 20, корп. 2</strong></article>
                <details><summary>Реквизиты компании</summary><p>ИП Ермолаев Александр Михайлович<br />ИНН 331204181474 · ОГРНИП 324330000038211<br />601408, Владимирская обл., Вязниковский р-н, п. Мстёра, ул. Остров 2-я линия, д. 28, кв. 1</p></details>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="evidence" aria-labelledby="evidence-title">
        <div className="evidence-image" data-reveal>
          <Image src="/assets/img/about/anestet-recovery-hand-v2.webp" alt="Восстанавливающие сливки Queen Key в профессиональной beauty-среде" width={1254} height={1254} loading="lazy" />
        </div>
        <div className="evidence-copy" data-reveal>
          <p className="section-index">Прозрачность / документы</p>
          <h2 id="evidence-title">Красота любит доказательства</h2>
          <p>Для ключевых линеек опубликованы декларации соответствия. Документы помогают проверить назначение и происхождение средств перед выбором.</p>
          <a href="#company-info" onClick={() => openCompanySection("certificates")}>Посмотреть сертификаты <ArrowIcon /></a>
        </div>
      </section>

      <section className="social-feed" id="social" aria-labelledby="social-title" data-motion>
        <header data-reveal>
          <div><p className="section-index">ANESTET в эфире</p><h2 id="social-title">Новости, видео, формулы</h2></div>
          <p>Официальные площадки бренда. Карточки ведут прямо в исходную публикационную ленту.</p>
        </header>
        <div className="social-feed-window">
          <div className="social-feed-track">
            {[...socialCards, ...socialCards].map((card, index) => (
              <a className="social-card" href={card.href} target="_blank" rel="noreferrer" key={`${card.network}-${card.eyebrow}-${index}`} aria-hidden={index >= socialCards.length ? "true" : undefined} tabIndex={index >= socialCards.length ? -1 : undefined}>
                <div className="social-network"><Image src={card.icon} alt="" width={64} height={64} aria-hidden="true" /><span>{card.network}</span></div>
                <Image className="social-network-watermark" src={card.icon} alt="" width={210} height={210} aria-hidden="true" />
                <p>{card.eyebrow}</p>
                <h3>{card.title}</h3>
                <small>{card.note}</small>
                <ArrowIcon />
              </a>
            ))}
          </div>
        </div>
        <p className="social-feed-note">Автоматическая загрузка отдельных постов подключается через VK API; до выдачи токена здесь используются официальные разделы сообщества.</p>
      </section>

      <footer className="footer" data-motion>
        <div className="footer-brand-stage">
          <div className="footer-brand-primary" data-reveal>
            <p className="footer-brand-kicker"><span>ANESTET / PROFESSIONAL CARE</span><span>МОСКВА · 2026</span></p>
            <Image className="footer-anestet-logo" src="/assets/img/anestet-logo-2024-blue.png" alt="ANESTET" width={2709} height={1042} />
            <p className="footer-brand-statement">Профессиональный уход<br />{" "}до процедуры, во время и после.</p>
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
          <div><p>Связаться</p><a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a><a href="tel:+79101774142">{SUPPORT_PHONE}</a></div>
          <div><p>Адрес</p><span>Москва, ул. Иловайская,<br />{" "}д. 20, корп. 2</span></div>
          <div><p>Режим работы</p><span>Пн—Пт / 09:00—18:00<br />{" "}Сб—Вс / выходной</span></div>
          <div><p>Дизайн</p><span>{themes.find((item) => item.id === theme)?.number} / {themes.find((item) => item.id === theme)?.title}</span></div>
        </div>
        <nav className="footer-socials" aria-label="Социальные сети ANESTET">
          <a href="https://vk.com/queenkeyanestet" target="_blank" rel="noreferrer">VK</a>
          <a href="https://t.me/Anestetprofessional" target="_blank" rel="noreferrer">Telegram</a>
          <a href="https://taplink.cc/anestet" target="_blank" rel="noreferrer">Все ссылки</a>
          <a href={`mailto:${SUPPORT_EMAIL}`}>Поддержка</a>
        </nav>
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
