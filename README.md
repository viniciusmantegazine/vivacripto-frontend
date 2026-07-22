# VerticeCripto Frontend

Frontend Next.js 14+ para o portal de notícias VerticeCripto.

## 🚀 Stack Técnico

- **Framework**: Next.js 14+ (App Router)
- **Linguagem**: TypeScript
- **Estilização**: TailwindCSS
- **Renderização**: SSG + ISR (Static Site Generation + Incremental Static Regeneration)
- **Hospedagem**: Vercel

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Home page
│   ├── posts/[slug]/       # Páginas de posts dinâmicas
│   ├── sitemap.ts          # Sitemap dinâmico
│   └── robots.ts           # Robots.txt
├── components/
│   ├── ui/                 # Componentes de UI
│   ├── layout/             # Componentes de layout
│   ├── posts/              # Componentes de posts
│   └── shared/             # Componentes compartilhados
├── services/
│   └── api.ts              # Cliente da API
├── styles/
│   └── globals.css         # Estilos globais
└── lib/                    # Utilitários
```

## 🔧 Instalação

### Requisitos

- Node.js 18+
- npm ou pnpm

### Setup Local

1. Clone o repositório:
```bash
git clone https://github.com/viniciusmantegazine/verticecripto-frontend.git
cd verticecripto-frontend
```

2. Instale as dependências:
```bash
npm install
# ou
pnpm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
# Edite o arquivo .env.local com a URL da API
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O site estará disponível em `http://localhost:3000`

## 🏗️ Build e Deploy

### Build Local

```bash
npm run build
npm start
```

### Deploy na Vercel

1. Conecte o repositório GitHub à Vercel
2. Configure a variável de ambiente `NEXT_PUBLIC_API_URL`
3. Deploy automático a cada push na branch `main`

## 🎨 Otimizações de SEO

- ✅ SSG para geração estática de páginas
- ✅ ISR para atualização incremental
- ✅ Sitemap dinâmico
- ✅ Robots.txt
- ✅ Meta tags otimizadas
- ✅ Open Graph e Twitter Cards
- ✅ Schema Markup (JSON-LD)
- ✅ Canonical URLs
- ✅ Otimização de imagens com Next.js Image
- ✅ Core Web Vitals otimizados

## 📝 Variáveis de Ambiente

- `NEXT_PUBLIC_API_URL`: URL da API backend

## 🤝 Contribuindo

1. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
2. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
3. Push para a branch (`git push origin feature/AmazingFeature`)
4. Abra um Pull Request

## 📄 Licença

MIT
