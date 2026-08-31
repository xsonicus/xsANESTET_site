# Open questions

- Connector protocol details and official credentials for 1С, CDEK and future services are intentionally unavailable; adapters stay fail-closed.
- Warehouse stock authority remains unavailable until the 1С connector is supplied; storefront continues to show `?` and manager confirmation.
- Product media upload is intentionally deferred; admin accepts only already-published local `/assets/…` paths.
- Synthetic Lighthouse performance remains a REVIEW item despite clean functional/layout release gates; future work should profile initial React work and production response variance without weakening visual requirements.
