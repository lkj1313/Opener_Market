"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuthStore = void 0;
const zustand_1 = require("zustand");
exports.useAuthStore = (0, zustand_1.create)((set) => ({
    accessToken: null,
    user: null,
    isLoggedIn: false,
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
