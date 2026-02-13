# 📋 Guia Completo de Continuidade - QBom Doceria

**Data de Criação**: 13 de Fevereiro de 2026  
**Versão do Projeto**: 22028e59 (Última versão estável)  
**Status**: ✅ Pronto para Deploy

---

## 🚀 Início Rápido

### 1. Clonar o Repositório
```bash
git clone https://github.com/lionlorenzo44-cmd/qbom-doceria.git
cd qbom-doceria
```

### 2. Instalar Dependências
```bash
pnpm install
```

### 3. Configurar Variáveis de Ambiente
Criar arquivo `.env.local` na raiz do projeto:
```env
DATABASE_URL=mysql://user:password@host:3306/database
JWT_SECRET=seu_jwt_secret_aqui
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
```

### 4. Iniciar o Servidor de Desenvolvimento
```bash
pnpm dev
```

Acesse: `http://localhost:3000`

---

## 📁 Estrutura do Projeto

```
qbom-doceria-app/
├── client/                          # Frontend React
│   ├── src/
│   │   ├── pages/
│   │   │   └── Home.tsx            # Página principal com catálogo e carrinho
│   │   ├── components/
│   │   │   ├── DashboardLayout.tsx # Layout do painel admin
│   │   │   ├── Header.tsx          # Header com logo e carrinho
│   │   │   └── ui/                 # Componentes shadcn/ui
│   │   ├── lib/
│   │   │   └── trpc.ts             # Cliente tRPC
│   │   ├── App.tsx                 # Roteamento principal
│   │   ├── main.tsx                # Entrada da aplicação
│   │   └── index.css               # Estilos globais
│   ├── public/                      # Arquivos estáticos
│   └── index.html
│
├── server/                          # Backend Express + tRPC
│   ├── routers.ts                  # Definição de todas as procedures tRPC
│   ├── db.ts                       # Funções de acesso ao banco de dados
│   ├── auth.logout.test.ts         # Exemplo de teste com Vitest
│   ├── _core/
│   │   ├── context.ts              # Contexto tRPC com autenticação
│   │   ├── trpc.ts                 # Configuração tRPC
│   │   ├── oauth.ts                # Integração OAuth Manus
│   │   ├── llm.ts                  # Integração com LLM
│   │   ├── notification.ts         # Sistema de notificações
│   │   └── env.ts                  # Variáveis de ambiente
│   └── storage.ts                  # Integração com S3
│
├── drizzle/                         # Schema e migrações do banco
│   ├── schema.ts                   # Definição das tabelas
│   ├── 0000_rich_annihilus.sql     # Migrações SQL
│   └── drizzle.config.ts
│
├── shared/                          # Código compartilhado
│   └── const.ts
│
├── package.json                     # Dependências do projeto
├── tsconfig.json                    # Configuração TypeScript
├── vite.config.ts                   # Configuração Vite
├── drizzle.config.ts                # Configuração Drizzle ORM
└── todo.md                          # Tarefas e funcionalidades
```

---

## 🔑 Funcionalidades Principais

### ✅ Implementadas

1. **Catálogo de Produtos**
   - Exibição de produtos com imagens
   - Filtro por disponibilidade
   - Preços em tempo real

2. **Carrinho de Compras**
   - Adicionar/remover produtos
   - Atualizar quantidade
   - Cálculo automático de total
   - Scroll automático ao clicar no carrinho

3. **Formulário de Pedido**
   - Validação de nome e telefone
   - Endereço com bairro e referência
   - Escolha de forma de pagamento (Dinheiro/PIX)
   - Opção de troco

4. **Integração WhatsApp**
   - Envio automático de pedidos via WhatsApp
   - Número configurado: (71) 99218-0210
   - Mensagem formatada com detalhes do pedido

5. **Painel Administrativo**
   - Login com credenciais (Aurora25 / Aqua1048)
   - Gerenciamento de produtos
   - Visualização de pedidos
   - Controle de disponibilidade

6. **Banco de Dados**
   - Tabelas: users, products, orders, orderItems, payments
   - Migrations automáticas com Drizzle ORM
   - Suporte a MySQL/TiDB

---

## 🛠️ Tarefas Pendentes

Veja `todo.md` para a lista completa de tarefas.

### Curto Prazo
- [ ] Configurar domínio personalizado
- [ ] Publicar site no Manus
- [ ] Adicionar mais produtos via painel admin
- [ ] Testar fluxo completo de pedidos

### Médio Prazo
- [ ] Implementar sistema de avaliações
- [ ] Adicionar histórico de pedidos do cliente
- [ ] Notificações em tempo real de pedidos

---

## 🔧 Comandos Úteis

### Desenvolvimento
```bash
# Iniciar servidor de desenvolvimento
pnpm dev

# Executar testes
pnpm test

# Build para produção
pnpm build

# Preview de produção
pnpm preview
```

### Banco de Dados
```bash
# Gerar migrações
pnpm drizzle-kit generate

# Executar migrações
pnpm drizzle-kit migrate

# Abrir Drizzle Studio
pnpm drizzle-kit studio
```

---

## 📊 Estrutura do Banco de Dados

### Tabela: products
```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price INT NOT NULL,  -- Preço em centavos
  imageUrl VARCHAR(500),
  imageUrl2 VARCHAR(500),
  imageUrl3 VARCHAR(500),
  isActive BOOLEAN DEFAULT 1,
  isAvailable BOOLEAN DEFAULT 1,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: orders
```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  orderNumber VARCHAR(50) UNIQUE NOT NULL,
  customerName VARCHAR(255) NOT NULL,
  customerPhone VARCHAR(20) NOT NULL,
  customerAddress TEXT,
  status VARCHAR(50) DEFAULT 'novo',
  totalPrice INT NOT NULL,  -- Preço em centavos
  paymentMethod VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: orderItems
```sql
CREATE TABLE orderItems (
  id INT PRIMARY KEY AUTO_INCREMENT,
  orderId INT NOT NULL,
  productId INT NOT NULL,
  quantity INT NOT NULL,
  priceAtTime INT NOT NULL,
  FOREIGN KEY (orderId) REFERENCES orders(id),
  FOREIGN KEY (productId) REFERENCES products(id)
);
```

---

## 🔐 Credenciais Importantes

### Painel Administrativo
- **Usuário**: Aurora25
- **Senha**: Aqua1048
- **URL**: https://seu-dominio.com/admin

### WhatsApp
- **Número**: (71) 99218-0210
- **Localizado em**: `client/src/pages/Home.tsx` linha 214

### Banco de Dados
- Verifique as variáveis de ambiente no arquivo `.env.local`

---

## 🚀 Deploy no Manus

### Passo 1: Criar Checkpoint
```bash
# Já feito! Versão: 22028e59
```

### Passo 2: Publicar
1. Acesse o painel de controle do Manus
2. Clique em "Publish" no header
3. Escolha o domínio (ou configure um novo)
4. Confirme a publicação

### Passo 3: Configurar Domínio Personalizado
1. Vá para Settings → Domains
2. Configure seu domínio customizado
3. Atualize os registros DNS conforme instruído

---

## 🐛 Troubleshooting

### Erro: "Erro ao carregar pedido"
**Solução**: Verifique se o banco de dados está sincronizado. Execute:
```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

### Erro: "Banco de dados não disponível"
**Solução**: Verifique a variável `DATABASE_URL` no `.env.local`

### Produtos não aparecem
**Solução**: Adicione produtos via painel admin ou execute:
```sql
INSERT INTO products (name, price, description, isActive, isAvailable) 
VALUES ('Bolo de Pote', 2500, 'Delicioso bolo de pote', 1, 1);
```

---

## 📝 Notas Importantes

1. **Preços em centavos**: Todos os preços no banco são armazenados em centavos (multiplique por 100)
2. **Timestamps UTC**: Use sempre UTC para timestamps
3. **Validação**: Sempre valide dados no frontend E no backend
4. **Segurança**: Nunca commite arquivos `.env` no Git

---

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique o `todo.md` para tarefas pendentes
2. Consulte os logs do servidor em `.manus-logs/`
3. Teste no navegador com DevTools aberto (F12)

---

**Última atualização**: 13 de Fevereiro de 2026  
**Versão**: 22028e59  
**Status**: ✅ Pronto para Produção
