import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios";

/**
 * Client gọi backend qua API Gateway (BE/Realestate_Microservice, cổng 8080).
 * Mọi response thành công có dạng { data, meta }; lỗi có dạng { error: { code, message, details? }, meta }.
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

// ─── Lưu token ───────────────────────────────────────────────────────────────
export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

/** Phát ra khi phiên hết hạn hẳn (refresh thất bại) để AuthContext xoá user. */
export const SESSION_EXPIRED_EVENT = "auth:session-expired";

// ─── Lỗi API ─────────────────────────────────────────────────────────────────
export interface ApiErrorDetail {
  field: string;
  errors: string[];
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status?: number,
    public readonly details?: ApiErrorDetail[],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ErrorBody {
  error?: { code?: string; message?: string; details?: ApiErrorDetail[] };
}

const FIELD_LABEL: Record<string, string> = {
  email: "Email",
  password: "Mật khẩu",
  fullName: "Họ và tên",
  role: "Vai trò",
  bankName: "Ngân hàng",
  accountNumber: "Số tài khoản",
  accountHolder: "Chủ tài khoản",
};

/** Câu báo lỗi hiển thị cho người dùng, kèm tên trường khi backend báo VALIDATION_FAILED. */
export const getErrorMessage = (err: unknown): string => {
  if (err instanceof ApiError) {
    if (err.details?.length) {
      const fields = err.details.map((d) => FIELD_LABEL[d.field] ?? d.field).join(", ");
      return `${err.message}: ${fields}`;
    }
    return err.message;
  }
  return err instanceof Error ? err.message : "Đã xảy ra lỗi";
};

const toApiError = (error: AxiosError<ErrorBody>): ApiError => {
  if (!error.response) {
    return new ApiError("Không kết nối được máy chủ. Kiểm tra backend đã chạy chưa.", "NETWORK_ERROR");
  }
  const body = error.response.data?.error;
  return new ApiError(
    body?.message || "Đã xảy ra lỗi hệ thống",
    body?.code || "UNKNOWN_ERROR",
    error.response.status,
    body?.details,
  );
};

// ─── Axios instance ──────────────────────────────────────────────────────────
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Access token sống 15 phút. Gặp 401 thì đổi refresh token lấy cặp mới rồi gửi lại request (một lần).
// Nhiều request cùng 401 chỉ gọi /auth/refresh một lần (refresh token chỉ dùng được một lần).
let refreshing: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) throw new Error("NO_REFRESH_TOKEN");
  const res = await axios.post<{ data: { accessToken: string; refreshToken: string } }>(
    `${API_URL}/auth/refresh`,
    { refreshToken },
  );
  tokenStorage.set(res.data.data.accessToken, res.data.data.refreshToken);
  return res.data.data.accessToken;
};

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError<ErrorBody>) => {
    const original = error.config as RetriableConfig | undefined;
    const isAuthCall = original?.url?.startsWith("/auth/") && !original.url.startsWith("/auth/me");

    if (error.response?.status === 401 && original && !original._retried && !isAuthCall && tokenStorage.getRefresh()) {
      original._retried = true;
      try {
        refreshing ??= refreshAccessToken().finally(() => {
          refreshing = null;
        });
        const newToken = await refreshing;
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      } catch {
        tokenStorage.clear();
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
      }
    }
    return Promise.reject(toApiError(error));
  },
);

// ─── Helper có kiểu (interceptor đã bóc response.data nên kết quả là body { data, meta }) ──
export interface ApiEnvelope<T> {
  data: T;
  meta: {
    correlationId: string;
    timestamp: string;
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
  };
}

export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<ApiEnvelope<T>, ApiEnvelope<T>>(url, config),
  post: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    apiClient.post<ApiEnvelope<T>, ApiEnvelope<T>>(url, body, config),
  patch: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    apiClient.patch<ApiEnvelope<T>, ApiEnvelope<T>>(url, body, config),
  put: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    apiClient.put<ApiEnvelope<T>, ApiEnvelope<T>>(url, body, config),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<ApiEnvelope<T>, ApiEnvelope<T>>(url, config),
};
