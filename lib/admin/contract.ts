export type AdminProduct = {
  id: number;
  sku: string;
  brand: string;
  title: string;
  compactTitle: string;
  tag: string;
  image: string;
  price: number;
  compareAtPrice: number | null;
  isNew: boolean;
  isDiscount: boolean;
  active: boolean;
  revision: number;
  updatedAt: string;
};

export type AdminProductInput = Omit<AdminProduct, "revision" | "updatedAt">;

export type AdminSession = {
  authenticated: true;
  username: string;
  csrfToken: string;
  expiresAt: string;
};

export type AdminSessionState = AdminSession | {
  authenticated: false;
};

export type AdminCatalogResponse = {
  ok: true;
  catalogRevision: number;
  products: AdminProduct[];
};

export type AdminErrorResponse = {
  ok: false;
  error: string;
  code?: string;
};

export type AdminIntegration = {
  id: "onec" | "cdek" | "universal";
  title: string;
  purpose: string;
  configured: boolean;
  state: "not_configured" | "configured" | "adapter_pending";
  fields: Array<{ label: string; value: string }>;
  missing: string[];
  issues: string[];
  externalRequestsEnabled: false;
};

export type AdminIntegrationsResponse = {
  ok: true;
  integrations: AdminIntegration[];
};

export type AdminIntegrationCheckResponse = {
  ok: boolean;
  integrationId: AdminIntegration["id"];
  state: "not_configured" | "adapter_pending";
  externalRequestMade: false;
  checkedAt: string;
  error?: string;
};
