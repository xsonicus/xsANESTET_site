import type { AdminProduct } from "../../lib/admin/contract";
import type { CatalogStatusFilter } from "./admin-catalog-model";
import { brandGroups, groupFor } from "./admin-catalog-model";
import styles from "./admin.module.css";

type Props = {
  products: AdminProduct[];
  onOpenCatalog: (status: CatalogStatusFilter, brand?: string) => void;
};

export function AdminDashboard({ products, onOpenCatalog }: Props) {
  const metrics = [
    { label: "Всего товаров", value: products.length, status: "all" as const },
    { label: "Опубликовано", value: products.filter((product) => product.active).length, status: "published" as const },
    { label: "Новинки", value: products.filter((product) => product.isNew).length, status: "new" as const },
    { label: "Со скидкой", value: products.filter((product) => product.isDiscount).length, status: "discount" as const },
  ];
  const counts = new Map<string, number>();
  products.forEach((product) => counts.set(groupFor(product).id, (counts.get(groupFor(product).id) || 0) + 1));

  return (
    <div className={styles.dashboard}>
      <section aria-labelledby="catalog-overview-title">
        <div className={styles.sectionHeading}>
          <div><p className={styles.eyebrow}>ЖИВОЕ СОСТОЯНИЕ КАТАЛОГА</p><h2 id="catalog-overview-title">Обзор</h2></div>
          <p>Показатели рассчитаны из текущей серверной версии каталога.</p>
        </div>
        <div className={styles.metricsGrid}>
          {metrics.map((metric) => (
            <button key={metric.status} className={styles.metric} onClick={() => onOpenCatalog(metric.status)}>
              <span>{metric.label}</span><strong>{metric.value}</strong><small>Открыть выборку →</small>
            </button>
          ))}
        </div>
      </section>
      <section className={styles.brandOverview} aria-labelledby="brands-title">
        <div className={styles.sectionHeading}>
          <div><p className={styles.eyebrow}>СТРУКТУРА</p><h2 id="brands-title">Бренды</h2></div>
          <p>Группы соответствуют линейкам действующего магазина.</p>
        </div>
        <div className={styles.brandRows}>
          {brandGroups.map((brand) => {
            const count = counts.get(brand.id) || 0;
            return (
              <button key={brand.id} onClick={() => onOpenCatalog("all", brand.id)}>
                <span>{brand.label}</span><strong>{count}</strong><small>{count === 1 ? "товар" : "товаров"}</small>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
