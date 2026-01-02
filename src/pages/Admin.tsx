import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useArticles } from "@/hooks/useArticles";
import { Article, Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit2, Trash2, Send, Zap } from "lucide-react";

export const Admin: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const {
    articles,
    categories,
    loading,
    error,
    fetchArticles,
    fetchCategories,
    createArticle,
    deleteArticle,
    publishArticle,
    generateArticle,
  } = useArticles();

  const [activeTab, setActiveTab] = useState("articles");
  const [showNewArticleForm, setShowNewArticleForm] = useState(false);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [newArticle, setNewArticle] = useState({
    title: "",
    content: "",
    excerpt: "",
    categoryId: "",
  });
  const [generateData, setGenerateData] = useState({
    topic: "",
    categoryId: "",
  });

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  // Fetch data on mount
  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  const handleCreateArticle = async () => {
    if (!newArticle.title || !newArticle.content || !newArticle.categoryId) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    await createArticle({
      title: newArticle.title,
      slug: newArticle.title.toLowerCase().replace(/\s+/g, "-"),
      content: newArticle.content,
      excerpt: newArticle.excerpt,
      categoryId: newArticle.categoryId,
      authorId: user?.id || "",
      isAIGenerated: false,
      isPublished: false,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    setNewArticle({ title: "", content: "", excerpt: "", categoryId: "" });
    setShowNewArticleForm(false);
  };

  const handleGenerateArticle = async () => {
    if (!generateData.topic || !generateData.categoryId) {
      alert("Preencha todos os campos");
      return;
    }

    await generateArticle(generateData.topic, generateData.categoryId);
    setGenerateData({ topic: "", categoryId: "" });
    setShowGenerateForm(false);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Painel de Admin</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="articles">Artigos ({articles.length})</TabsTrigger>
            <TabsTrigger value="categories">Categorias ({categories.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="space-y-6">
            <div className="flex gap-4">
              <Button
                onClick={() => setShowNewArticleForm(!showNewArticleForm)}
                className="flex items-center gap-2"
              >
                <Plus size={20} />
                Novo Artigo
              </Button>
              <Button
                onClick={() => setShowGenerateForm(!showGenerateForm)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Zap size={20} />
                Gerar com IA
              </Button>
            </div>

            {showNewArticleForm && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Criar Novo Artigo</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Título"
                    value={newArticle.title}
                    onChange={(e) =>
                      setNewArticle({ ...newArticle, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded"
                  />
                  <select
                    value={newArticle.categoryId}
                    onChange={(e) =>
                      setNewArticle({ ...newArticle, categoryId: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <textarea
                    placeholder="Conteúdo"
                    value={newArticle.content}
                    onChange={(e) =>
                      setNewArticle({ ...newArticle, content: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded h-40"
                  />
                  <textarea
                    placeholder="Resumo (opcional)"
                    value={newArticle.excerpt}
                    onChange={(e) =>
                      setNewArticle({ ...newArticle, excerpt: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded h-20"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleCreateArticle}>Criar</Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowNewArticleForm(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {showGenerateForm && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Gerar Artigo com IA</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Tópico (ex: Bitcoin alcança novo patamar)"
                    value={generateData.topic}
                    onChange={(e) =>
                      setGenerateData({ ...generateData, topic: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded"
                  />
                  <select
                    value={generateData.categoryId}
                    onChange={(e) =>
                      setGenerateData({ ...generateData, categoryId: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <Button onClick={handleGenerateArticle} className="flex items-center gap-2">
                      <Zap size={20} />
                      Gerar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowGenerateForm(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <div className="space-y-4">
              {articles.map((article) => (
                <Card key={article.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {article.isAIGenerated && (
                          <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                            IA
                          </span>
                        )}
                        {article.isPublished ? (
                          <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded">
                            Publicado
                          </span>
                        ) : (
                          <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            Rascunho
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!article.isPublished && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => publishArticle(article.id)}
                          className="flex items-center gap-1"
                        >
                          <Send size={16} />
                          Publicar
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Edit2 size={16} />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteArticle(article.id)}
                        className="flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                        Deletar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Card key={category.id} className="p-4">
                  <div
                    className="w-12 h-12 rounded-lg mb-3"
                    style={{ backgroundColor: category.color || "#e5e7eb" }}
                  />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
