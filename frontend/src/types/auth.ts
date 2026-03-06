// Authentication types matching the API DTOs

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  expiresAt: string;
}

export interface User {
  email: string;
  fullName: string;
  token: string;
}
