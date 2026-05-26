export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN';
export interface UserPayload {
    userId: string;
    email: string;
    role: UserRole;
}
