const DEFAULT_BASE_URL = import.meta.env.VITE_REGISTRY_API_BASE_URL ?? "https://api.touchline.example.com";

export type RegistryIdentity = {
  id: string;
  displayName: string;
  registryDefinition: string;
  verificationLevel: string;
  status: string;
  scope: string;
  countryCode?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type RegistryIdentityListResponse = {
  data: RegistryIdentity[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
};

export type CreateRegistryIdentityPayload = {
  displayName: string;
  registryDefinition: string;
  verificationLevel: string;
  status: string;
  scope: string;
  countryCode?: string;
  notes?: string;
};

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = new URL(path, DEFAULT_BASE_URL.endsWith("/") ? DEFAULT_BASE_URL : `${DEFAULT_BASE_URL}/`);
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Correlation-ID": crypto.randomUUID(),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "Request failed");
    throw new Error(detail || `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function listRegistryIdentities(): Promise<RegistryIdentity[]> {
  const payload = await requestJson<RegistryIdentityListResponse>("/v1/registry-identities?page=1&pageSize=20");
  return payload.data ?? [];
}

export async function createRegistryIdentity(payload: CreateRegistryIdentityPayload): Promise<RegistryIdentity> {
  return requestJson<RegistryIdentity>("/v1/registry-identities", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
