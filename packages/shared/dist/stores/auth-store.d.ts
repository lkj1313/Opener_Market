import { User } from '../types/auth/user.type.js';
interface AuthState {
    accessToken: string | null;
    user: User | null;
    isLoggedIn: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
}
export declare const useAuthStore: import("zustand").UseBoundStore<import("zustand").StoreApi<AuthState>>;
export {};
