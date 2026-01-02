export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role?: "user" | "admin";
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (idToken: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  categoryId: string;
  authorId: string;
  isAIGenerated: boolean;
  isPublished: boolean;
  publishedAt?: Date;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Article extends NewsArticle {}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Newsletter {
  email: string;
  subscribedAt: string;
}
