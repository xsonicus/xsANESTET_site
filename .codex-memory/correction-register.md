# Реестр правок — QK Cosmetic / ANESTET v13

Последняя явная правка пользователя заменяет конфликтующую предыдущую. Отменённые варианты сохраняются только как история и удаляются из активного интерфейса и кода.

| Requirement | Implementation | Correction of correction | Current approved implementation | Propagation |
| --- | --- | --- | --- | --- |
| Визуальные версии магазина | Три темы: Clinical, Editorial, Future Beauty | Editorial отменена | Ровно две темы: Future Beauty по умолчанию и Clinical Luxury | PASS: switcher, URL parsing, QA matrix, docs |
| Переходы hero | Несколько демонстрационных переходов и переключатель | Частицы и портал отклонены; утверждена призма | Только Prism без selector; упаковка не двигается и не масштабируется, подпись анимирована отдельно | PASS: public Codex Browser + layout gate |
| Сфера Future Beauty | Opaline справа от разделителя | Два круга и резкий шов отклонены; production clean-URL redirect удалял query-параметр позиционирования | Одна полноширинная Opaline-сцена за продуктом на одной оси; embedded-режим закреплён через hash, свет растворяется влево без границы iframe | PASS: production Codex Browser 1280×720, console clean |
| Мобильный первый экран | Длинный desktop-текст без отдельного живого акцента | На мобильном добавить красивую графическую деталь и уменьшить перегрузку | Сокращённый mobile lead и отдельная лёгкая оптическая орбита; desktop-копия скрыта | PASS: local Codex Browser 390 px + 11-width layout gate |
| Блок основателя | Маленький портрет в высокой пустой капсуле | Сначала портрет уменьшали, затем пользователь потребовал увеличить и сократить пустоты сверху/снизу | Крупный Александр в компактной живой оптической сцене; вертикальные интервалы сокращены | PASS: Codex Browser + layout gate |
| Ссылки компании | Четыре пункта внутри перегруженного about | Перенести ниже блока и уменьшить нижний зазор примерно втрое | Отдельная компактная полоса непосредственно под about | PASS: Codex Browser + layout gate |
| Footer | Крупные тёмные/дублированные логотипы и бегущий слой | В круге должен быть отдельный знак Queen Key, полный QK Cosmetic ниже; текст не должен ломаться в браузере | Читаемый ANESTET, официальный монограммный знак Queen Key внутри орбиты, официальный QK Cosmetic ниже, pointer light | PASS: локальный Codex Browser, desktop 1280×720 |
| Пакшоты | Прозрачные изображения с остаточными тенями/ореолами | Убрать все растровые тени, не менять надписи и RGB | 23 master-файла `*-alpha-restored-v2.webp` lossless и отдельные `*-card.webp`: только физический продукт/коробка на alpha; лёгкая тень создаётся CSS | PASS: 23/23 decoded RGBA + contact sheet + layout gate |
| Порядок каталога | Исходный порядок внутри фильтра | Новинки должны идти первыми в текущем разделе | Стабильная сортировка `isNew` first после применения текущего фильтра | PASS: локальный Codex Browser |
| Comet/console | Расхождение SSR/client и красный 401 на входе админки | Проверить обе ошибки браузера | `data-bybit-*` расширения изолированы через `suppressHydrationWarning`; анонимная session probe возвращает `200 authenticated:false`, защищённые данные сохраняют `401` | PASS: public Codex Browser console warnings/errors = 0 |
| Остатки | Нет официального источника | Подключение 1С будет позже | Знак `?` и пояснение «наличие уточняется» | PASS |
| Админка и коннекторы | План будущей интеграции | Создать локальную админку уже сейчас | `/admin`: create/update/soft-hide, скидки/статусы; только локальные `/assets/…`; ключи server-side; 1С/СДЭК fail-closed | PASS: local + public login/session/catalog smoke |
| Публикация | Локальные версии без окончательного VPS promotion | Доделать до конца и прислать ссылку | `2026.09.01-v13.1.2` на публичном TLS; три immutable release-каталога, atomic symlinks, root-only backup и rollback | PASS: public health/catalog/admin/browser evidence |

Финальный статус меняется на PASS только после `npm run build && npm run qa:layout` и локальной визуальной проверки в Codex Browser.
