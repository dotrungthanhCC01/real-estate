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

export interface AuthContextValue extends AuthState {
  login: (email: string, password: string, role: UserRole) => void;
  logout: () => void;
  updateProfile: (data: Partial<EditableProfile>) => void;
}
