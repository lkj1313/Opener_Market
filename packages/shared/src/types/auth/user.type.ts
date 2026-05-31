export interface User {
  id: string;
  email: string;
  nickname: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
}
