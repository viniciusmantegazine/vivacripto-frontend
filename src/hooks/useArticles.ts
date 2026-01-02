import { useState, useCallback } from "react";
import { apiClient } from "@/services/api";
import { Article, Category } from "@/types";

export const useArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all articles
  const fetchArticles = useCallback(
    async (filters?: { categoryId?: string; isPublished?: boolean }) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get("/api/articles", { params: filters });
        if (response.data.success) {
          setArticles(response.data.data.articles);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch articles");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Fetch all categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/api/articles/categories");
      if (response.data.success) {
        setCategories(response.data.data.categories);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  }, []);

  // Create article
  const createArticle = useCallback(
    async (data: Omit<Article, "id" | "createdAt" | "updatedAt" | "views">) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.post("/api/articles", data);
        if (response.data.success) {
          setArticles([...articles, response.data.data.article]);
          return response.data.data.article;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create article");
      } finally {
        setLoading(false);
      }
    },
    [articles]
  );

  // Update article
  const updateArticle = useCallback(
    async (id: string, data: Partial<Article>) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.put(`/api/articles/${id}`, data);
        if (response.data.success) {
          setArticles(
            articles.map((a) => (a.id === id ? response.data.data.article : a))
          );
          return response.data.data.article;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update article");
      } finally {
        setLoading(false);
      }
    },
    [articles]
  );

  // Delete article
  const deleteArticle = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.delete(`/api/articles/${id}`);
        if (response.data.success) {
          setArticles(articles.filter((a) => a.id !== id));
          return true;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete article");
      } finally {
        setLoading(false);
      }
    },
    [articles]
  );

  // Publish article
  const publishArticle = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.post(`/api/articles/${id}/publish`);
        if (response.data.success) {
          setArticles(
            articles.map((a) => (a.id === id ? response.data.data.article : a))
          );
          return response.data.data.article;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to publish article");
      } finally {
        setLoading(false);
      }
    },
    [articles]
  );

  // Create category
  const createCategory = useCallback(
    async (data: Omit<Category, "id" | "createdAt" | "updatedAt">) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.post("/api/articles/categories", data);
        if (response.data.success) {
          setCategories([...categories, response.data.data.category]);
          return response.data.data.category;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create category");
      } finally {
        setLoading(false);
      }
    },
    [categories]
  );

  // Generate article with AI
  const generateArticle = useCallback(
    async (topic: string, categoryId: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.post("/api/articles/ai/generate-article", {
          topic,
          categoryId,
        });
        if (response.data.success) {
          setArticles([...articles, response.data.data.article]);
          return response.data.data.article;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to generate article");
      } finally {
        setLoading(false);
      }
    },
    [articles]
  );

  return {
    articles,
    categories,
    loading,
    error,
    fetchArticles,
    fetchCategories,
    createArticle,
    updateArticle,
    deleteArticle,
    publishArticle,
    createCategory,
    generateArticle,
  };
};
