// ─── Auth Role Types ─────────────────────────────────────────────────────────

export type UserRole = 'user' | 'landlord' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  address?: string;
  createdAt?: string; // ISO date – ngày tạo tài khoản
}

// Các trường người dùng được tự sửa ở trang Tài khoản
export type EditableProfile = Pick<AuthUser, "name" | "email" | "phone" | "address">;

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
}

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  role: Exclude<UserRole, "admin">;
}

export interface AuthContextValue extends AuthState {
  /** Đăng nhập qua API; vai trò do backend quyết định. Trả về user để điều hướng. */
  login: (email: string, password: string) => Promise<AuthUser>;
  /** Đăng ký rồi tự đăng nhập. */
  register: (input: RegisterInput) => Promise<AuthUser>;
  logout: () => void;
  /** Backend chưa có API sửa hồ sơ: chỉ cập nhật ở trình duyệt. */
  updateProfile: (data: Partial<EditableProfile>) => void;
}
