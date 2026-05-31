import { User } from './types.js';
interface AuthState {
    accessToken: string | null;
    user: User | null;
    isLoggedIn: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
}
export declare const useAuthStore: import("zustand").UseBoundStore<import("zustand").StoreApi<AuthState>>;
export {};
