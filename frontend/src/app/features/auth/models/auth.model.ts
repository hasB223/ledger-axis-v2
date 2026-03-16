export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthSession {
  accessToken: string;
  tenantId: string | number;
  user: {
    id: string;
    email: string;
    name: string;
    role?: string;
  };
}

export interface AuthApiResponse {
  token: string;
  user: {
    id: string | number;
    tenantId: string | number;
    email: string;
    fullName: string;
    role: string;
  };
}
