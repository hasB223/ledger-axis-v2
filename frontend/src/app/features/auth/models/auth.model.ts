export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthSession {
  accessToken: string;
  tenantId: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}
