# QBom Doceria - Estrutura do Projeto

## 📋 Visão Geral

Este é um projeto full-stack de e-commerce para doceria com React 19, Tailwind 4, Express 4, tRPC 11 e MySQL.

**Versão Atual:** 1.0.0  
**Status:** Em desenvolvimento  
**Última Atualização:** 13 de Fevereiro de 2026

---

## 📁 Estrutura de Diretórios

```
qbom-doceria-app/
├── client/                          # Frontend React
│   ├── src/
│   │   ├── pages/                  # Páginas principais
│   │   │   ├── Home.tsx            # Página inicial com cardápio
│   │   │   ├── Admin.tsx           # Painel administrativo
│   │   │   ├── AdminLogin.tsx      # Login do admin
│   │   │   ├── MyOrders.tsx        # Histórico de pedidos
│   │   │   ├── Order.tsx           # Detalhes do pedido
│   │   │   ├── ComponentShowcase.tsx # Showcase de componentes
│   │   │   └── NotFound.tsx        # Página 404
│   │   │
│   │   ├── components/             # Componentes reutilizáveis
│   │   │   ├── ui/                # Componentes shadcn/ui (50+)
│   │   │   ├── LocalAdminPanel.tsx # Painel admin local
│   │   │   ├── ProductCard.tsx     # Card de produto
│   │   │   ├── Cart.tsx            # Carrinho de compras
│   │   │   ├── ReviewForm.tsx      # Formulário de avaliação
│   │   │   ├── WebhooksPanel.tsx   # Painel de webhooks
│   │   │   ├── SoldOutBadge.tsx    # Badge de produto esgotado
│   │   │   ├── ReviewsList.tsx     # Lista de avaliações
│   │   │   └── ... (outros componentes)
│   │   │
│   │   ├── hooks/                  # Custom hooks
│   │   │   ├── useNotification.ts
│   │   │   ├── useNotificationSound.ts
│   │   │   ├── useMobile.tsx
│   │   │   ├── useComposition.ts
│   │   │   └── usePersistFn.ts
│   │   │
│   │   ├── contexts/               # React contexts
│   │   │   └── ThemeContext.tsx    # Contexto de tema (light/dark)
│   │   │
│   │   ├── lib/                    # Utilitários
│   │   │   ├── trpc.ts            # Cliente tRPC
│   │   │   └── utils.ts           # Funções auxiliares
│   │   │
│   │   ├── App.tsx                # Roteamento principal
│   │   ├── main.tsx               # Entry point
│   │   ├── index.css              # Estilos globais e temas
│   │   └── const.ts               # Constantes
│   │
│   ├── public/                     # Arquivos estáticos
│   │   ├── produto_1_imagem.png   # Imagens de produtos
│   │   ├── produto_2_imagem_1.png
│   │   ├── produto_3_imagem.jpeg
│   │   ├── produto_4_imagem.png
│   │   ├── bolo_pote_2.png
│   │   └── ... (imagens WebP otimizadas)
│   │
│   ├── index.html                 # Template HTML
│   └── vite.config.ts             # Configuração Vite
│
├── server/                         # Backend Express + tRPC
│   ├── _core/                      # Framework core (NÃO EDITAR)
│   │   ├── index.ts               # Entry point do servidor
│   │   ├── context.ts             # Contexto tRPC
│   │   ├── trpc.ts                # Configuração tRPC
│   │   ├── oauth.ts               # Autenticação OAuth Manus
│   │   ├── cookies.ts             # Gerenciamento de cookies
│   │   ├── notification.ts        # Notificações
│   │   ├── healthMonitor.ts       # Monitoramento de saúde
│   │   ├── whatsappNotifier.ts    # Integração WhatsApp
│   │   ├── llm.ts                 # Integração LLM
│   │   ├── imageGeneration.ts     # Geração de imagens
│   │   ├── voiceTranscription.ts  # Transcrição de voz
│   │   ├── webhookExecutor.ts     # Executor de webhooks
│   │   ├── dataApi.ts             # API de dados
│   │   ├── map.ts                 # Integração Google Maps
│   │   ├── systemRouter.ts        # Roteador de sistema
│   │   ├── env.ts                 # Variáveis de ambiente
│   │   ├── vite.ts                # Integração Vite
│   │   ├── sdk.ts                 # SDK do Manus
│   │   └── types/                 # Tipos TypeScript
│   │
│   ├── routers.ts                 # Procedures tRPC (EDITAR AQUI)
│   ├── db.ts                      # Query helpers do banco (EDITAR AQUI)
│   ├── storage.ts                 # Helpers S3 (EDITAR AQUI)
│   │
│   └── *.test.ts                  # Testes vitest
│       ├── auth.admin.test.ts
│       ├── auth.logout.test.ts
│       ├── orders.test.ts
│       ├── webhooks.test.ts
│       ├── health-monitor.test.ts
│       ├── error-logs.test.ts
│       └── error-boundary.test.ts
│
├── drizzle/                        # Banco de dados
│   ├── schema.ts                  # Schema das tabelas (EDITAR AQUI)
│   ├── relations.ts               # Relações entre tabelas
│   ├── *.sql                      # Migrações SQL (geradas automaticamente)
│   └── meta/                      # Metadados das migrações
│
├── shared/                         # Código compartilhado
│   ├── const.ts                   # Constantes globais
│   ├── types.ts                   # Tipos compartilhados
│   └── _core/
│       └── errors.ts              # Definições de erros
│
├── storage/                        # Helpers S3
│   └── (gerado automaticamente)
│
├── scripts/                        # Scripts utilitários
│   └── seed-products.mjs          # Script para popular produtos
│
├── .env.example                    # Exemplo de variáveis de ambiente
├── .env                            # Variáveis de ambiente (NÃO COMMITAR)
├── package.json                    # Dependências e scripts
├── tsconfig.json                   # Configuração TypeScript
├── drizzle.config.ts               # Configuração Drizzle ORM
├── vite.config.ts                  # Configuração Vite
├── tailwind.config.ts              # Configuração Tailwind CSS
├── postcss.config.ts               # Configuração PostCSS
├── vitest.config.ts                # Configuração Vitest
├── prettier.config.js              # Configuração Prettier
├── todo.md                         # Lista de tarefas (MANTER ATUALIZADO)
├── PROJECT_STRUCTURE.md            # Este arquivo
└── README.md                       # Documentação principal
```

---

## 🎯 Arquivos Principais para Edição

### Frontend (client/src/)
- **pages/Home.tsx** - Página principal com cardápio
- **pages/Admin.tsx** - Painel administrativo
- **components/LocalAdminPanel.tsx** - Lógica do painel admin
- **components/ProductCard.tsx** - Card de produto
- **index.css** - Temas e estilos globais

### Backend (server/)
- **routers.ts** - Procedures tRPC (APIs)
- **db.ts** - Query helpers
- **storage.ts** - Upload de arquivos S3

### Database (drizzle/)
- **schema.ts** - Definição de tabelas

---

## 🔄 Fluxo de Desenvolvimento

### 1. Adicionar Nova Funcionalidade

```bash
# 1. Atualizar schema do banco
# Editar: drizzle/schema.ts

# 2. Gerar migração
pnpm drizzle-kit generate

# 3. Aplicar migração
pnpm drizzle-kit migrate

# 4. Adicionar query helper
# Editar: server/db.ts

# 5. Criar procedure tRPC
# Editar: server/routers.ts

# 6. Criar testes
# Criar: server/feature.test.ts

# 7. Criar UI
# Editar: client/src/pages/ ou client/src/components/

# 8. Testar
pnpm test
pnpm check
```

### 2. Publicar Mudanças

```bash
# 1. Atualizar todo.md com status
# Editar: todo.md

# 2. Salvar checkpoint
# (Feito via interface Manus)

# 3. Publicar
# (Clique em "Publish" na interface Manus)
```

---

## 📊 Tabelas do Banco de Dados

### users
- id (int, PK)
- openId (varchar, UNIQUE)
- name (text)
- email (varchar)
- loginMethod (varchar)
- role (enum: 'user', 'admin')
- createdAt (timestamp)
- updatedAt (timestamp)
- lastSignedIn (timestamp)

### products
- id (int, PK)
- name (varchar)
- description (text)
- price (int)
- imageUrl (text)
- imageUrl2 (text)
- imageUrl3 (text)
- isActive (int, default: 1)
- isAvailable (int, default: 1)
- createdAt (timestamp)
- updatedAt (timestamp)

### orders
- id (int, PK)
- orderNumber (varchar, UNIQUE)
- customerName (varchar)
- customerPhone (varchar)
- customerAddress (text)
- totalPrice (int)
- status (enum: 'novo', 'em_preparo', 'entregue', 'cancelado')
- orderType (enum: 'whatsapp', 'balcao')
- paymentMethod (varchar)
- notes (text)
- createdAt (timestamp)
- updatedAt (timestamp)

### orderItems
- id (int, PK)
- orderId (int, FK)
- productId (int, FK)
- quantity (int)
- priceAtTime (int)
- createdAt (timestamp)

### payments
- id (int, PK)
- orderId (int, FK)
- amount (int)
- paymentMethod (varchar)
- status (enum: 'pendente', 'recebido', 'cancelado')
- notes (text)
- createdAt (timestamp)
- updatedAt (timestamp)

### cashRegister
- id (int, PK)
- amount (int)
- type (enum: 'entrada', 'saida')
- description (varchar)
- paymentMethod (varchar)
- orderId (int, FK)
- createdAt (timestamp)

---

## 🚀 Comandos Principais

```bash
# Desenvolvimento
pnpm dev                    # Inicia servidor de desenvolvimento
pnpm check                  # Verifica erros TypeScript
pnpm test                   # Executa testes vitest
pnpm format                 # Formata código com Prettier

# Database
pnpm drizzle-kit generate   # Gera migrações
pnpm drizzle-kit migrate    # Aplica migrações
pnpm db:push                # Gera + aplica migrações

# Build
pnpm build                  # Build para produção
pnpm start                  # Inicia servidor de produção
```

---

## 🔐 Variáveis de Ambiente

Configuradas automaticamente pelo Manus:
- `DATABASE_URL` - Conexão MySQL
- `JWT_SECRET` - Chave de sessão
- `VITE_APP_ID` - ID da aplicação Manus
- `OAUTH_SERVER_URL` - URL do servidor OAuth
- `VITE_OAUTH_PORTAL_URL` - URL do portal OAuth
- `OWNER_OPEN_ID` - ID do proprietário
- `OWNER_NAME` - Nome do proprietário
- `BUILT_IN_FORGE_API_URL` - URL da API Manus
- `BUILT_IN_FORGE_API_KEY` - Chave da API Manus
- `VITE_FRONTEND_FORGE_API_URL` - URL da API para frontend
- `VITE_FRONTEND_FORGE_API_KEY` - Chave da API para frontend

---

## 📝 Checklist para Continuidade

Quando clonar novamente para continuar o projeto:

- [ ] Clonar repositório
- [ ] Executar `pnpm install`
- [ ] Verificar `.env` com variáveis de ambiente
- [ ] Executar `pnpm drizzle-kit migrate`
- [ ] Executar `pnpm dev` para iniciar desenvolvimento
- [ ] Abrir `http://localhost:3000` no navegador
- [ ] Verificar `todo.md` para tarefas pendentes
- [ ] Consultar `PROJECT_STRUCTURE.md` para entender a estrutura

---

## 🎨 Design System

**Cores Principais:**
- Primary: Red (#DC2626)
- Secondary: Pink (#EC4899)
- Background: Light Pink (#FCE7F3)
- Text: Dark Gray (#1F2937)

**Tipografia:**
- Font: Sistema padrão (sans-serif)
- Tamanhos: xs, sm, base, lg, xl, 2xl

**Componentes:**
- Usa shadcn/ui para consistência
- Tailwind CSS 4 para estilos
- Tema claro/escuro via ThemeContext

---

## 📞 Contato e Suporte

**Repositório Original:** https://github.com/lionlorenzo44-cmd/qbom-doceria  
**Domínio:** https://qbomdocer-gjtnqdbq.manus.space  
**Desenvolvedor:** Manus AI

---

**Última Atualização:** 13 de Fevereiro de 2026  
**Versão do Documento:** 1.0
