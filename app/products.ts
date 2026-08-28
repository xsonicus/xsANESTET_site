export type Product = {
  id: number;
  brand: string;
  title: string;
  compactTitle: string;
  price: number;
  image: string;
  tag: string;
};

export const products: Product[] = [
  { id: 17, brand: "ANESTET", title: "Гель для первичного охлаждения base, 30 мл", compactTitle: "Base 01 · 30 мл", price: 800, image: "/assets/img/optimized/transparent/17.webp", tag: "Первый этап" },
  { id: 33, brand: "ANESTET", title: "Гель для первичного охлаждения base, 400 мл", compactTitle: "Base 01 · 400 мл", price: 4900, image: "/assets/img/optimized/anestet-base-cutout.webp", tag: "Профессиональный объём" },
  { id: 34, brand: "ANESTET", title: "Гель для первичного охлаждения detail, 30 мл", compactTitle: "Detail 01 · 30 мл", price: 860, image: "/assets/img/optimized/transparent/34.webp", tag: "Первый этап" },
  { id: 35, brand: "FION", title: "Гель для первичного охлаждения FION ultra, 30 мл", compactTitle: "FION Ultra 01 · 30 мл", price: 900, image: "/assets/img/optimized/transparent/35.webp", tag: "Первый этап" },
  { id: 36, brand: "FION", title: "Гель для первичного охлаждения FION ultra, 400 мл", compactTitle: "FION Ultra 01 · 400 мл", price: 5200, image: "/assets/img/optimized/transparent/36.webp", tag: "Профессиональный объём" },
  { id: 37, brand: "ANESTET", title: "Гель для вторичного охлаждения base, 30 мл", compactTitle: "Base 02 · 30 мл", price: 2200, image: "/assets/img/optimized/transparent/37.webp", tag: "Второй этап" },
  { id: 38, brand: "ANESTET", title: "Гель для вторичного охлаждения base, 5 мл", compactTitle: "Base 02 · 5 мл", price: 450, image: "/assets/img/optimized/transparent/38.webp", tag: "Второй этап" },
  { id: 39, brand: "FION", title: "Гель для вторичного охлаждения FION ultra, 30 мл", compactTitle: "FION Ultra 02 · 30 мл", price: 2400, image: "/assets/img/optimized/transparent/39.webp", tag: "Второй этап" },
  { id: 40, brand: "FION", title: "Гель для вторичного охлаждения FION ultra, 5 мл", compactTitle: "FION Ultra 02 · 5 мл", price: 450, image: "/assets/img/optimized/transparent/40.webp", tag: "Второй этап" },
  { id: 42, brand: "QUEEN KEY", title: "Восстанавливающий крем для лица с церамидами, 50 мл", compactTitle: "Repair Ceramide · 50 мл", price: 2500, image: "/assets/img/optimized/transparent/42.webp", tag: "Восстановление" },
  { id: 48, brand: "LIGHT FROST", title: "Гель для наружного применения Light Frost, 30 мл", compactTitle: "Light Frost · 30 мл", price: 750, image: "/assets/img/optimized/transparent/48.webp", tag: "Компактный формат" },
  { id: 49, brand: "LIGHT FROST", title: "Гель для наружного применения Light Frost, 150 мл", compactTitle: "Light Frost · 150 мл", price: 2750, image: "/assets/img/optimized/transparent/49.webp", tag: "Средний формат" },
  { id: 50, brand: "LIGHT FROST", title: "Гель для наружного применения Light Frost, 400 мл", compactTitle: "Light Frost · 400 мл", price: 5400, image: "/assets/img/optimized/transparent/50.webp", tag: "Профессиональный объём" },
  { id: 51, brand: "LIGHT DEP", title: "Гель косметический для тела, 30 мл", compactTitle: "Body Gel · 30 мл", price: 900, image: "/assets/img/optimized/transparent/lightdep-51-cutout.webp", tag: "Для тела" },
  { id: 52, brand: "LIGHT DEP", title: "Гель косметический для тела, 75 мл", compactTitle: "Body Gel · 75 мл", price: 1600, image: "/assets/img/optimized/transparent/lightdep-52-cutout.webp", tag: "Для тела" },
  { id: 53, brand: "LIGHT DEP", title: "Гель косметический для тела, 300 мл", compactTitle: "Body Gel · 300 мл", price: 4350, image: "/assets/img/optimized/transparent/lightdep-53-cutout.webp", tag: "Профессиональный объём" },
  { id: 54, brand: "LIGHT DEP", title: "Гель косметический для лица, 300 мл", compactTitle: "Face Gel · 300 мл", price: 4350, image: "/assets/img/optimized/transparent/lightdep-54-cutout.webp", tag: "Для лица" },
  { id: 55, brand: "LIGHT DEP PRO", title: "Гель косметический professional, 30 мл", compactTitle: "Professional · 30 мл", price: 950, image: "/assets/img/optimized/transparent/lightdep-55-cutout.webp", tag: "Для мастеров" },
  { id: 56, brand: "LIGHT DEP PRO", title: "Гель косметический professional, 300 мл", compactTitle: "Professional · 300 мл", price: 4750, image: "/assets/img/optimized/transparent/lightdep-56-cutout.webp", tag: "Для мастеров" },
  { id: 57, brand: "АНЕСТОДЕРМ", title: "Гель косметический Анестодерм, 300 мл", compactTitle: "Анестодерм · 300 мл", price: 5050, image: "/assets/img/optimized/transparent/anestoderm-300ml.webp", tag: "Профессиональный объём" },
  { id: 58, brand: "MILDEP", title: "Крем Mildep Professional, 30 мл", compactTitle: "Mildep Pro · 30 мл", price: 700, image: "/assets/img/optimized/transparent/mildep-30ml.webp", tag: "Крем" },
  { id: 59, brand: "MILDEP", title: "Крем Mildep Professional, 300 мл", compactTitle: "Mildep Pro · 300 мл", price: 4000, image: "/assets/img/optimized/transparent/mildep-300ml.webp", tag: "Профессиональный объём" },
  { id: 60, brand: "QUEEN KEY", title: "Восстанавливающие сливки с Д-пантенолом, 200 мл", compactTitle: "Recovery Milk · 200 мл", price: 890, image: "/assets/img/optimized/slivki-cutout.webp", tag: "После процедуры" },
];

export const formatPrice = (price: number) => new Intl.NumberFormat("ru-RU").format(price) + " ₽";
