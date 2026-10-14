export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginResponse {
  jwtToken: string;
  role: 'User' | 'Admin';
}

export interface ResetPasswordRequest {
  password: string;
  confirmPassword: string;
  email: string;
  token: string;
}
