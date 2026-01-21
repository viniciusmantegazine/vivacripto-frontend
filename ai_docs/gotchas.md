# Gotchas e Conhecimento Tácito

Este documento captura o conhecimento que desenvolvedores experientes acumulam ao longo do tempo - as "armadilhas" não documentadas, comportamentos contra-intuitivos e workarounds que são essenciais para trabalhar efetivamente neste repositório.

## Armadilhas Comuns

### 1. Variáveis de Ambiente Não Carregadas

**Sintoma**: API calls falham com `undefined` ou `localhost` mesmo em produção.

**Causa**: Variáveis de ambiente não foram configuradas no Vercel ou o prefixo `NEXT_PUBLIC_` está faltando.

**Solução**:
1. Verificar se `NEXT_PUBLIC_API_URL` está configurada no Vercel
2. Lembrar que variáveis sem `NEXT_PUBLIC_` não são expostas ao client-side
3. Após adicionar variáveis, fazer redeploy

**Contexto**: Next.js substitui variáveis em build time, não runtime. Mudanças requerem rebuild.

```bash
# Verificar variáveis localmente
echo $NEXT_PUBLIC_API_URL

# .env.local para desenvolvimento
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
REVALIDATE_SECRET=seu-secret-aqui
```

---

### 2. Cache do ISR Não Atualiza

**Sintoma**: Alterações no backend não aparecem no frontend mesmo após esperar o tempo de revalidação.

**Causa**:
- ISR só revalida quando há requisição à página
- Cache do CDN pode estar servindo versão antiga
- Revalidação on-demand não foi chamada

**Solução**:
1. Verificar se o endpoint `/api/revalidate` está sendo chamado pelo backend
2. Confirmar que `REVALIDATE_SECRET` está configurado e correto
3. Para teste manual:
```bash
curl -X POST https://seu-dominio.com/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"secret": "seu-secret", "path": "/posts/slug-do-post"}'
```

**Contexto**: ISR é "stale-while-revalidate" - serve cache antigo enquanto gera novo em background.

---

### 3. Imagens Não Carregam em Produção

**Sintoma**: Imagens funcionam localmente mas quebram em produção com erro 400 ou 403.

**Causa**: Domínio da imagem não está na whitelist do `next.config.js`.

**Solução**: Adicionar o domínio em `next.config.js`:

```javascript
images: {
  remotePatterns: [
    { hostname: 'res.cloudinary.com' },
    { hostname: 'assets.coingecko.com' },
    { hostname: 'novo-dominio.com' }  // Adicionar aqui
  ]
}
```

**Contexto**: Next.js Image Optimization requer whitelist de domínios por segurança.

---

### 4. Dark Mode Flash (FOUC)

**Sintoma**: Página pisca de tema claro para escuro no carregamento.

**Causa**: next-themes não foi configurado com `suppressHydrationWarning` ou o tema é aplicado após hidratação.

**Solução**: Verificar configuração em `app/layout.tsx`:

```tsx
<html lang="pt-BR" suppressHydrationWarning>
  <body>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  </body>
</html>
```

**Contexto**: O `suppressHydrationWarning` é necessário porque o servidor não sabe o tema do cliente.

---

### 5. Busca Retorna Resultados Duplicados

**Sintoma**: Mesma query retorna resultados diferentes ou duplicados rapidamente.

**Causa**: Race condition - múltiplas requisições simultâneas sem cancelamento.

**Solução**: Já implementado via `AbortController` em `SearchContent.tsx`. Se modificar a busca, manter o padrão:

```typescript
useEffect(() => {
  const controller = new AbortController();

  async function search() {
    try {
      const results = await searchPosts(query, controller.signal);
      setResults(results);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error(error);
      }
    }
  }

  search();

  return () => controller.abort();
}, [query]);
```

---

## Comportamentos Contra-Intuitivos

### 1. Páginas de Categoria São Estáticas

**O que parece**: Páginas de categoria deveriam atualizar automaticamente como a home.

**O que realmente acontece**: Categorias são geradas em build time (`generateStaticParams`). Posts novos só aparecem após novo build ou revalidação manual.

**Por quê**: Decisão de performance - categorias mudam menos frequentemente que a home.

**Implicações**:
- Novos posts em categorias requerem revalidação
- Use `/api/revalidate` com `path: '/categoria/bitcoin'` para atualizar

---

### 2. Server Components Não Podem Usar Hooks

**O que parece**: Qualquer componente pode usar `useState`, `useEffect`.

**O que realmente acontece**: Componentes em `app/` são Server Components por padrão e não suportam hooks.

**Por quê**: Server Components rodam no servidor, onde não há DOM nem estado de cliente.

**Implicações**:
- Adicione `'use client'` no topo do arquivo para usar hooks
- Mantenha Server Components quando possível (melhor performance)
- Componentes em `components/` que usam hooks precisam do directive

---

### 3. Fetch Padrão É no-store

**O que parece**: Requisições fetch deveriam cachear automaticamente.

**O que realmente acontece**: O projeto usa `cache: 'no-store'` explicitamente para garantir dados frescos.

**Por quê**: Para um portal de notícias, dados frescos são mais importantes que cache agressivo.

**Implicações**:
- Se precisar cachear, remova ou altere a opção `cache`
- O ISR cuida do cache a nível de página, não de requisição

---

### 4. TypeScript Paths Não Funcionam em Runtime

**O que parece**: `@/components/...` deveria funcionar em qualquer lugar.

**O que realmente acontece**: Paths são resolvidos em build time. Scripts Node puros não entendem.

**Por quê**: TypeScript paths são só aliases de compilação, não modificam o runtime.

**Implicações**:
- Em scripts de teste/build customizados, use caminhos relativos
- Dentro de arquivos compilados pelo Next.js, `@/` funciona normalmente

---

## Configurações Não-Óbvias

### 1. `dynamicParams = true` em Posts

**Configuração**: `app/posts/[slug]/page.tsx`

```typescript
export const dynamicParams = true;
```

**Valor Atual**: `true`

**Por que parece errado**: Parece que queremos apenas posts pré-gerados.

**Por que está certo**: Permite gerar novos posts on-demand. Sem isso, posts publicados após o build retornariam 404.

---

### 2. revalidate = 0 em Algumas Páginas

**Configuração**: `app/categoria/[slug]/page.tsx`, `app/sitemap.ts`

```typescript
export const revalidate = 0;
```

**Valor Atual**: `0` (sempre dinâmico)

**Por que parece errado**: Parece que desabilita cache, prejudicando performance.

**Por que está certo**: Sitemap precisa estar sempre atualizado para SEO. Categorias filtram posts client-side, então precisam de dados frescos.

---

### 3. suppressHydrationWarning no HTML

**Configuração**: `app/layout.tsx`

```tsx
<html lang="pt-BR" suppressHydrationWarning>
```

**Por que parece errado**: Suprimir warnings geralmente é má prática.

**Por que está certo**: Necessário para next-themes funcionar sem flash. O warning é esperado e não indica problema real.

---

## Dependências de Ordem e Sequência

### 1. ThemeProvider Deve Envolver Tudo

**Contexto**: Qualquer componente que usa tema (cores, dark mode).

**Ordem Necessária**:
```tsx
<ThemeProvider>
  <Header />    // Usa tema
  <main>
    {children}  // Páginas usam tema
  </main>
  <Footer />    // Usa tema
</ThemeProvider>
```

**Consequência se Ignorado**: Componentes fora do provider não respondem a mudanças de tema.

---

### 2. Validação Antes de Renderização

**Contexto**: Dados da API.

**Ordem Necessária**:
```
1. Fetch dados
2. Validar com isValidPost()
3. Só então renderizar
```

**Consequência se Ignorado**: Erros de runtime se dados estiverem malformados.

---

## Dicas de Desenvolvimento

### Ambiente Local

1. **Sempre copiar `.env.example` para `.env.local`**
   ```bash
   cp .env.example .env.local
   ```

2. **Backend deve estar rodando antes do frontend**
   - Porta padrão do backend: 8000
   - URL: `http://localhost:8000/api/v1`

3. **Hot Reload pode não pegar mudanças em `next.config.js`**
   - Reinicie o servidor dev após alterar configurações

### Debugging

1. **Verificar se dados estão chegando da API**
   ```typescript
   console.log('Posts recebidos:', posts.length);
   ```

2. **Verificar validação de posts**
   ```typescript
   const validPosts = data.filter(isValidPost);
   console.log(`${validPosts.length}/${data.length} posts válidos`);
   ```

3. **Testar ISR localmente**
   - Não funciona em `next dev`
   - Use `next build && next start` para testar revalidação

### Performance

1. **Evite re-renders desnecessários em Client Components**
   - Use `useMemo` para cálculos pesados
   - Use `useCallback` para funções passadas como props

2. **Prefira Server Components**
   - Menos JavaScript enviado ao cliente
   - Melhor SEO
   - Apenas use `'use client'` quando necessário

3. **Otimize imagens**
   - Sempre use `next/image`
   - Defina `sizes` apropriado para responsividade
   - Use `priority` apenas para above-the-fold

### Testes

> **Nota**: O projeto não possui testes implementados atualmente.

Quando adicionar testes:
1. Configure Jest e React Testing Library
2. Mock a API para testes unitários
3. Use MSW para testes de integração

---

## O Que Eu Gostaria de Ter Sabido

Lista de insights para novos desenvolvedores:

1. **O projeto usa App Router, não Pages Router** - A documentação do Next.js tem seções separadas, certifique-se de estar lendo a correta.

2. **Categorias são configuradas em `config/categories.ts`** - Não procure no backend, as cores e slugs estão no frontend.

3. **A API de revalidação é crítica** - Configure o webhook no backend logo, senão o cache nunca atualiza.

4. **Dark mode é via CSS classes** - TailwindCSS usa `.dark` no `<html>`, não CSS variables.

5. **Validação de posts é defensiva** - Não confie nos dados da API, sempre valide.

6. **ISR não funciona em desenvolvimento** - Use `next build && next start` para testar.

7. **Variáveis de ambiente são substituídas em build time** - Mudou a URL da API? Precisa rebuildar.

8. **O ticker de criptos é client-side** - Usa CoinGecko diretamente, não passa pelo nosso backend.

9. **Posts sem imagem usam gradiente** - Não é bug, é feature. O fallback é intencional.

10. **A busca tem sanitização pesada** - Não remova, é por segurança.

---

*Este documento deve ser atualizado sempre que novos gotchas forem descobertos.*
