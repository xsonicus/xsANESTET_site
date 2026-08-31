

## 2026-08-28T09:51:15.004Z - Use source-faithful content and fail closed on commerce integrations

Decision: Copy brand/social/delivery content only from the authorized source snapshot or verified live source. Do not claim real-time stock, CDEK quoting, payment acquiring or 1C order submission until credentials and mappings are available.

Rationale: Prevents fabricated brand content and false commerce state while allowing a functional order-handoff checkout.

Branch: main


## 2026-08-28T12:34:51.894Z - New storefront is autonomous from legacy shop

Decision: All legacy-site customer journeys are migrated into the new ANESTET interface; the new site never links visitors to the old store.

Rationale: Preserves one coherent purchase journey, prevents broken/stylistically inconsistent handoffs, and allows backend integrations to be replaced behind the new UI without changing customer navigation.

Branch: main


## 2026-08-28T13:34:46.231Z - Allow legacy site only as an explicit comparison target

Decision: The top site-version switcher contains exactly three choices: Старый сайт, Одностраничный, Полный сайт. Старый сайт opens qkcosmetic.ru in a new tab. No other customer journey in the new storefront may hand off to the legacy store.

Rationale: The user needs a deliberate side-by-side comparison of the historical, one-page and full variants while preserving the autonomous new-site purchase flow.

Branch: main


## 2026-08-31T17:01:17.679Z - Утверждённая коррекция-of-correction v13

Decision: Применять только последнее утверждённое состояние: две темы, единственная position-stable Призма, бесшовный левый fade Opaline, чистые packshots без raster shadow, CSS-only contact shadow, читаемый footer с ANESTET и QK Cosmetic, shared secure admin.

Rationale: Пользователь последовательно уточнил и отменил промежуточные варианты. Отменённые частицы/портал/ветер, Beauty Editorial, уменьшенный Александр, дублированный footer и растровые тени не должны оставаться в UI.

Branch: main


## 2026-08-31T21:24:06.635Z - Выпускать correction-lineage сайты только с доказательством точного артефакта

Decision: Текущая утверждённая версия сайта, API, документации и durable context должна совпадать с публичным release identifier. PASS присваивается только после build/layout/admin/browser доказательств exact artifact; performance target может оставаться REVIEW без маскировки.

Rationale: Длинная цепочка визуальных правок содержала отменённые варианты и устаревшие статусы. Единый correction register и immutable deployment предотвращают возврат старых решений и ложное объявление готовности.

Branch: main
