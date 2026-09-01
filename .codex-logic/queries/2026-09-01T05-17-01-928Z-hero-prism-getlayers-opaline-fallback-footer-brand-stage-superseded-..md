# Graphify Query

Question: Какие файлы и проверки определяют текущую утвержденную логику hero: Prism, GetLayers Opaline, взаимоисключающий fallback, динамический бренд товара и удаленную большую footer brand-stage? Отдели актуальную реализацию от superseded вариантов.
Graph: /Users/xsonicus/CodexRuntime/xsANESTET_site/graphify-out/graph.json

```text
Traversal: BFS depth=2 | Start: ['Итог', 'Исправлено', 'Инфраструктура'] | 20 nodes found

NODE ANESTET 2026.08.28-v10 [src=docs/releases/2026.08.28-v10.md loc=L1 community=]
NODE 2026.09.01-v13.1.2 [src=docs/releases/2026.09.01-v13.1.2.md loc=L1 community=]
NODE Packshots v13 / v2 QA — все 23 товара [src=output/packshots-v13-v2-qa/REPORT.md loc=L1 community=]
NODE Покупка без длинного скролла [src=docs/releases/2026.08.28-v10.md loc=L5 community=]
NODE Публикация [src=docs/releases/2026.09.01-v13.1.2.md loc=L11 community=]
NODE Дизайн и качество [src=docs/releases/2026.08.28-v10.md loc=L22 community=]
NODE REPORT.md [src=output/packshots-v13-v2-qa/REPORT.md loc=L1 community=]
NODE Корзина [src=docs/releases/2026.08.28-v10.md loc=L16 community=]
NODE Инфраструктура [src=docs/releases/2026.08.28-v10.md loc=L29 community=]
NODE 2026.08.28-v10.md [src=docs/releases/2026.08.28-v10.md loc=L1 community=]
NODE Итог [src=output/packshots-v13-v2-qa/REPORT.md loc=L5 community=]
NODE Метод [src=output/packshots-v13-v2-qa/REPORT.md loc=L13 community=]
NODE Проверка [src=docs/releases/2026.09.01-v13.1.2.md loc=L18 community=]
NODE Проверено [src=docs/releases/2026.08.28-v10.md loc=L36 community=]
NODE Исправлено [src=docs/releases/2026.09.01-v13.1.2.md loc=L5 community=]
NODE Автоматические проверки [src=output/packshots-v13-v2-qa/REPORT.md loc=L21 community=]
NODE 2026.09.01-v13.1.2.md [src=docs/releases/2026.09.01-v13.1.2.md loc=L1 community=]
NODE Визуальная проверка [src=output/packshots-v13-v2-qa/REPORT.md loc=L31 community=]
NODE Новинки Queen Key [src=docs/releases/2026.08.28-v10.md loc=L11 community=]
NODE Откат [src=docs/releases/2026.09.01-v13.1.2.md loc=L27 community=]
EDGE Исправлено --contains [EXTRACTED]--> 2026.09.01-v13.1.2
EDGE Инфраструктура --contains [EXTRACTED]--> ANESTET 2026.08.28-v10
EDGE Итог --contains [EXTRACTED]--> Packshots v13 / v2 QA — все 23 товара
EDGE 2026.09.01-v13.1.2 --contains [EXTRACTED]--> 2026.09.01-v13.1.2.md
EDGE 2026.09.01-v13.1.2 --contains [EXTRACTED]--> Публикация
EDGE 2026.09.01-v13.1.2 --contains [EXTRACTED]--> Проверка
EDGE 2026.09.01-v13.1.2 --contains [EXTRACTED]--> Откат
EDGE Packshots v13 / v2 QA — все 23 товара --contains [EXTRACTED]--> REPORT.md
EDGE Packshots v13 / v2 QA — все 23 товара --contains [EXTRACTED]--> Метод
EDGE Packshots v13 / v2 QA — все 23 товара --contains [EXTRACTED]--> Автоматические проверки
EDGE Packshots v13 / v2 QA — все 23 товара --contains [EXTRACTED]--> Визуальная проверка
EDGE ANESTET 2026.08.28-v10 --contains [EXTRACTED]--> 2026.08.28-v10.md
EDGE ANESTET 2026.08.28-v10 --contains [EXTRACTED]--> Покупка без длинного скролла
EDGE ANESTET 2026.08.28-v10 --contains [EXTRACTED]--> Новинки Queen Key
EDGE ANESTET 2026.08.28-v10 --contains [EXTRACTED]--> Корзина
... (truncated — 0 more nodes cut by ~900-token budget. Narrow with context_filter=['call'] or use get_node for a specific symbol)

```
