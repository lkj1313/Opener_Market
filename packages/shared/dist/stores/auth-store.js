"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuthStore = void 0;
const zustand_1 = require("zustand");
function getStoredToken() {
    if (typeof window === 'undefined')
        return null;
    return localStorage.getItem('accessToken');
}
function getStoredUser() {
    if (typeof window === 'undefined')
        return null;
    try {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    }
    catch {
        return null;
    }
}
exports.useAuthStore = (0, zustand_1.create)((set) => ({
    accessToken: getStoredToken(),
    user: getStoredUser(),
    isLoggedIn: !!getStoredToken(),
    login: (token, user) => {
        localStorage.setItem('accessToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ accessToken: token, user, isLoggedIn: true });
    },
    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        set({ accessToken: null, user: null, isLoggedIn: false });
    },
}));
