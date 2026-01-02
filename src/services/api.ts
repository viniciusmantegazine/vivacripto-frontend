import axios, { AxiosInstance } from "axios";
import { ApiResponse, User } from "@/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || "30000");

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: API_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Restore token from localStorage if exists
    this.token = localStorage.getItem("authToken");
    if (this.token) {
      this.setAuthHeader();
    }

    // Add response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.clearAuth();
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  private setAuthHeader() {
    if (this.token) {
      this.client.defaults.headers.common["Authorization"] =
        `Bearer ${this.token}`;
    }
  }

  private clearAuth() {
    this.token = null;
    localStorage.removeItem("authToken");
    delete this.client.defaults.headers.common["Authorization"];
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("authToken", token);
    this.setAuthHeader();
  }

  getToken(): string | null {
    return this.token;
  }

  // Auth endpoints
  async getGoogleAuthUrl(): Promise<ApiResponse<{ url: string }>> {
    const response = await this.client.get("/api/auth/google");
    return response.data;
  }

  async googleCallback(idToken: string): Promise<
    ApiResponse<{
      token: string;
      user: User;
    }>
  > {
    const response = await this.client.post("/api/auth/google/callback", {
      idToken,
    });
    return response.data;
  }

  async verifyToken(token: string): Promise<
    ApiResponse<{
      valid: boolean;
      user?: User;
    }>
  > {
    const response = await this.client.post("/api/auth/verify-token", {
      token,
    });
    return response.data;
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    const response = await this.client.get("/api/auth/me");
    return response.data;
  }

  async logout(): Promise<ApiResponse> {
    this.clearAuth();
    const response = await this.client.post("/api/auth/logout");
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    const response = await this.client.get("/health");
    return response.data;
  }
}

export const apiClient = new ApiClient();
