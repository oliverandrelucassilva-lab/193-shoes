# Estoque de Calçados

Sistema web para controle interno do estoque de uma loja de calçados
femininos: cadastro de produtos por modelo (sapatilha, slingback, sapato
social, sandália...), fotos, estoque por tamanho e filtros rápidos, para a
loja consultar disponibilidade sem precisar anotar tudo à mão.

Feito com **Next.js (App Router)** + **Supabase** (banco de dados,
autenticação e armazenamento de fotos). É um sistema **interno**: exige
login para acessar qualquer página.

## Funcionalidades

- Login único/multiusuário via Supabase Auth (e-mail e senha).
- Estoque com filtro por **modelo**, **tamanho**, **busca por código/cor**
  e status (ativos/inativos).
- Cada produto tem: código de referência, modelo, cor, preço, preço de
  custo, observações, fotos e quantidade em estoque por tamanho (33 a 41).
- Ajuste rápido de estoque (botões +/-) sem precisar abrir o formulário
  inteiro.
- **Foto por tamanho**: além das fotos gerais do produto, dá para guardar
  uma foto específica de cada numeração. Quando a cliente pergunta por um
  tamanho, é só abrir o produto e tocar em "Compartilhar" para mandar a
  foto certa direto (WhatsApp, etc.), sem procurar na galeria do celular.
- Cadastro/edição/exclusão de produtos, com upload de várias fotos.
- Gestão dos modelos ("Modelos" no menu) — a loja cria os modelos que usa,
  já que calçados normalmente não têm nome próprio.
- Alertas visuais de "estoque baixo" (≤3 pares) e "esgotado" (0 pares).

## Configuração (passo a passo)

### 1. Criar o projeto no Supabase

1. Crie uma conta em [supabase.com](https://supabase.com) (pode usar o
   e-mail da loja).
2. Crie um novo projeto (plano gratuito atende bem para o início).
3. Anote a **Project URL** e a **anon public key**, em
   `Project Settings > API`.

### 2. Rodar as migrations do banco de dados

1. No painel do Supabase, abra `SQL Editor`.
2. Cole o conteúdo do arquivo [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql)
   e execute (`Run`). Isso cria as tabelas (`categories`, `products`,
   `product_images`, `product_sizes`), o bucket de imagens
   (`product-images`) e as políticas de segurança (só usuários logados
   acessam os dados).
3. Em seguida, cole e execute também o arquivo
   [`supabase/migrations/0002_product_image_size.sql`](./supabase/migrations/0002_product_image_size.sql),
   que habilita a foto por tamanho. Sempre que surgirem novos arquivos
   `NNNN_*.sql` em `supabase/migrations/`, rode-os na ordem (pelo número)
   no `SQL Editor`.

### 3. Criar o usuário de acesso da loja

1. No painel do Supabase, vá em `Authentication > Users > Add user`.
2. Crie um usuário com o e-mail e senha que a loja vai usar para entrar no
   sistema (pode criar um usuário por funcionária, se quiser).
3. Marque a opção para já confirmar o e-mail (ou desative a confirmação por
   e-mail em `Authentication > Providers > Email`), para não depender de
   e-mail de confirmação.

### 4. Configurar as variáveis de ambiente do projeto

1. Copie `.env.local.example` para `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
2. Preencha com os dados do passo 1:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-publica
   ```

### 5. Rodar localmente

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) — vai redirecionar
para `/login`.

### 6. Publicar online (para acessar de qualquer lugar)

O jeito mais simples é publicar na [Vercel](https://vercel.com):

1. Suba este repositório para o GitHub (se ainda não estiver).
2. Na Vercel, importe o repositório.
3. Configure as variáveis de ambiente `NEXT_PUBLIC_SUPABASE_URL` e
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` nas configurações do projeto na Vercel.
4. Publique. A loja poderá acessar o sistema de qualquer computador ou
   celular, bastando fazer login.

## Estrutura do projeto

```
src/app/                 Páginas (App Router)
  page.tsx                Estoque com filtros (tela inicial)
  login/                   Tela de login
  produtos/novo/           Cadastro de produto
  produtos/[id]/           Edição de produto + ajuste de estoque
  categorias/              Gestão dos modelos de calçado
src/components/          Componentes de UI (ProductCard, ProductForm, Nav)
src/lib/supabase/        Clientes Supabase (browser, server, middleware)
supabase/migrations/     SQL do banco de dados
```

## Adicionando novos modelos

A loja pode cadastrar novos modelos a qualquer momento em **Modelos**, no
menu superior — não é preciso mexer no código para adicionar categorias
como "Sapatilha", "Slingback", "Mule", etc.
