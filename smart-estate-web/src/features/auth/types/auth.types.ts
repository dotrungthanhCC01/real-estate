// ─── Auth Role Types ─────────────────────────────────────────────────────────

export type UserRole = 'user' | 'landlord' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
}

export interface AuthContextValue extends AuthState {
  login: (email: string, password: string, role: UserRole) => void;
  logout: () => void;
}
