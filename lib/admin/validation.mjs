const TEXT_LIMITS = {
  sku: 80,
  brand: 80,
  title: 240,
  compactTitle: 120,
  tag: 100,
  image: 500,
};

function text(value, field, required = true) {
  if (typeof value !== "string") throw new Error(`${field}: ожидается строка`);
  const normalized = value.trim().replace(/[\u0000-\u001f\u007f]/g, " ");
  if (required && !normalized) throw new Error(`${field}: обязательное поле`);
  if (normalized.length > TEXT_LIMITS[field]) throw new Error(`${field}: слишком длинное значение`);
  return normalized;
}

function money(value, field, nullable = false) {
  if (nullable && (value === null || value === "" || value === undefined)) return null;
  const amount = Number(value);
  if (!Number.isInteger(amount) || amount < 0 || amount > 100_000_000) {
    throw new Error(`${field}: укажите целое количество рублей`);
  }
  return amount;
}

export function validateProduct(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Некорректные данные товара");
  const id = Number(input.id);
  if (!Number.isInteger(id) || id < 1 || id > 2_147_483_647) throw new Error("id: ожидается положительное целое число");
  const price = money(input.price, "price");
  const compareAtPrice = money(input.compareAtPrice, "compareAtPrice", true);
  const isDiscount = Boolean(input.isDiscount);
  if (isDiscount && (compareAtPrice === null || compareAtPrice <= price)) {
    throw new Error("Для скидки старая цена должна быть выше текущей");
  }
  if (!isDiscount && compareAtPrice !== null) throw new Error("Старая цена допустима только при включённой скидке");
  const image = text(input.image, "image");
  if (!image.startsWith("/assets/") || image.includes("..") || image.includes("\\")) {
    throw new Error("image: используйте опубликованный локальный путь /assets/…");
  }
  return {
    id,
    sku: text(input.sku, "sku"),
    brand: text(input.brand, "brand"),
    title: text(input.title, "title"),
    compactTitle: text(input.compactTitle, "compactTitle"),
    tag: text(input.tag, "tag"),
    image,
    price,
    compareAtPrice,
    isNew: Boolean(input.isNew),
    isDiscount,
    active: input.active !== false,
  };
}

export function validateExpectedRevision(value) {
  const revision = Number(value);
  if (!Number.isInteger(revision) || revision < 1) throw new Error("revision: некорректная версия товара");
  return revision;
}
