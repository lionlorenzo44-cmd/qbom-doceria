# 📦 Índice de Componentes - QBom Doceria

## Componentes Personalizados

### Páginas (client/src/pages/)

| Arquivo | Descrição | Funcionalidade |
|---------|-----------|-----------------|
| `Home.tsx` | Página inicial | Exibe cardápio, carrinho, checkout |
| `Admin.tsx` | Painel administrativo | Gerencia produtos, pedidos, vendas |
| `AdminLogin.tsx` | Login do admin | Autenticação local do admin |
| `MyOrders.tsx` | Histórico de pedidos | Lista pedidos do cliente |
| `Order.tsx` | Detalhes do pedido | Mostra informações completas do pedido |
| `ComponentShowcase.tsx` | Showcase de componentes | Demonstra componentes disponíveis |
| `NotFound.tsx` | Página 404 | Página não encontrada |

---

### Componentes Principais (client/src/components/)

#### Admin & Gerenciamento
| Arquivo | Descrição | Uso |
|---------|-----------|-----|
| `LocalAdminPanel.tsx` | Painel admin completo | Gerenciamento de produtos e pedidos |
| `ProductForm.tsx` | Formulário de produto | Adicionar/editar produtos |
| `OrdersPanel.tsx` | Painel de pedidos | Listar e gerenciar pedidos |
| `CashRegisterPanel.tsx` | Controle de caixa | Gerenciar entrada/saída de dinheiro |
| `HealthMonitorPanel.tsx` | Monitor de saúde | Monitorar status do sistema |
| `WebhooksPanel.tsx` | Painel de webhooks | Gerenciar webhooks |
| `ErrorLogsPanel.tsx` | Logs de erro | Visualizar erros do sistema |

#### Produtos & Carrinho
| Arquivo | Descrição | Uso |
|---------|-----------|-----|
| `ProductCard.tsx` | Card de produto | Exibir produto no cardápio |
| `ProductCarousel.tsx` | Carrossel de imagens | Navegar entre imagens do produto |
| `Cart.tsx` | Carrinho de compras | Exibir itens do carrinho |
| `CartItem.tsx` | Item do carrinho | Linha de item no carrinho |
| `SoldOutBadge.tsx` | Badge de esgotado | Indicar produto sem estoque |

#### Pedidos & Checkout
| Arquivo | Descrição | Uso |
|---------|-----------|-----|
| `CheckoutForm.tsx` | Formulário de checkout | Coletar dados do cliente |
| `OrderSummary.tsx` | Resumo do pedido | Exibir total e itens |
| `OrderStatus.tsx` | Status do pedido | Mostrar status atual |
| `OrderTimeline.tsx` | Timeline do pedido | Histórico de mudanças de status |

#### Avaliações
| Arquivo | Descrição | Uso |
|---------|-----------|-----|
| `ReviewForm.tsx` | Formulário de avaliação | Adicionar avaliação |
| `ReviewsList.tsx` | Lista de avaliações | Exibir avaliações do produto |
| `ReviewCard.tsx` | Card de avaliação | Exibir uma avaliação |
| `RatingStars.tsx` | Estrelas de avaliação | Componente de rating |

#### Notificações
| Arquivo | Descrição | Uso |
|---------|-----------|-----|
| `NotificationCenter.tsx` | Central de notificações | Exibir notificações |
| `NotificationItem.tsx` | Item de notificação | Uma notificação individual |

#### Utilitários
| Arquivo | Descrição | Uso |
|---------|-----------|-----|
| `ErrorBoundary.tsx` | Error boundary | Capturar erros React |
| `ErrorFallback.tsx` | Fallback de erro | UI quando erro ocorre |
| `LoadingSpinner.tsx` | Spinner de carregamento | Indicador de carregamento |

---

### Componentes UI (client/src/components/ui/)

Componentes shadcn/ui pré-configurados (50+):

#### Formulários
- `input.tsx` - Input de texto
- `textarea.tsx` - Área de texto
- `checkbox.tsx` - Checkbox
- `radio-group.tsx` - Radio buttons
- `select.tsx` - Dropdown select
- `form.tsx` - Wrapper de formulário
- `label.tsx` - Label de formulário
- `field.tsx` - Campo de formulário

#### Botões & Ações
- `button.tsx` - Botão padrão
- `button-group.tsx` - Grupo de botões
- `toggle.tsx` - Toggle button
- `toggle-group.tsx` - Grupo de toggles

#### Layouts
- `card.tsx` - Card container
- `sheet.tsx` - Sheet/drawer
- `dialog.tsx` - Modal dialog
- `drawer.tsx` - Drawer lateral
- `sidebar.tsx` - Sidebar navigation
- `resizable.tsx` - Painel redimensionável
- `scroll-area.tsx` - Área com scroll

#### Navegação
- `tabs.tsx` - Abas
- `navigation-menu.tsx` - Menu de navegação
- `menubar.tsx` - Barra de menu
- `breadcrumb.tsx` - Breadcrumb navigation
- `pagination.tsx` - Paginação

#### Feedback
- `alert.tsx` - Alert box
- `alert-dialog.tsx` - Alert dialog
- `progress.tsx` - Barra de progresso
- `skeleton.tsx` - Skeleton loading
- `spinner.tsx` - Spinner de carregamento
- `badge.tsx` - Badge/tag
- `empty.tsx` - Estado vazio

#### Popups
- `popover.tsx` - Popover
- `tooltip.tsx` - Tooltip
- `hover-card.tsx` - Hover card
- `context-menu.tsx` - Context menu
- `dropdown-menu.tsx` - Dropdown menu

#### Dados
- `table.tsx` - Tabela
- `carousel.tsx` - Carrossel
- `chart.tsx` - Gráficos

#### Outros
- `separator.tsx` - Separador
- `switch.tsx` - Switch toggle
- `slider.tsx` - Slider
- `input-otp.tsx` - OTP input
- `input-group.tsx` - Grupo de inputs
- `kbd.tsx` - Tecla de teclado
- `aspect-ratio.tsx` - Aspect ratio container
- `command.tsx` - Command palette
- `collapsible.tsx` - Collapsible section
- `accordion.tsx` - Accordion
- `sonner.tsx` - Toast notifications

---

## Hooks Personalizados

### client/src/hooks/

| Hook | Descrição | Uso |
|------|-----------|-----|
| `useNotification.ts` | Gerenciar notificações | Mostrar notificações no app |
| `useNotificationSound.ts` | Som de notificação | Tocar som ao receber notificação |
| `useMobile.tsx` | Detectar mobile | Saber se é mobile/desktop |
| `useComposition.ts` | Composição de eventos | Lidar com composição de texto |
| `usePersistFn.ts` | Função persistente | Manter referência de função |

---

## Contextos

### client/src/contexts/

| Contexto | Descrição | Uso |
|----------|-----------|-----|
| `ThemeContext.tsx` | Tema light/dark | Alternar tema do app |

---

## Procedimentos tRPC (server/routers.ts)

### Autenticação
- `auth.me` - Obter usuário atual
- `auth.logout` - Fazer logout

### Produtos
- `products.list` - Listar produtos
- `products.get` - Obter produto por ID
- `products.create` - Criar produto (admin)
- `products.update` - Atualizar produto (admin)
- `products.delete` - Deletar produto (admin)

### Pedidos
- `orders.create` - Criar novo pedido
- `orders.list` - Listar pedidos (admin)
- `orders.get` - Obter pedido por ID
- `orders.updateStatus` - Atualizar status (admin)
- `orders.delete` - Deletar pedido (admin)

### Avaliações
- `reviews.create` - Criar avaliação
- `reviews.list` - Listar avaliações
- `reviews.delete` - Deletar avaliação (admin)

### Pagamentos
- `payments.create` - Registrar pagamento
- `payments.list` - Listar pagamentos (admin)
- `payments.updateStatus` - Atualizar status (admin)

### Caixa
- `cashRegister.record` - Registrar entrada/saída
- `cashRegister.list` - Listar movimentações (admin)
- `cashRegister.getBalance` - Obter saldo

### Sistema
- `system.notifyOwner` - Notificar proprietário
- `system.health` - Status de saúde
- `system.logs` - Logs do sistema

---

## Constantes

### client/src/const.ts
- `getLoginUrl()` - URL de login
- Constantes de configuração

### shared/const.ts
- `COOKIE_NAME` - Nome do cookie de sessão
- Constantes compartilhadas

---

## Tipos

### shared/types.ts
- Tipos compartilhados entre client e server

### drizzle/schema.ts
- Tipos gerados do banco de dados

---

## Como Usar Este Índice

1. **Procurando um componente?** → Veja a tabela de componentes
2. **Precisa de um hook?** → Veja a seção de hooks
3. **Quer chamar uma API?** → Veja os procedimentos tRPC
4. **Precisa de um tipo?** → Veja a seção de tipos

---

## Exemplo de Uso

### Adicionar Novo Componente
1. Crie o arquivo em `client/src/components/`
2. Importe em `client/src/pages/` ou outro componente
3. Use normalmente

### Adicionar Nova Página
1. Crie o arquivo em `client/src/pages/`
2. Registre a rota em `client/src/App.tsx`
3. Adicione link de navegação

### Adicionar Nova API
1. Crie a query helper em `server/db.ts`
2. Crie o procedure em `server/routers.ts`
3. Use no frontend com `trpc.feature.useQuery()`

---

**Última Atualização:** 13 de Fevereiro de 2026
