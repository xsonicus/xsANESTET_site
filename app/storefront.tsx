"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowIcon, BagIcon, CloseIcon, HeartIcon, MinusIcon, MoonIcon, PlusIcon, SparkIcon, SunIcon } from "./icons";
import { getProductDetails } from "./product-details";
import { formatPrice, products, type Product } from "./products";

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
const FAVORITES_STORAGE_KEY = "anestet-favorites-v1";
const DESIGN_STORAGE_KEY = "qk-design-lab-v1";
const SITE_RELEASE = "2026.09.02-v13.4.2";
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
function parseStoredCart(value: string | null): CartLine[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((line) => {
      if (!line || typeof line !== "object") return [];
      const { id, quantity } = line as Partial<CartLine>;
      if (typeof id !== "number" || !Number.isInteger(id) || id < 1 || typeof quantity !== "number") return [];
      return [{ id, quantity: Math.min(99, Math.max(1, Math.floor(quantity))) }];
    });
  } catch {
    return [];
  }
}

function isCatalogProduct(value: unknown): value is Product & { active?: boolean } {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Product> & { active?: unknown };
  return typeof item.id === "number"
    && Number.isInteger(item.id)
    && item.id > 0
    && typeof item.brand === "string"
    && item.brand.length > 0
    && typeof item.title === "string"
    && item.title.length > 0
    && typeof item.compactTitle === "string"
    && item.compactTitle.length > 0
    && typeof item.price === "number"
    && Number.isFinite(item.price)
    && item.price >= 0
    && (item.compareAtPrice === undefined || item.compareAtPrice === null || (typeof item.compareAtPrice === "number" && Number.isFinite(item.compareAtPrice) && item.compareAtPrice > item.price))
    && typeof item.image === "string"
    && item.image.startsWith("/assets/")
    && typeof item.tag === "string"
    && item.tag.length > 0
    && (item.active === undefined || typeof item.active === "boolean");
}

const themes = [
  { id: "serum", slug: "cinematic", title: "Ночь", longTitle: "Future Beauty" },
  { id: "clinical", slug: "clinical", title: "День", longTitle: "Clinical Luxury" },
] as const;

type ThemeId = (typeof themes)[number]["id"];
type ThemePreference = "system" | "manual";

// Тексты перенесены из сохранённых карточек прежнего qkcosmetic.ru и сокращены
// только для первого экрана; назначение продуктов и обещания не расширялись.
const heroSourceDescriptions: Record<number, string> = {
  17: "Охлаждающий гель для подготовки кожи к косметологическим процедурам. Снижает чувствительность и неприятные ощущения, обеспечивая комфорт во время процедуры.",
  33: "Охлаждающий гель для подготовки кожи к косметологическим процедурам. Снижает чувствительность и неприятные ощущения, обеспечивая комфорт во время процедуры.",
  34: "Охлаждающий гель для подготовки кожи к косметологическим процедурам. Снижает чувствительность и неприятные ощущения, обеспечивая комфорт во время процедуры.",
  35: "Охлаждающий гель с новой формулой для подготовки кожи к косметологическим процедурам и более глубокого действия.",
  36: "Охлаждающий гель с новой формулой для подготовки кожи к косметологическим процедурам и более глубокого действия.",
  37: "Гель предназначен для использования после первичного этапа. Он продлевает и усиливает эффект, обеспечивая комфорт для клиента.",
  42: "Нежная формула для глубокого увлажнения, восстановления кожного барьера и успокоения чувствительной кожи. Масла ши, жожоба и сквален питают кожу, делают её мягкой и эластичной.",
  60: "Д-пантенол глубоко увлажняет и способствует восстановлению кожи. Масло ши питает, повышает мягкость и эластичность, защищая кожу от потери влаги.",
};

function heroHeadline(product: Product) {
  return product.title.replace(/,\s*\d+\s*мл\.?$/i, "");
}

function heroDescription(product: Product) {
  return heroSourceDescriptions[product.id] ?? product.title;
}

function heroEyebrow(product: Product) {
  if (product.brand === "QUEEN KEY") return "QUEEN KEY · Уход за кожей";
  const brand = product.brand === "ANESTET" ? "ANESTET®" : product.brand;
  if (product.tag === "Второй этап") return `${brand} · Второй этап процедуры`;
  return `${brand} · Подготовка кожи к процедуре`;
}

function productVolume(product: Product) {
  return product.compactTitle.split("·").pop()?.trim() ?? "";
}

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

type VkFeedItem = {
  id: string;
  kind: "video" | "post";
  title: string;
  excerpt: string;
  publishedAt: string;
  duration: number;
  posterUrl: string;
  posterWidth: number;
  posterHeight: number;
  playerUrl: string | null;
  sourceUrl: string;
  productId: number | null;
};

function HeroBrandLockup({ product }: { product: Product }) {
  if (product.brand === "QUEEN KEY") {
    return <span className="hero-context-brand queen-key"><Image src="/assets/img/logo-footer.svg" alt="Queen Key Cosmetic" width={193} height={43} /></span>;
  }
  return <span className="hero-context-brand anestet" aria-label="Anestet, зарегистрированный товарный знак">Anestet<sup>®</sup></span>;
}

function BrandLabel({ brand, className = "" }: { brand: string; className?: string }) {
  if (brand === "ANESTET") {
    return <span className={`brand-label anestet-brand-label ${className}`.trim()} aria-label="Anestet, зарегистрированный товарный знак">Anestet<sup>®</sup></span>;
  }
  return <span className={`brand-label ${className}`.trim()}>{brand}</span>;
}

function isVkFeedItem(value: unknown): value is VkFeedItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<VkFeedItem>;
  try {
    const poster = new URL(String(item.posterUrl));
    const baseValid = typeof item.id === "string"
      && item.id.length > 0
      && (item.kind === "video" || item.kind === "post")
      && typeof item.title === "string"
      && item.title.length > 0
      && (item.productId === null || (Number.isInteger(item.productId) && Number(item.productId) > 0))
      && poster.protocol === "https:";
    if (!baseValid || item.kind === "post") return baseValid;
    const player = new URL(String(item.playerUrl));
    return player.protocol === "https:"
      && ["vk.com", "vk.ru", "vkvideo.ru"].some((host) => player.hostname === host || player.hostname.endsWith(`.${host}`))
      && player.pathname === "/video_ext.php";
  } catch {
    return false;
  }
}

function videoDuration(seconds: number) {
  if (!seconds) return "Видео";
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

const careStages = [
  {
    number: "01",
    id: "guide-preparation",
    title: "Подготовка",
    description: "Средства до процедуры",
    brands: "ANESTET® · FION · LIGHT DEP · LIGHT FROST",
    purpose: "Первичные охлаждающие гели и кремы используют для подготовки кожи перед косметологическими и эстетическими процедурами.",
    points: [
      "Базовая формула: ANESTET® base или Light Dep для стандартного сценария подготовки.",
      "Усиленная формула: FION ultra, Light Dep Professional или Light Frost, когда важны более быстрое начало действия и плотная текстура.",
      "Формат: 30 мл — компактный объём; 75–150 мл — регулярная работа; 300–400 мл — профессиональный запас.",
    ],
    productIds: [17, 33, 34, 35, 36, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59],
    lines: [
      { label: "ANESTET® base", productId: 17 },
      { label: "FION ultra", productId: 35 },
      { label: "Light Dep", productId: 51 },
      { label: "Light Frost", productId: 48 },
      { label: "Анестодерм", productId: 57 },
      { label: "Mildep", productId: 58 },
    ],
  },
  {
    number: "02",
    id: "guide-secondary",
    title: "Второй этап",
    description: "Продолжение процедуры",
    brands: "ANESTET® BASE · FION ULTRA",
    purpose: "Средства второго этапа в исходном каталоге предназначены для использования после первичного средства во время процедуры.",
    points: [
      "ANESTET® base — базовый вариант второго этапа.",
      "FION ultra — усиленная формула линейки второго этапа.",
      "Объёмы 5 мл подходят для точечной работы, 30 мл — для регулярного профессионального использования.",
    ],
    productIds: [37, 38, 39, 40],
    lines: [
      { label: "2 base · 5 мл", productId: 38 },
      { label: "2 base · 30 мл", productId: 37 },
      { label: "FION 2 ultra · 5 мл", productId: 40 },
      { label: "FION 2 ultra · 30 мл", productId: 39 },
    ],
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
    productIds: [42, 60],
    lines: [
      { label: "Ceramide Repair · лицо", productId: 42 },
      { label: "Recovery Milk · тело", productId: 60 },
      { label: "Д-пантенол", productId: 60 },
      { label: "масло ши", productId: 42 },
      { label: "бисаболол", productId: 42 },
    ],
  },
] as const;

type CareStageId = (typeof careStages)[number]["id"];

const proof = [
  { value: "23", label: "позиции в текущем каталоге" },
  { value: "3", label: "этапа понятного выбора" },
  { value: "7", label: "деклараций соответствия" },
];

const productPackshot = (product: Product) => product.image;
const productCardPackshot = (product: Product) => {
  const vectorVersion = product.image.match(/-alpha-restored-(v[34])\.webp$/)?.[1];
  return vectorVersion
    ? product.image.replace(/-alpha-restored-v[34]\.webp$/, `-card-${vectorVersion}.webp`)
    : product.image.replace(/-alpha-restored-v2\.webp$/, "-card.webp");
};

type ShoppingMode = "catalog" | "guide";
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
  ["ds-geli-dlya-pervichnogo-ohlazhdeniya.png", "Гели для первичного охлаждения ANESTET®"],
  ["ds-geli-dlya-pervichnogo-ohlazhdeniya-fion.png", "Гели для первичного охлаждения FION"],
  ["ds-geli-dlya-vtorichnogo-ohlazhdeniya.png", "Гели для второго этапа ANESTET®"],
  ["ds-geli-dlya-vtorichnogo-ohlazhdeniya-fion.png", "Гели для второго этапа FION"],
  ["ds-krem-queen-key.png", "Крем Queen Key"],
  ["ds-vosstanavlivayushhie-slivki-s-d-pantenolom-queen-key.png", "Восстанавливающие сливки Queen Key"],
  ["ds-delikatnyij-gel-s-romashkoj-queen-key.png", "Деликатный гель с ромашкой Queen Key"],
] as const;

export default function Storefront() {
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(products);
  const [theme, setTheme] = useState<ThemeId>("serum");
  const [themePreference, setThemePreference] = useState<ThemePreference>("system");
  const [themeResolved, setThemeResolved] = useState(false);
  const [ambientMotionEnabled, setAmbientMotionEnabled] = useState(false);
  const [heroGraphicsReady, setHeroGraphicsReady] = useState(false);
  const [filter, setFilter] = useState("Все");
  const [catalogStageId, setCatalogStageId] = useState<CareStageId | null>(null);
  const [focusedProductId, setFocusedProductId] = useState<number | null>(null);
  const [shoppingMode, setShoppingMode] = useState<ShoppingMode>("catalog");
  const [companySection, setCompanySection] = useState<CompanySection>("partners");
  const [heroProductIndex, setHeroProductIndex] = useState(0);
  const [departingHeroProductIndex, setDepartingHeroProductIndex] = useState<number | null>(null);
  const [heroMotionCycle, setHeroMotionCycle] = useState(0);
  const [heroAnimating, setHeroAnimating] = useState(false);
  const [heroCarouselPaused, setHeroCarouselPaused] = useState(false);
  const [heroCarouselUserPaused, setHeroCarouselUserPaused] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartReady, setCartReady] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [favoritesReady, setFavoritesReady] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderForm, setOrderForm] = useState<OrderForm>(initialOrderForm);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<{ id?: string; error?: string } | null>(null);
  const [callbackPhone, setCallbackPhone] = useState("");
  const [callbackConsent, setCallbackConsent] = useState(false);
  const [callbackMarketing, setCallbackMarketing] = useState(false);
  const [callbackState, setCallbackState] = useState<{ submitting?: boolean; success?: string; error?: string }>({});
  const [vkPublications, setVkPublications] = useState<VkFeedItem[]>([]);
  const [openVkVideo, setOpenVkVideo] = useState<VkFeedItem | null>(null);
  const [openProductId, setOpenProductId] = useState<number | null>(null);
  const cartDialogRef = useRef<HTMLDialogElement>(null);
  const vkVideoDialogRef = useRef<HTMLDialogElement>(null);
  const productDialogRef = useRef<HTMLDialogElement>(null);
  const heroProductIndexRef = useRef(0);
  const heroProductIdRef = useRef<number | null>(null);
  const heroTransitionTimerRef = useRef<number | null>(null);
  const footerLightFrameRef = useRef<number | null>(null);
  const footerLightBoundsRef = useRef<DOMRect | null>(null);
  const footerLightPointRef = useRef({ x: 0, y: 0 });
  const heroProducts = useMemo(() => {
    const newProducts = catalogProducts.filter((product) => product.isNew);
    return newProducts.length ? newProducts : catalogProducts.slice(0, 1);
  }, [catalogProducts]);
  const openProduct = openProductId === null ? null : catalogProducts.find((product) => product.id === openProductId) ?? products.find((product) => product.id === openProductId) ?? null;
  const openProductDetails = openProduct ? getProductDetails(openProduct.id) : null;

  const changeHeroProduct = (direction: number) => {
    if (heroProducts.length < 2) return;
    const current = heroProductIndexRef.current;
    const next = (current + direction + heroProducts.length) % heroProducts.length;
    if (next === current) return;
    setDepartingHeroProductIndex(current);
    setHeroProductIndex(next);
    heroProductIndexRef.current = next;
    heroProductIdRef.current = heroProducts[next]?.id ?? null;
    setHeroMotionCycle((cycle) => cycle + 1);
    setHeroAnimating(true);
    if (heroTransitionTimerRef.current) window.clearTimeout(heroTransitionTimerRef.current);
    heroTransitionTimerRef.current = window.setTimeout(() => {
      setDepartingHeroProductIndex(null);
      setHeroAnimating(false);
    }, 1250);
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const requestedDesign = searchParams.get("design");
    let storedDesign: string | null = null;
    try {
      storedDesign = window.localStorage.getItem(DESIGN_STORAGE_KEY);
    } catch {
      // Future Beauty remains the safe default when storage is unavailable.
    }
    const queryDesign = themes.find((item) => item.slug === requestedDesign);
    const savedDesign = themes.find((item) => item.slug === storedDesign);
    const systemTheme: ThemeId = window.matchMedia("(prefers-color-scheme: dark)").matches ? "serum" : "clinical";
    setTheme(queryDesign?.id ?? savedDesign?.id ?? systemTheme);
    setThemePreference(queryDesign || savedDesign ? "manual" : "system");
    setThemeResolved(true);
    if (searchParams.has("motion") || searchParams.has("site")) {
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete("motion");
      cleanUrl.searchParams.delete("site");
      window.history.replaceState({}, "", `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`);
    }
    const requestedStage = careStages.find((stage) => stage.id === searchParams.get("stage"));
    const requestedProductId = Number(searchParams.get("product"));
    if (requestedStage) {
      setShoppingMode("catalog");
      setCatalogStageId(requestedStage.id);
      setFilter("Все");
      if (Number.isInteger(requestedProductId) && requestedStage.productIds.some((id) => id === requestedProductId)) {
        setFocusedProductId(requestedProductId);
      }
    }
  }, []);

  useEffect(() => {
    if (!themeResolved || themePreference !== "system") return;
    const systemScheme = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystemTheme = () => setTheme(systemScheme.matches ? "serum" : "clinical");
    systemScheme.addEventListener("change", syncSystemTheme);
    return () => systemScheme.removeEventListener("change", syncSystemTheme);
  }, [themePreference, themeResolved]);

  useEffect(() => {
    setHeroGraphicsReady(false);
    if (theme !== "serum" || !ambientMotionEnabled) return;
    const receiveGraphicsStatus = (event: MessageEvent) => {
      const frame = document.querySelector<HTMLIFrameElement>(".getlayers-opaline");
      if (event.origin !== window.location.origin || event.source !== frame?.contentWindow || event.data?.type !== "anestet-graphic-status") return;
      setHeroGraphicsReady((ready) => event.data.status === "ready" ? true : ready ? true : false);
    };
    window.addEventListener("message", receiveGraphicsStatus);
    return () => window.removeEventListener("message", receiveGraphicsStatus);
  }, [ambientMotionEnabled, theme]);

  useEffect(() => {
    if (theme !== "serum" || !ambientMotionEnabled) return;
    const frame = document.querySelector<HTMLIFrameElement>(".getlayers-opaline");
    const anchor = document.querySelector<HTMLElement>(".hero-packshot-frame");
    if (!frame || !anchor) return;
    // The alpha-weighted vertical centre of all 23 official product packshots is
    // 497.174 px in their shared 1000 px canvas. Keeping this fixed prevents the
    // graphic from jumping when products with different heights are exchanged.
    const productOpticalCenterY = 0.497174;
    let frameId = 0;
    const syncHeroGraphicAnchor = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        const frameRect = frame.getBoundingClientRect();
        const anchorRect = anchor.getBoundingClientRect();
        if (!frameRect.width || !frameRect.height || !anchorRect.width || !anchorRect.height) return;
        const x = (anchorRect.left + anchorRect.width / 2 - frameRect.left) / frameRect.width;
        const y = (anchorRect.top + anchorRect.height * productOpticalCenterY - frameRect.top) / frameRect.height;
        frame.dataset.anchorX = x.toFixed(6);
        frame.dataset.anchorY = y.toFixed(6);
        frame.contentWindow?.postMessage({
          type: "anestet-hero-anchor",
          x,
          y,
        }, window.location.origin);
      });
    };
    const resizeObserver = new ResizeObserver(syncHeroGraphicAnchor);
    const syncWhenGraphicsReady = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.contentWindow || event.data?.type !== "anestet-graphic-status" || event.data.status !== "ready") return;
      syncHeroGraphicAnchor();
    };
    resizeObserver.observe(frame);
    resizeObserver.observe(anchor);
    frame.addEventListener("load", syncHeroGraphicAnchor);
    window.addEventListener("resize", syncHeroGraphicAnchor);
    window.addEventListener("message", syncWhenGraphicsReady);
    syncHeroGraphicAnchor();
    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      frame.removeEventListener("load", syncHeroGraphicAnchor);
      window.removeEventListener("resize", syncHeroGraphicAnchor);
      window.removeEventListener("message", syncWhenGraphicsReady);
    };
  }, [ambientMotionEnabled, theme]);

  useEffect(() => {
    if (["localhost", "127.0.0.1"].includes(window.location.hostname)) return;
    let active = true;
    fetch("/api/content/vk")
      .then(async (response) => {
        if (!response.ok) throw new Error("VK feed unavailable");
        return response.json() as Promise<{ ok?: boolean; items?: unknown[] }>;
      })
      .then((result) => {
        if (!active || !result.ok || !Array.isArray(result.items)) return;
        setVkPublications(result.items.filter(isVkFeedItem));
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (["localhost", "127.0.0.1"].includes(window.location.hostname)) return;
    let active = true;
    fetch("/api/catalog", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("catalog unavailable");
        return response.json() as Promise<{ ok?: boolean; products?: Array<Product & { compareAtPrice?: number | null; active?: boolean }> }>;
      })
      .then((result) => {
        if (!active || !result.ok || !Array.isArray(result.products) || !result.products.length) return;
        const normalized = result.products
          .filter(isCatalogProduct)
          .filter((product) => product.active !== false)
          .map((product) => ({
            ...product,
            compareAtPrice: typeof product.compareAtPrice === "number" ? product.compareAtPrice : undefined,
            heroScale: products.find((fallback) => fallback.id === product.id)?.heroScale,
          }));
        if (normalized.length) setCatalogProducts(normalized);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!heroProducts.length) return;
    const currentId = heroProductIdRef.current;
    const nextIndex = currentId === null ? 0 : heroProducts.findIndex((product) => product.id === currentId);
    const safeIndex = nextIndex >= 0 ? nextIndex : 0;
    heroProductIdRef.current = heroProducts[safeIndex].id;
    heroProductIndexRef.current = safeIndex;
    setHeroProductIndex(safeIndex);
    if (nextIndex < 0) setDepartingHeroProductIndex(null);
  }, [heroProducts]);

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
    try {
      const stored = JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY) || "[]") as unknown;
      setFavorites(Array.isArray(stored) ? stored.filter((id): id is number => typeof id === "number" && Number.isInteger(id) && id > 0) : []);
    } catch {
      setFavorites([]);
    }
    setFavoritesReady(true);
  }, []);

  useEffect(() => {
    if (!favoritesReady) return;
    try {
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // Избранное остаётся доступно до закрытия вкладки, если storage заблокирован.
    }
  }, [favorites, favoritesReady]);

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
    const dialog = vkVideoDialogRef.current;
    if (!dialog) return;
    if (openVkVideo && !dialog.open) dialog.showModal();
    if (!openVkVideo && dialog.open) dialog.close();
    const previousOverflow = document.body.style.overflow;
    if (openVkVideo) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [openVkVideo]);

  useEffect(() => {
    const dialog = productDialogRef.current;
    if (!dialog) return;
    if (openProduct && !dialog.open) dialog.showModal();
    if (!openProduct && dialog.open) dialog.close();
    const previousOverflow = document.body.style.overflow;
    if (openProduct) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [openProduct]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compactViewport = window.matchMedia("(max-width: 760px)");
    let interval: number | undefined;
    const syncCarousel = () => {
      if (interval) window.clearInterval(interval);
      interval = undefined;
      if (heroCarouselPaused || heroCarouselUserPaused || heroProducts.length < 2 || reducedMotion.matches || compactViewport.matches) return;
      interval = window.setInterval(() => {
        if (!document.hidden) changeHeroProduct(1);
      }, 7000);
    };
    syncCarousel();
    reducedMotion.addEventListener("change", syncCarousel);
    compactViewport.addEventListener("change", syncCarousel);
    return () => {
      if (interval) window.clearInterval(interval);
      reducedMotion.removeEventListener("change", syncCarousel);
      compactViewport.removeEventListener("change", syncCarousel);
    };
  }, [heroCarouselPaused, heroCarouselUserPaused, heroProducts.length]);

  useEffect(() => () => {
    if (heroTransitionTimerRef.current) window.clearTimeout(heroTransitionTimerRef.current);
    if (footerLightFrameRef.current) window.cancelAnimationFrame(footerLightFrameRef.current);
  }, []);

  useEffect(() => {
    if (!themeResolved) return;
    document.documentElement.dataset.theme = theme;
  }, [theme, themeResolved]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 761px)");
    const syncMotionPreference = () => setAmbientMotionEnabled(!reducedMotion.matches && desktop.matches);
    syncMotionPreference();
    reducedMotion.addEventListener("change", syncMotionPreference);
    desktop.addEventListener("change", syncMotionPreference);
    return () => {
      reducedMotion.removeEventListener("change", syncMotionPreference);
      desktop.removeEventListener("change", syncMotionPreference);
    };
  }, []);

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
  }, [theme, filter, shoppingMode, catalogProducts]);

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>("[data-motion]");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const refresh = () => {
      nodes.forEach((node) => {
        node.dataset.active = String(node.dataset.inView === "true" && !document.hidden);
      });
      const hero = document.querySelector<HTMLElement>(".hero");
      const opalineFrame = document.querySelector<HTMLIFrameElement>(".getlayers-opaline");
      opalineFrame?.contentWindow?.postMessage({
        type: "anestet-motion",
        active: hero?.dataset.inView === "true" && !document.hidden,
      }, window.location.origin);
    };
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
    const opalineFrame = document.querySelector<HTMLIFrameElement>(".getlayers-opaline");
    opalineFrame?.addEventListener("load", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      observer.disconnect();
      opalineFrame?.removeEventListener("load", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [ambientMotionEnabled, theme, shoppingMode]);

  const filters = ["Все", "ANESTET", "LIGHT DEP", "Уход"];
  const selectedCareStage = careStages.find((stage) => stage.id === catalogStageId) ?? null;
  const visibleProducts = useMemo(() => {
    const stageProductIds: readonly number[] = selectedCareStage?.productIds ?? [];
    const stageProducts = selectedCareStage
      ? catalogProducts.filter((product) => stageProductIds.includes(product.id))
      : catalogProducts;
    const scopedProducts = filter === "Все"
      ? stageProducts
      : filter === "Уход"
        ? stageProducts.filter((product) => [42, 58, 60].includes(product.id))
        : stageProducts.filter((product) => product.brand === filter || (filter === "LIGHT DEP" && product.brand.startsWith("LIGHT DEP")));
    return [...scopedProducts].sort((first, second) => {
      if (focusedProductId !== null) {
        if (first.id === focusedProductId) return -1;
        if (second.id === focusedProductId) return 1;
      }
      return Number(Boolean(second.isNew)) - Number(Boolean(first.isNew));
    });
  }, [catalogProducts, filter, focusedProductId, selectedCareStage]);

  useEffect(() => {
    if (shoppingMode !== "catalog" || catalogStageId === null) return;
    const timer = window.setTimeout(() => {
      const target = focusedProductId === null
        ? document.querySelector<HTMLElement>("#catalog")
        : document.querySelector<HTMLElement>(`#product-${focusedProductId}`);
      if (!target) return;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: focusedProductId === null ? "start" : "center" });
      if (focusedProductId !== null) target.focus({ preventScroll: true });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [catalogStageId, focusedProductId, shoppingMode, visibleProducts.length]);

  const safeHeroProductIndex = Math.min(heroProductIndex, Math.max(0, heroProducts.length - 1));
  const heroProduct = (heroProducts[safeHeroProductIndex] ?? heroProducts[0])!;
  const departingHeroProduct = departingHeroProductIndex === null ? null : heroProducts[departingHeroProductIndex];
  const cartEntries = useMemo(() => cart.flatMap((line) => {
    const product = catalogProducts.find((item) => item.id === line.id);
    return product ? [{ ...line, product }] : [];
  }), [cart, catalogProducts]);
  const cartCount = cartEntries.reduce((total, line) => total + line.quantity, 0);
  const cartSubtotal = cartEntries.reduce((total, line) => total + line.product.price * line.quantity, 0);
  const selectedDelivery = deliveryOptions.find((option) => option.id === orderForm.delivery) ?? deliveryOptions[0];
  const deliveryCost = selectedDelivery.cost(cartSubtotal);
  const orderTotal = cartSubtotal + (deliveryCost ?? 0);
  const checkoutHref = useMemo(() => {
    const lines = cartEntries.map(({ product, quantity }) => `• ${product.compactTitle} — ${quantity} × ${formatPrice(product.price)}`);
    const message = [
      "Здравствуйте! Хочу оформить заказ ANESTET®:",
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
  const toggleFavorite = (id: number) => setFavorites((current) => current.includes(id)
    ? current.filter((favoriteId) => favoriteId !== id)
    : [...current, id]);
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
          source: "full",
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
  const submitCallback = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (callbackState.submitting) return;
    setCallbackState({ submitting: true });
    try {
      const response = await fetch("/api/callbacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: callbackPhone, consent: callbackConsent, marketing: callbackMarketing, source: "full", release: SITE_RELEASE }),
      });
      const result = await response.json() as { ok?: boolean; requestId?: string; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || "Не удалось отправить заявку");
      setCallbackState({ success: result.requestId });
      setCallbackPhone("");
      setCallbackConsent(false);
      setCallbackMarketing(false);
    } catch (error) {
      setCallbackState({ error: error instanceof Error ? error.message : "Не удалось отправить заявку" });
    }
  };
  const showHeroProduct = (direction: number) => changeHeroProduct(direction);
  const chooseDesign = (id: ThemeId) => {
    const design = themes.find((item) => item.id === id) ?? themes[0];
    setTheme(design.id);
    setThemePreference("manual");
    try {
      window.localStorage.setItem(DESIGN_STORAGE_KEY, design.slug);
    } catch {
      // The selected design still applies for the current visit.
    }
    const url = new URL(window.location.href);
    url.searchParams.set("design", design.slug);
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  };
  const toggleDesign = () => chooseDesign(theme === "serum" ? "clinical" : "serum");
  const openCompanySection = (section: CompanySection) => {
    setCompanySection(section);
    window.requestAnimationFrame(() => document.querySelector("#company-info")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const updateCatalogDeepLink = (stageId: CareStageId | null, productId: number | null, hash: string) => {
    const url = new URL(window.location.href);
    if (stageId) url.searchParams.set("stage", stageId);
    else url.searchParams.delete("stage");
    if (productId !== null) url.searchParams.set("product", String(productId));
    else url.searchParams.delete("product");
    url.hash = hash;
    window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
  };
  const scrollToSectionAfterRender = (selector: string) => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>(selector);
      if (!target) return;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    }));
  };
  const showStageProducts = (stageId: CareStageId, productId: number | null = null) => {
    const stage = careStages.find((item) => item.id === stageId);
    if (!stage) return;
    const safeProductId = productId !== null && stage.productIds.some((id) => id === productId) ? productId : null;
    setFilter("Все");
    setCatalogStageId(stageId);
    setFocusedProductId(safeProductId);
    setShoppingMode("catalog");
    updateCatalogDeepLink(stageId, safeProductId, safeProductId === null ? "catalog" : `product-${safeProductId}`);
  };
  const showAllCatalog = () => {
    setFilter("Все");
    setCatalogStageId(null);
    setFocusedProductId(null);
    setShoppingMode("catalog");
    updateCatalogDeepLink(null, null, "catalog");
    scrollToSectionAfterRender("#catalog");
  };
  const showLinkedProduct = (productId: number) => {
    setFilter("Все");
    setCatalogStageId(null);
    setFocusedProductId(productId);
    setShoppingMode("catalog");
    setOpenVkVideo(null);
    updateCatalogDeepLink(null, productId, `product-${productId}`);
    window.setTimeout(() => scrollToSectionAfterRender(`#product-${productId}`), 80);
  };
  const showProductDetails = (productId: number) => {
    setHeroCarouselPaused(true);
    setOpenProductId(productId);
  };
  const closeProductDetails = () => {
    setOpenProductId(null);
    setHeroCarouselPaused(false);
  };
  const showGuide = () => {
    setCatalogStageId(null);
    setFocusedProductId(null);
    setShoppingMode("guide");
    updateCatalogDeepLink(null, null, "guide");
    scrollToSectionAfterRender("#guide");
  };
  const chooseCatalogFilter = (nextFilter: string) => {
    setFilter(nextFilter);
    setCatalogStageId(null);
    setFocusedProductId(null);
    setShoppingMode("catalog");
    updateCatalogDeepLink(null, null, "catalog");
  };

  return (
    <main className="site-shell">
      <a className="skip-link" href="#shopping">К выбору товаров</a>

      <header className="site-header">
        <a className="wordmark" href="#top">
          <span className="header-wordmark-lockup">
            <Image className="brand-logo" src="/assets/img/optimized/anestet-logo-blue-990-lossless.webp" alt="Anestet" width={990} height={381} loading="eager" />
            <sup aria-label="зарегистрированный товарный знак">®</sup>
          </span>
        </a>
        <nav className="primary-nav" aria-label="Главное меню">
          <a href="#catalog" onClick={(event) => { event.preventDefault(); showAllCatalog(); }}>Каталог</a>
          <a href="#guide" onClick={(event) => { event.preventDefault(); showGuide(); }}>Система ухода</a>
          <a href="#about">О бренде</a>
          <a href="#company-info" onClick={() => openCompanySection("contacts")}>Поддержка</a>
        </nav>
        <div className="header-actions">
          <nav className="header-socials" aria-label="Социальные сети и поддержка">
            <a href="https://vk.ru/queenkeyanestet" target="_blank" rel="noreferrer" aria-label="ANESTET, зарегистрированный товарный знак, во ВКонтакте">
              <Image src="/assets/icons/social/vk.svg" alt="" width={24} height={24} aria-hidden="true" />
            </a>
            <a href="https://t.me/Anestetprofessional" target="_blank" rel="noreferrer" aria-label="ANESTET, зарегистрированный товарный знак, в Telegram">
              <Image src="/assets/icons/social/telegram.svg" alt="" width={24} height={24} aria-hidden="true" />
            </a>
            <a href="https://taplink.cc/anestet" target="_blank" rel="noreferrer" aria-label="Все официальные ссылки ANESTET, зарегистрированный товарный знак, в Taplink">
              <Image src="/assets/icons/social/taplink.svg" alt="" width={24} height={24} aria-hidden="true" />
            </a>
          </nav>
          <a className="header-support-button" href="#company-info" onClick={() => openCompanySection("contacts")} aria-label={`Поддержка — открыть контакты: ${SUPPORT_EMAIL}`}>
            <span>Поддержка</span><small>{SUPPORT_EMAIL}</small>
          </a>
          <div className="design-switcher" aria-label="Тема оформления">
            <span className="theme-switcher-caption">Тема сайта</span>
            <button
              type="button"
              className="theme-toggle"
              role="switch"
              aria-checked={theme === "serum"}
              aria-label={`Сейчас ${theme === "serum" ? "тёмная тема Future Beauty" : "светлая тема Clinical Luxury"}. Переключить на ${theme === "serum" ? "день" : "ночь"}`}
              title={`Переключить на ${theme === "serum" ? "светлую" : "тёмную"} тему`}
              data-theme-state={theme}
              onClick={toggleDesign}
            >
              <span className="theme-toggle-option theme-toggle-day"><SunIcon /><span>День</span></span>
              <span className="theme-toggle-option theme-toggle-night"><MoonIcon /><span>Ночь</span></span>
            </button>
          </div>
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
                      <Image src={productCardPackshot(product)} alt="" width={180} height={180} />
                    </div>
                    <div className="cart-line-copy">
                      <BrandLabel brand={product.brand} className="cart-brand-label" />
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

      <dialog
        className="vk-video-dialog"
        ref={vkVideoDialogRef}
        aria-labelledby="vk-video-dialog-title"
        onCancel={() => setOpenVkVideo(null)}
        onClose={() => setOpenVkVideo(null)}
        onClick={(event) => { if (event.target === event.currentTarget) setOpenVkVideo(null); }}
      >
        {openVkVideo?.kind === "video" && openVkVideo.playerUrl && (
          <div className="vk-video-panel">
            <header>
              <div><p>VK / официальный ролик</p><h2 id="vk-video-dialog-title">{openVkVideo.title}</h2></div>
              <button type="button" onClick={() => setOpenVkVideo(null)} aria-label="Закрыть видео"><CloseIcon size={22} /></button>
            </header>
            <div className="vk-video-player">
              <iframe
                src={openVkVideo.playerUrl}
                title={openVkVideo.title}
                loading="lazy"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
            <footer>
              <a href={openVkVideo.sourceUrl} target="_blank" rel="noreferrer">Исходный пост VK <ArrowIcon /></a>
              {openVkVideo.productId !== null && <button type="button" onClick={() => showLinkedProduct(openVkVideo.productId!)}>Перейти к товару <ArrowIcon /></button>}
            </footer>
          </div>
        )}
      </dialog>

      <dialog
        className="product-detail-dialog"
        ref={productDialogRef}
        aria-labelledby="product-detail-title"
        onCancel={(event) => { event.preventDefault(); closeProductDetails(); }}
        onClose={() => setOpenProductId(null)}
        onClick={(event) => { if (event.target === event.currentTarget) closeProductDetails(); }}
      >
        {openProduct && openProductDetails && (
          <article className="product-detail-panel" key={openProduct.id}>
            <button type="button" className="product-detail-close" onClick={closeProductDetails} aria-label="Закрыть карточку товара"><CloseIcon size={22} /></button>
            <div className="product-detail-visual">
              <span className="product-detail-tag">{openProduct.tag}</span>
              <span className="product-detail-coordinate product-detail-coordinate-top" aria-hidden="true">FORMULA / {String(openProduct.id).padStart(2, "0")}</span>
              <span className="product-detail-coordinate product-detail-coordinate-side" aria-hidden="true">ANESTET LAB · MOSCOW</span>
              <span className="product-detail-grid" aria-hidden="true" />
              <div className="product-detail-packshot">
                <Image src={productPackshot(openProduct)} alt={openProduct.title} fill sizes="(max-width: 760px) 88vw, 42vw" loading="eager" />
              </div>
              <span className="product-detail-orbit" aria-hidden="true" />
            </div>
            <div className="product-detail-copy">
              <header className="product-detail-heading">
                <BrandLabel brand={openProduct.brand} className="product-detail-brand" />
                <span>Карточка продукта · {String(openProduct.id).padStart(2, "0")}</span>
              </header>
              <h2 id="product-detail-title">{openProduct.title}</h2>
              <p className="product-detail-description">{openProductDetails.description}</p>
              <div className="product-detail-facts" aria-label="Краткие параметры товара">
                <span><small>Формат</small><strong>{productVolume(openProduct)}</strong></span>
                <span><small>Сценарий</small><strong>{openProduct.tag}</strong></span>
                <span><small>Статус</small><strong>Наличие уточняется</strong></span>
              </div>
              <div className="product-detail-accordions">
                {openProductDetails.purpose && <details open><summary><span className="product-detail-section-name"><small>01</small>Назначение</span><span className="product-detail-toggle">+</span></summary><p>{openProductDetails.purpose}</p></details>}
                <details><summary><span className="product-detail-section-name"><small>02</small>Как использовать</span><span className="product-detail-toggle">+</span></summary><p>{openProductDetails.usage}</p></details>
                <details><summary><span className="product-detail-section-name"><small>03</small>Состав</span><span className="product-detail-toggle">+</span></summary><p>{openProductDetails.composition}</p></details>
                {openProductDetails.advantages && <details><summary><span className="product-detail-section-name"><small>04</small>Преимущества</span><span className="product-detail-toggle">+</span></summary><p>{openProductDetails.advantages}</p></details>}
              </div>
              <p className="product-detail-disclaimer">Перед применением сверяйте способ использования, ограничения и актуальный состав с маркировкой на упаковке.</p>
              <footer className="product-detail-footer">
                <span className="product-detail-price"><small>Цена</small><span><strong>{formatPrice(openProduct.price)}</strong>{openProduct.compareAtPrice && <del>{formatPrice(openProduct.compareAtPrice)}</del>}</span></span>
                <button type="button" onClick={() => addToCart(openProduct.id)}>
                  {(cart.find((line) => line.id === openProduct.id)?.quantity ?? 0) > 0 ? `В корзине · ${cart.find((line) => line.id === openProduct.id)?.quantity}` : "В корзину"}
                  <BagIcon size={18} title="" />
                </button>
                <a href={openProductDetails.sourceUrl} target="_blank" rel="noreferrer">Официальная карточка <ArrowIcon /></a>
              </footer>
            </div>
          </article>
        )}
      </dialog>

      <section
        className="hero"
        id="top"
        aria-labelledby="hero-title"
        data-motion
        data-graphics={theme === "serum" && (!ambientMotionEnabled || !heroGraphicsReady) ? "fallback" : "active"}
      >
        <div className="hero-atmosphere" aria-hidden="true">
          <span className="serum-orb serum-orb-a" />
          <span className="serum-orb serum-orb-b" />
          <span className="clinical-grid" />
          <span className="shoal-field" />
        </div>
        {ambientMotionEnabled && theme === "clinical" && <iframe className="getlayers-frame getlayers-shoal" src="/assets/getlayers/shoal/index.html" title="" aria-hidden="true" tabIndex={-1} />}
        {ambientMotionEnabled && theme === "serum" && <iframe className="getlayers-frame getlayers-opaline" src={`/assets/getlayers/opaline/index.html?v=${SITE_RELEASE}#embed=hero`} title="" aria-hidden="true" tabIndex={-1} onError={() => setHeroGraphicsReady(false)} />}
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
          <div className="hero-copy-stage">
            {departingHeroProduct && (
              <div className="hero-copy-product departing" aria-hidden="true">
                <HeroBrandLockup product={departingHeroProduct} />
                <p className="eyebrow"><SparkIcon /> {heroEyebrow(departingHeroProduct)}</p>
                <p className="hero-product-headline hero-departing-title">{heroHeadline(departingHeroProduct)}</p>
                <p className="hero-lead">{heroDescription(departingHeroProduct)}</p>
              </div>
            )}
            <div className={heroAnimating ? "hero-copy-product arriving" : "hero-copy-product"} key={`hero-copy-${heroProduct.id}-${heroMotionCycle}`}>
              <HeroBrandLockup product={heroProduct} />
              <p className="eyebrow"><SparkIcon /> {heroEyebrow(heroProduct)}</p>
              <h1 id="hero-title" className="hero-product-headline">{heroHeadline(heroProduct)}</h1>
              <p className="hero-lead">{heroDescription(heroProduct)}</p>
            </div>
          </div>
          <div className="hero-actions">
            <a className="primary-action" href="#catalog" onClick={(event) => { event.preventDefault(); showAllCatalog(); }}>Выбрать средство <ArrowIcon /></a>
            <a className="text-action" href="#guide" onClick={(event) => { event.preventDefault(); showGuide(); }}>Как выбрать</a>
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
          <p className="hero-product-code">{heroProduct.brand} / NEW / {heroProduct.id} / ? НАЛИЧИЕ</p>
          <button type="button" className="hero-packshot-frame hero-product-detail-trigger" onClick={() => showProductDetails(heroProduct.id)} aria-label={`Открыть карточку товара: ${heroProduct.title}`}>
            {departingHeroProduct && (
              <Image
                className="hero-product-image departing transition-prism"
                key={`departing-${departingHeroProduct.id}-${heroMotionCycle}`}
                src={productPackshot(departingHeroProduct)}
                alt=""
                fill
                sizes="(max-width: 760px) 92vw, 46vw"
                aria-hidden="true"
                style={{ "--hero-product-scale": departingHeroProduct.heroScale ?? 1 } as React.CSSProperties}
              />
            )}
            <Image
              className={heroAnimating ? "hero-product-image arriving transition-prism" : "hero-product-image"}
              key={`${heroProduct.id}-${heroMotionCycle}`}
              src={productPackshot(heroProduct)}
              alt={heroProduct.title}
              fill
              sizes="(max-width: 760px) 92vw, 46vw"
              loading="eager"
              fetchPriority="high"
              style={{ "--hero-product-scale": heroProduct.heroScale ?? 1 } as React.CSSProperties}
            />
          </button>
          <div className="hero-product-controls" role="group" aria-label="Все новинки ANESTET, зарегистрированный товарный знак">
            <button type="button" className="previous" onClick={() => showHeroProduct(-1)} aria-label="Предыдущий продукт"><ArrowIcon /></button>
            <span>{String(safeHeroProductIndex + 1).padStart(2, "0")} / {String(heroProducts.length).padStart(2, "0")}</span>
            <button type="button" onClick={() => showHeroProduct(1)} aria-label="Следующий продукт"><ArrowIcon /></button>
            <button type="button" className="hero-carousel-toggle" aria-pressed={heroCarouselUserPaused} onClick={() => setHeroCarouselUserPaused((paused) => !paused)}>{heroCarouselUserPaused ? "Запустить" : "Пауза"}</button>
          </div>
          <div className="hero-product-label" aria-live="off">
            <div className="hero-label-stage">
              {departingHeroProduct && (
                <div className="hero-label-panel departing transition-prism" aria-hidden="true">
                  <span>{departingHeroProduct.tag}{departingHeroProduct.compareAtPrice ? " · Скидка" : ""}</span>
                  <strong>{departingHeroProduct.compactTitle}</strong>
                  <span className="hero-product-price"><b>{formatPrice(departingHeroProduct.price)}</b>{departingHeroProduct.compareAtPrice && <del>{formatPrice(departingHeroProduct.compareAtPrice)}</del>}</span>
                </div>
              )}
              <div className={heroAnimating ? "hero-label-panel arriving transition-prism" : "hero-label-panel"} key={`label-${heroProduct.id}-${heroMotionCycle}`}>
                <span>{heroProduct.tag}{heroProduct.compareAtPrice ? " · Скидка" : ""}</span>
                <strong>{heroProduct.compactTitle}</strong>
                <span className="hero-product-price"><b>{formatPrice(heroProduct.price)}</b>{heroProduct.compareAtPrice && <del>{formatPrice(heroProduct.compareAtPrice)}</del>}</span>
              </div>
            </div>
            <button type="button" className={favorites.includes(heroProduct.id) ? "hero-product-favorite active" : "hero-product-favorite"} aria-pressed={favorites.includes(heroProduct.id)} aria-label={favorites.includes(heroProduct.id) ? `Убрать из избранного: ${heroProduct.title}` : `Добавить в избранное: ${heroProduct.title}`} onClick={() => toggleFavorite(heroProduct.id)}><HeartIcon size={17} /></button>
            <button type="button" className="hero-product-add" onClick={() => addToCart(heroProduct.id)}>
              В корзину <BagIcon size={16} title="" />
            </button>
          </div>
        </div>
        <p className="hero-side-note">Профессиональные формулы<br />{" "}для ежедневной практики</p>
        <div className="scroll-cue" aria-hidden="true"><span /> Листайте</div>
        <div className="shopping-navigation hero-quick-route" id="shopping" aria-labelledby="shopping-title">
          <div>
            <p className="section-index">Быстрый маршрут</p>
            <h2 id="shopping-title"><span>Купить сразу</span><span>или подобрать</span></h2>
          </div>
          <div className="shopping-tabs" role="group" aria-label="Режим просмотра магазина">
            <button id="shopping-tab-catalog" type="button" aria-pressed={shoppingMode === "catalog"} className={shoppingMode === "catalog" ? "active" : ""} onClick={showAllCatalog}>
              <span>01</span><strong>Купить сразу</strong><small>Открыть каталог и выбрать нужное средство</small>
            </button>
            <button id="shopping-tab-guide" type="button" aria-pressed={shoppingMode === "guide"} className={shoppingMode === "guide" ? "active" : ""} onClick={showGuide}>
              <span>02</span><strong>Подобрать средство</strong><small>Понятный маршрут до, во время и после процедуры</small>
            </button>
          </div>
        </div>
      </section>

      {shoppingMode === "guide" && (
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
          <p>Выберите момент применения, формат работы и зону ухода. Ниже — подробная навигация по данным и описаниям текущего каталога ANESTET®.</p>
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
                <div className="guide-lines" aria-label={`Линейки и быстрые переходы: ${stage.lines.map((line) => line.label).join(", ")}`}>
                  {stage.lines.map((line) => (
                    <button
                      type="button"
                      key={line.label}
                      className={focusedProductId === line.productId ? "active" : ""}
                      aria-pressed={focusedProductId === line.productId}
                      aria-label={`${line.label}: показать товар в каталоге`}
                      onClick={() => showStageProducts(stage.id, line.productId)}
                    >
                      {line.label}<ArrowIcon />
                    </button>
                  ))}
                </div>
                <button type="button" className="guide-action" onClick={() => showStageProducts(stage.id)}>
                  Показать товары этапа · {stage.productIds.length} <ArrowIcon />
                </button>
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

      {shoppingMode === "catalog" && (
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
            <button type="button" key={item} className={filter === item ? "active" : ""} aria-pressed={filter === item} onClick={() => chooseCatalogFilter(item)}>{item === "ANESTET" ? <BrandLabel brand={item} className="filter-brand-label" /> : item}</button>
          ))}
        </div>
        {selectedCareStage && (
          <div className="catalog-scope-status" role="status" aria-live="polite">
            <span>{selectedCareStage.number}</span>
            <div>
              <small>Товары этапа</small>
              <strong>{selectedCareStage.title}</strong>
              <p>{visibleProducts.length} {visibleProducts.length === 1 ? "товар" : visibleProducts.length < 5 ? "товара" : "товаров"}</p>
            </div>
            <button type="button" onClick={showAllCatalog}>Показать весь каталог <ArrowIcon /></button>
          </div>
        )}
        <div className="product-grid" aria-live="polite">
          {visibleProducts.map((product, index) => {
            const cartQuantity = cart.find((line) => line.id === product.id)?.quantity ?? 0;
            return (
              <article
                id={`product-${product.id}`}
                className={focusedProductId === product.id ? "product-card targeted" : "product-card"}
                key={product.id}
                tabIndex={-1}
                aria-current={focusedProductId === product.id ? "true" : undefined}
                data-reveal
                style={{ "--card-index": index } as React.CSSProperties}
              >
                <div className="product-media">
                  <span className="product-tag">{product.tag}</span>
                  <div className="product-badges">{product.isNew && <span className="product-new">Новинка</span>}{product.compareAtPrice && <span className="product-discount">Скидка</span>}</div>
                  <button type="button" className={favorites.includes(product.id) ? "product-favorite active" : "product-favorite"} aria-pressed={favorites.includes(product.id)} aria-label={favorites.includes(product.id) ? `Убрать из избранного: ${product.title}` : `Добавить в избранное: ${product.title}`} onClick={() => toggleFavorite(product.id)}><HeartIcon size={22} /></button>
                  <button type="button" className="product-packshot-frame product-detail-trigger" onClick={() => showProductDetails(product.id)} aria-label={`Открыть карточку товара: ${product.title}`}>
                    <Image src={productCardPackshot(product)} alt={product.title} fill sizes="(max-width: 390px) 100vw, (max-width: 760px) 50vw, (max-width: 1100px) 33vw, 25vw" loading="lazy" />
                    <span>Подробнее</span>
                  </button>
                </div>
                <button type="button" className={cartQuantity ? "quick-add selected" : "quick-add"} onClick={() => addToCart(product.id)} aria-label={cartQuantity ? `Добавить ещё: ${product.title}. В корзине ${cartQuantity}` : `Добавить ${product.title} в корзину`}>
                  {cartQuantity ? `В корзине · ${cartQuantity}` : "В корзину"}
                  <BagIcon size={18} title="" />
                </button>
                <div className="product-info">
                  <BrandLabel brand={product.brand} className="product-brand-label" />
                  <h3><button type="button" className="product-title-trigger" onClick={() => showProductDetails(product.id)}>{product.compactTitle}</button></h3>
                  <span className="product-price"><strong>{formatPrice(product.price)}</strong>{product.compareAtPrice && <del>{formatPrice(product.compareAtPrice)}</del>}</span>
                  <span className="availability-inline" title="Наличие уточняется менеджером перед подтверждением заказа"><b aria-hidden="true">?</b><span>Наличие уточняется</span></span>
                </div>
              </article>
            );
          })}
        </div>
        <p className="availability-legend"><span aria-hidden="true">?</span><strong>Наличие уточняется.</strong> До подключения 1С менеджер проверяет остаток перед подтверждением заказа.</p>
      </section>
      )}

      <section className="proof-strip" id="proof" aria-label="Факты о каталоге">
        {proof.map((item) => (
          <div key={item.label} data-reveal>
            <strong>{item.label === "позиции в текущем каталоге" ? catalogProducts.length : item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
        <p data-reveal>Все цифры основаны на текущем каталоге и опубликованных документах сайта.</p>
      </section>

      <section className="about-brand" id="about" aria-labelledby="about-title" data-motion>
          <div className="about-portrait" data-reveal>
            <span className="about-year">2016—2026</span>
            <span className="about-optical-core" aria-hidden="true" />
            <span className="about-orbit about-orbit-a" aria-hidden="true" />
            <span className="about-orbit about-orbit-b" aria-hidden="true" />
            <Image src="/assets/img/partners/alexander-founder-cropped-v3.webp" alt="Александр Ермолаев, основатель компании" width={551} height={1128} loading="lazy" />
            <span className="about-founder-caption"><strong>Александр Ермолаев</strong><small>Основатель компании</small></span>
          </div>
          <div className="about-copy" data-reveal>
            <p className="section-index">О бренде / собственная лаборатория</p>
            <h2 id="about-title">Создаём то, что нужно вашей работе</h2>
            <p className="about-intro">Мы начали путь в 2016 году с профессиональных средств для мастеров перманента и косметологов. В 2024 году появились FION — развитие формул ANESTET® — и Queen Key, премиальная уходовая косметика для лица. Продукты разрабатываются и производятся в собственной лаборатории в Москве с контролем качества на каждом этапе.</p>
            <div className="about-principles">
              {brandPrinciples.map(([title, text], index) => (
                <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{text}</p></div></article>
              ))}
            </div>
          </div>
      </section>
      <nav className="brand-links about-section-links" aria-label="Материалы о компании">
          <a href="#company-info" onClick={() => openCompanySection("partners")}>Партнёрам <ArrowIcon /></a>
          <a href="#company-info" onClick={() => openCompanySection("delivery")}>Доставка и оплата <ArrowIcon /></a>
          <a href="#company-info" onClick={() => openCompanySection("certificates")}>Сертификаты <ArrowIcon /></a>
          <a href="#company-info" onClick={() => openCompanySection("contacts")}>Контакты <ArrowIcon /></a>
      </nav>

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
              <div className="company-panel-copy"><p>Партнёрская сеть</p><h3>ANESTET® рядом с мастерами</h3><p>Продукцию представляют профессиональные магазины и профильные площадки. По вопросам сотрудничества напишите команде бренда.</p><a href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Партнёрство с ANESTET®")}`}>Стать партнёром <ArrowIcon /></a></div>
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
              <div className="company-panel-copy"><p>Связаться с нами</p><h3>Контакты ANESTET®</h3><p>Поддержка по продуктам, заказам, доставке и партнёрству.</p></div>
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
          <div><p className="section-index">ANESTET® в эфире</p><h2 id="social-title">Продукты в движении</h2></div>
          <p>{vkPublications.length ? "Живая лента официального VK: обложка, краткое описание и заголовок каждой новости; видео запускаются прямо на сайте, фотопубликации открываются в сообществе." : "Единая официальная лента VK. После подключения токена здесь появятся все доступные новости и ролики с реальными превью публикаций."}</p>
        </header>
        {vkPublications.length ? (
          <div className="vk-video-rail" aria-label="Новости и видео официального сообщества VK">
            <div className="vk-video-track">
            {(vkPublications.length > 1 ? [...vkPublications, ...vkPublications] : vkPublications).map((publication, index) => {
              const duplicate = index >= vkPublications.length;
              const product = catalogProducts.find((item) => item.id === publication.productId);
              const content = <>
                <span className="vk-video-poster">
                  <img src={publication.posterUrl} alt="" width={publication.posterWidth} height={publication.posterHeight} loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                  {publication.kind === "video" && <i className="vk-play-mark" aria-hidden="true"><span /></i>}
                  <small>{publication.kind === "video" ? videoDuration(publication.duration) : "Новость"}</small>
                </span>
                <span className="vk-video-copy">
                  <span><Image src="/assets/icons/social/vk.svg" alt="" width={22} height={22} aria-hidden="true" /> Официальный VK</span>
                  <strong>{publication.title}</strong>
                  <p>{publication.excerpt || "Официальная публикация сообщества ANESTET® × Queen Key."}</p>
                  <small>{product ? `К товару · ${product.compactTitle}` : publication.kind === "video" ? "Смотреть ролик" : "Читать публикацию"}</small>
                </span>
              </>;
              return (
                publication.kind === "video"
                  ? <button className="vk-video-card" type="button" key={`${publication.id}-${duplicate ? "copy" : "main"}`} onClick={() => setOpenVkVideo(publication)} aria-label={`Смотреть видео: ${publication.title}`} aria-hidden={duplicate || undefined} tabIndex={duplicate ? -1 : undefined}>{content}</button>
                  : <a className="vk-video-card" href={publication.sourceUrl} target="_blank" rel="noreferrer" key={`${publication.id}-${duplicate ? "copy" : "main"}`} aria-label={`Читать публикацию VK: ${publication.title}`} aria-hidden={duplicate || undefined} tabIndex={duplicate ? -1 : undefined}>{content}</a>
              );
            })}
            </div>
          </div>
        ) : (
          <a className="vk-feed-empty-state" href="https://vk.ru/queenkeyanestet" target="_blank" rel="noreferrer">
            <span className="vk-feed-empty-visual" aria-hidden="true"><i /><b /><Image src="/assets/icons/social/vk.svg" alt="" width={54} height={54} /></span>
            <span><small>Официальное сообщество</small><strong>Новости и видео Queen Key × ANESTET®</strong><em>Открыть публикации VK <ArrowIcon /></em></span>
          </a>
        )}
        <p className="social-feed-note">Источник: официальное сообщество Queen Key × ANESTET®. API-токен хранится только на сервере; синхронизированные публикации можно скрыть или связать с товаром в админке.</p>
      </section>

      <section className="callback-section" id="callback" aria-labelledby="callback-title" data-motion>
        <div className="callback-heading" data-reveal>
          <p className="section-index">Связаться / без ожидания на линии</p>
          <h2 id="callback-title">Обратный звонок</h2>
          <p>Оставьте номер — команда ANESTET® свяжется с вами в рабочее время и поможет с продуктом, заказом или партнёрством.</p>
        </div>
        <form className="callback-form" onSubmit={submitCallback} data-reveal>
          <label className="callback-phone"><span>Телефон</span><input type="tel" name="phone" autoComplete="tel" inputMode="tel" required minLength={10} placeholder="+7 999 000-00-00" value={callbackPhone} onChange={(event) => { setCallbackPhone(event.target.value); setCallbackState({}); }} /></label>
          <label className="callback-consent"><input type="checkbox" required checked={callbackConsent} onChange={(event) => { setCallbackConsent(event.target.checked); setCallbackState({}); }} /><span>Соглашаюсь на обработку персональных данных согласно <a href="/assets/img/documents/politika-konfidenczialnosti.docx">политике конфиденциальности</a>.</span></label>
          <label className="callback-consent secondary"><input type="checkbox" checked={callbackMarketing} onChange={(event) => setCallbackMarketing(event.target.checked)} /><span>Хочу получать новости о продуктах и специальных предложениях.</span></label>
          {callbackState.error && <p className="callback-message error" role="alert">{callbackState.error}</p>}
          {callbackState.success && <p className="callback-message success" role="status">Заявка {callbackState.success} принята. Мы свяжемся с вами в ближайшее рабочее время.</p>}
          <button type="submit" disabled={callbackState.submitting || !callbackConsent}>{callbackState.submitting ? "Отправляем…" : "Заказать звонок"}<ArrowIcon /></button>
        </form>
      </section>

      <footer
        className="footer"
        data-motion
        onPointerEnter={(event) => {
          footerLightBoundsRef.current = event.currentTarget.getBoundingClientRect();
        }}
        onPointerMove={(event) => {
          const footer = event.currentTarget;
          const bounds = footerLightBoundsRef.current ?? footer.getBoundingClientRect();
          footerLightPointRef.current = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
          if (footerLightFrameRef.current) return;
          footerLightFrameRef.current = window.requestAnimationFrame(() => {
            const point = footerLightPointRef.current;
            footer.style.setProperty("--footer-light-x", `${point.x}px`);
            footer.style.setProperty("--footer-light-y", `${point.y}px`);
            footerLightFrameRef.current = null;
          });
        }}
        onPointerLeave={(event) => {
          footerLightBoundsRef.current = null;
          event.currentTarget.style.setProperty("--footer-light-x", "78%");
          event.currentTarget.style.setProperty("--footer-light-y", "18%");
        }}
      >
        <div className="footer-fashion-motion" aria-hidden="true">
          <span className="footer-fashion-thread" />
        </div>
        <div className="footer-brand-line" aria-hidden="true">
          <span>ANESTET®</span><span>CLINICAL CARE</span><span>QUEEN KEY</span><i />
        </div>
        <div className="footer-grid">
          <div><p>Связаться</p><a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a><a href="tel:+79101774142">{SUPPORT_PHONE}</a></div>
          <div><p>Адрес</p><span>Москва, ул. Иловайская,<br />{" "}д. 20, корп. 2</span></div>
          <div><p>Режим работы</p><span>Пн—Пт / 09:00—18:00<br />{" "}Сб—Вс / выходной</span></div>
          <div><p>Тема</p><span>{themes.find((item) => item.id === theme)?.title} / {themes.find((item) => item.id === theme)?.longTitle}</span></div>
        </div>
        <nav className="footer-socials" aria-label="Социальные сети ANESTET">
          <a href="https://vk.ru/queenkeyanestet" target="_blank" rel="noreferrer">VK</a>
          <a href="https://t.me/Anestetprofessional" target="_blank" rel="noreferrer">Telegram</a>
          <a href="https://taplink.cc/anestet" target="_blank" rel="noreferrer">Все ссылки</a>
          <a href={`mailto:${SUPPORT_EMAIL}`}>Поддержка</a>
        </nav>
        <div className="footer-bottom">
          <div>
            <p className="footer-note">ANESTET® · профессиональные средства для косметологического ухода</p>
            <a className="site-release-link" href={GITHUB_RELEASES_URL} target="_blank" rel="noreferrer">Модификация {SITE_RELEASE}</a>
          </div>
          <a href="#top">Наверх <span aria-hidden="true">↑</span></a>
        </div>
      </footer>
    </main>
  );
}
