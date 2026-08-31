# Admin architecture decision

## Current state

- storefront: Next.js static export served by nginx;
- order writes: standalone Node Order API on loopback port 4317;
- production storefront reads the public `/api/catalog` endpoint, while localhost intentionally keeps a static preview fallback;
- Order API reads `ANESTET_CATALOG_STORE` before each order and uses its verified static map only while the shared file is absent;
- master stock source: not connected yet.

## Decision

Keep `/admin/` as an export-safe client application and run authentication/write operations in a separate loopback service. Persist a versioned catalog document and append-only audit log outside the web root.

```text
browser /admin/
      |
      | same-origin HTTPS, HttpOnly cookie, Origin + CSRF
      v
nginx /api/admin/*  --->  admin service :4318  ---> catalog.json
                                                `-> admin-audit.jsonl
                              |
                              `-> server-only connector adapters (future)

storefront runtime     ---- public /api/catalog --------------^
order validation       ---- shared ANESTET_CATALOG_STORE -----^
1C connector           ---- future master-data adapter -------^
```

## Invariants

- No credential or password hash enters `NEXT_PUBLIC_*`, static JS, Git, API errors or logs.
- The service fails to start if username, password hash or exact public origin is missing.
- Admin port binds to loopback by default.
- Mutations require authenticated session, exact Origin and CSRF token.
- Discount is valid only when `compareAtPrice > price`.
- Concurrent stale edits fail with HTTP 409; they never silently overwrite a newer revision.
- Product storage is outside the nginx document root and is replaced atomically.
- Audit contains actor, action and changed field names, not credentials or full request bodies.
- Connector credentials exist only in the server process environment; status responses are fully redacted.
- A connector check without complete configuration or an installed protocol adapter performs zero external requests.

## Non-goals for this bounded MVP

- user/role management, password recovery or external SSO;
- product image upload and malware/media processing;
- publishing directly to 1С, Bitrix or MODX;
- overriding authoritative stock without a connected master system;
- pretending the duplicated static storefront/order catalogs are already synchronized.

## Migration path

1. Seed the admin catalog from the verified 23-product dataset.
2. Provision one shared `catalog.json` for both loopback services and verify backup/restore.
3. Add an explicit cache/ETag policy to the public catalog endpoint when traffic requires it.
4. Add 1С adapter, SKU mapping, synchronization timestamps and conflict policy.
5. Replace single-admin PBKDF2 auth with audited SSO when more operators or roles are required.
