export type AuthUser = {
  id: number;
  username: string;
  isAdmin: boolean;
};

export interface UserAuthRepository {
  login(username: string, password: string): AuthUser | null;
}
