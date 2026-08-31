import type { AdminProduct } from "../../lib/admin/contract";

export type CatalogStatusFilter = "all" | "published" | "new" | "discount";

type BrandGroup = {
  id: string;
  label: string;
  matches: readonly string[];
};

export const brandGroups = [
  { id: "queen-key", label: "Queen Key", matches: ["QUEEN KEY"] },
  { id: "lightfrost", label: "Lightfrost", matches: ["LIGHT FROST"] },
  { id: "lightdep", label: "Lightdep", matches: ["LIGHT DEP"] },
  { id: "lightdep-professional", label: "Lightdep Professional", matches: ["LIGHT DEP PRO"] },
  { id: "fion", label: "FION", matches: ["FION"] },
  { id: "anestet", label: "ANESTET", matches: ["ANESTET"] },
  { id: "anestoderm", label: "Анестодерм", matches: ["АНЕСТОДЕРМ"] },
  { id: "mildep-professional", label: "Mildep Professional", matches: ["MILDEP"] },
] as const satisfies readonly BrandGroup[];

export function groupFor(product: AdminProduct) {
  return brandGroups.find((group) => (group.matches as readonly string[]).includes(product.brand)) || {
    id: `other-${product.brand.toLowerCase().replace(/[^a-zа-я0-9]+/gi, "-")}`,
    label: product.brand,
    matches: [product.brand],
  };
}

export function matchesStatus(product: AdminProduct, status: CatalogStatusFilter) {
  if (status === "published") return product.active;
  if (status === "new") return product.isNew;
  if (status === "discount") return product.isDiscount;
  return true;
}

export function filterProducts(products: AdminProduct[], search: string, brand: string, status: CatalogStatusFilter) {
  const query = search.trim().toLocaleLowerCase("ru");
  return products.filter((product) => {
    const matchesQuery = !query || [product.title, product.compactTitle, product.brand, product.sku, String(product.id)]
      .some((value) => value.toLocaleLowerCase("ru").includes(query));
    const matchesBrand = brand === "all" || groupFor(product).id === brand;
    return matchesQuery && matchesBrand && matchesStatus(product, status);
  });
}

export function groupedProducts(products: AdminProduct[]) {
  const groups = new Map<string, { id: string; label: string; products: AdminProduct[] }>();
  for (const product of products) {
    const group = groupFor(product);
    const current = groups.get(group.id) || { id: group.id, label: group.label, products: [] };
    current.products.push(product);
    groups.set(group.id, current);
  }
  const order = new Map<string, number>(brandGroups.map((group, index) => [group.id, index]));
  return [...groups.values()].sort((left, right) => (order.get(left.id) ?? 99) - (order.get(right.id) ?? 99));
}
