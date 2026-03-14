const API_BASE = import.meta.env.VITE_API_URL || "/api";

interface ApiOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {} } = options;
  const token = getToken();

  const fetchHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (token) {
    fetchHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: fetchHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    window.location.href = "/login";
    throw new ApiError("Authentication required", 401);
  }

  const json = await res.json();

  if (!res.ok || json.success === false) {
    throw new ApiError(
      json.error || `Request failed with status ${res.status}`,
      res.status,
      json.details
    );
  }

  return json.data as T;
}

// ─── Auth ─────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: { email, password },
    }),
  register: (name: string, email: string, password: string) =>
    apiFetch<{ user: User; token: string }>("/auth/register", {
      method: "POST",
      body: { name, email, password },
    }),
  getProfile: () => apiFetch<User>("/auth/profile"),
  updateProfile: (data: { name?: string; email?: string }) =>
    apiFetch<User>("/auth/profile", { method: "PUT", body: data }),
};

// ─── Dashboard ────────────────────────────────────────────
export const dashboardApi = {
  getKPIs: () => apiFetch<DashboardKPIs>("/dashboard"),
};

// ─── Products ─────────────────────────────────────────────
export const productApi = {
  getAll: (params?: { search?: string; categoryId?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.categoryId) qs.set("categoryId", params.categoryId);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    const q = qs.toString();
    return apiFetch<ProductListResponse>(`/products${q ? `?${q}` : ""}`);
  },
  getById: (id: string) => apiFetch<Product>(`/products/${id}`),
  create: (data: CreateProductData) =>
    apiFetch<Product>("/products", { method: "POST", body: data }),
  update: (id: string, data: Partial<CreateProductData>) =>
    apiFetch<Product>(`/products/${id}`, { method: "PUT", body: data }),
  delete: (id: string) =>
    apiFetch(`/products/${id}`, { method: "DELETE" }),
  getStock: (id: string) => apiFetch<StockLevel[]>(`/products/${id}/stock`),
  getReorderRules: (id: string) => apiFetch<ReorderRule[]>(`/products/${id}/reorder-rules`),
  createReorderRule: (id: string, data: CreateReorderRuleData) =>
    apiFetch<ReorderRule>(`/products/${id}/reorder-rules`, { method: "POST", body: data }),
  updateReorderRule: (ruleId: string, data: Partial<CreateReorderRuleData>) =>
    apiFetch<ReorderRule>(`/products/reorder-rules/${ruleId}`, { method: "PUT", body: data }),
  deleteReorderRule: (ruleId: string) =>
    apiFetch(`/products/reorder-rules/${ruleId}`, { method: "DELETE" }),
};

// ─── Categories ───────────────────────────────────────────
export const categoryApi = {
  getAll: () => apiFetch<Category[]>("/categories"),
  create: (name: string) =>
    apiFetch<Category>("/categories", { method: "POST", body: { name } }),
};

// ─── Warehouses ───────────────────────────────────────────
export const warehouseApi = {
  getAll: () => apiFetch<Warehouse[]>("/warehouses"),
  create: (data: { name: string; address?: string }) =>
    apiFetch<Warehouse>("/warehouses", { method: "POST", body: data }),
};

// ─── Locations ────────────────────────────────────────────
export const locationApi = {
  getAll: (warehouseId?: string) => {
    const qs = warehouseId ? `?warehouseId=${warehouseId}` : "";
    return apiFetch<Location[]>(`/locations${qs}`);
  },
  create: (data: { name: string; warehouseId: string }) =>
    apiFetch<Location>("/locations", { method: "POST", body: data }),
};

// ─── Receipts ─────────────────────────────────────────────
export const receiptApi = {
  getAll: (params?: { status?: string; page?: number }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.page) qs.set("page", String(params.page));
    const q = qs.toString();
    return apiFetch<OperationListResponse>(`/receipts${q ? `?${q}` : ""}`);
  },
  create: (data: CreateReceiptData) =>
    apiFetch("/receipts", { method: "POST", body: data }),
  update: (id: string, data: { status?: string; supplier?: string; notes?: string }) =>
    apiFetch(`/receipts/${id}`, { method: "PUT", body: data }),
  validate: (id: string) =>
    apiFetch(`/receipts/${id}/validate`, { method: "POST" }),
  addLine: (id: string, data: { productId: string; quantityOrdered: number }) =>
    apiFetch(`/receipts/${id}/lines`, { method: "POST", body: data }),
};

// ─── Deliveries ───────────────────────────────────────────
export const deliveryApi = {
  getAll: (params?: { status?: string; page?: number }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.page) qs.set("page", String(params.page));
    const q = qs.toString();
    return apiFetch<OperationListResponse>(`/deliveries${q ? `?${q}` : ""}`);
  },
  create: (data: CreateDeliveryData) =>
    apiFetch("/deliveries", { method: "POST", body: data }),
  update: (id: string, data: { status?: string }) =>
    apiFetch(`/deliveries/${id}`, { method: "PUT", body: data }),
  validate: (id: string) =>
    apiFetch(`/deliveries/${id}/validate`, { method: "POST" }),
};

// ─── Transfers ────────────────────────────────────────────
export const transferApi = {
  getAll: (params?: { status?: string; page?: number }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.page) qs.set("page", String(params.page));
    const q = qs.toString();
    return apiFetch<OperationListResponse>(`/transfers${q ? `?${q}` : ""}`);
  },
  create: (data: CreateTransferData) =>
    apiFetch("/transfers", { method: "POST", body: data }),
  update: (id: string, data: { status?: string }) =>
    apiFetch(`/transfers/${id}`, { method: "PUT", body: data }),
  validate: (id: string) =>
    apiFetch(`/transfers/${id}/validate`, { method: "POST" }),
};

// ─── Adjustments ──────────────────────────────────────────
export const adjustmentApi = {
  getAll: (params?: { status?: string; page?: number }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.page) qs.set("page", String(params.page));
    const q = qs.toString();
    return apiFetch<OperationListResponse>(`/adjustments${q ? `?${q}` : ""}`);
  },
  create: (data: CreateAdjustmentData) =>
    apiFetch("/adjustments", { method: "POST", body: data }),
  update: (id: string, data: { status?: string }) =>
    apiFetch(`/adjustments/${id}`, { method: "PUT", body: data }),
  validate: (id: string) =>
    apiFetch(`/adjustments/${id}/validate`, { method: "POST" }),
};

// ─── Move History ─────────────────────────────────────────
export const moveHistoryApi = {
  getAll: (params?: { moveType?: string; productId?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.moveType) qs.set("moveType", params.moveType);
    if (params?.productId) qs.set("productId", params.productId);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    const q = qs.toString();
    return apiFetch<MoveHistoryResponse>(`/move-history${q ? `?${q}` : ""}`);
  },
};

// ─── Types ────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardKPIs {
  totalProducts: number;
  totalStockLevels: number;
  lowStockItems: number;
  outOfStockItems: number;
  pendingReceipts: { total: number; late: number };
  pendingDeliveries: { total: number; late: number; waiting: number };
  scheduledTransfers: number;
}

export interface Category {
  id: string;
  name: string;
  _count?: { products: number };
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string | null;
  category: Category | null;
  uom: string;
  description: string | null;
  totalStock: number;
  stockLevels?: StockLevel[];
  createdAt: string;
  updatedAt: string;
}

export interface StockLevel {
  id: string;
  productId: string;
  locationId: string;
  location?: Location & { warehouse?: Warehouse };
  quantity: number;
}

export interface Warehouse {
  id: string;
  name: string;
  address: string | null;
  locations: Location[];
  _count?: { locations: number };
}

export interface Location {
  id: string;
  name: string;
  warehouseId: string;
  warehouse?: Warehouse;
}

export interface ProductListResponse {
  products: Product[];
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OperationItem {
  id: string;
  reference: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  location?: Location & { warehouse?: Warehouse };
  fromLocation?: Location & { warehouse?: Warehouse };
  toLocation?: Location & { warehouse?: Warehouse };
  supplier?: string;
  customer?: string;
  scheduledDate?: string;
  notes?: string;
  lines: OperationLine[];
  createdBy?: { id: string; name: string };
}

export interface OperationLine {
  id: string;
  productId: string;
  product: { id: string; name: string; sku: string };
  quantity?: number;
  quantityOrdered?: number;
  quantityReceived?: number;
  quantityDelivered?: number;
}

export interface OperationListResponse {
  receipts?: OperationItem[];
  deliveries?: OperationItem[];
  transfers?: OperationItem[];
  adjustments?: OperationItem[];
  pagination: Pagination;
}

export interface MoveHistoryItem {
  id: string;
  reference: string;
  moveType: string;
  productId: string;
  product: { id: string; name: string; sku: string };
  fromLocationId: string | null;
  fromLocation: (Location & { warehouse: Warehouse }) | null;
  toLocationId: string | null;
  toLocation: (Location & { warehouse: Warehouse }) | null;
  quantity: number;
  contact: string | null;
  date: string;
  status: string;
}

export interface MoveHistoryResponse {
  moves: MoveHistoryItem[];
  pagination: Pagination;
}

export interface CreateProductData {
  name: string;
  sku: string;
  categoryId?: string;
  uom?: string;
  description?: string;
  initialStock?: { locationId: string; quantity: number };
}

export interface CreateReceiptData {
  supplier?: string;
  locationId: string;
  scheduledDate?: string;
  notes?: string;
}

export interface CreateDeliveryData {
  customer?: string;
  locationId: string;
  scheduledDate?: string;
  notes?: string;
}

export interface CreateTransferData {
  fromLocationId: string;
  toLocationId: string;
  scheduledDate?: string;
  notes?: string;
}

export interface CreateAdjustmentData {
  locationId: string;
  reason?: string;
}

export interface ReorderRule {
  id: string;
  productId: string;
  locationId: string;
  location: Location & { warehouse: Warehouse };
  minQuantity: number;
  maxQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReorderRuleData {
  locationId: string;
  minQuantity: number;
  maxQuantity: number;
}
