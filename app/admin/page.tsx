import type { Metadata } from "next";
import { AdminClient } from "./admin-client";
import styles from "./admin.module.css";

export const metadata: Metadata = {
  title: "Управление каталогом — QK Cosmetic",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminPage() {
  return (
    <main className={styles.shell}>
      <AdminClient />
    </main>
  );
}
