

## 2026-08-28T09:51:15.004Z - Use source-faithful content and fail closed on commerce integrations

Decision: Copy brand/social/delivery content only from the authorized source snapshot or verified live source. Do not claim real-time stock, CDEK quoting, payment acquiring or 1C order submission until credentials and mappings are available.

Rationale: Prevents fabricated brand content and false commerce state while allowing a functional order-handoff checkout.

Branch: main


## 2026-08-28T12:34:51.894Z - New storefront is autonomous from legacy shop

Decision: All legacy-site customer journeys are migrated into the new ANESTET interface; the new site never links visitors to the old store.

Rationale: Preserves one coherent purchase journey, prevents broken/stylistically inconsistent handoffs, and allows backend integrations to be replaced behind the new UI without changing customer navigation.

Branch: main
