# ✅ Checklist de Migração para Nova Conta Manus

**Objetivo**: Usar este backup em uma nova conta Manus sem deixar detalhes passar.

---

## 📋 Pré-Requisitos

- [ ] Nova conta Manus criada e ativa
- [ ] Acesso ao painel de controle Manus
- [ ] Node.js 18+ instalado
- [ ] pnpm instalado (`npm install -g pnpm`)
- [ ] Git instalado

---

## 🔧 Passo 1: Preparar o Ambiente Local

### 1.1 Extrair o Backup
```bash
unzip qbom-doceria-backup-final.zip
cd qbom-doceria-backup
```

### 1.2 Instalar Dependências
```bash
pnpm install
```

### 1.3 Limpar Cache
```bash
pnpm store prune
rm -rf node_modules/.pnpm
```

---

## 🔐 Passo 2: Configurar Variáveis de Ambiente

### 2.1 Criar `.env.local`

Crie um arquivo `.env.local` na raiz do projeto com:

```env
# ⚠️ OBRIGATÓRIO - Obter do painel Manus
DATABASE_URL=mysql://username:password@host:3306/database_name
JWT_SECRET=sua_chave_secreta_muito_longa_e_aleatoria
VITE_APP_ID=seu_novo_app_id_da_nova_conta
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# ⚠️ OBRIGATÓRIO - Informações do proprietário
OWNER_OPEN_ID=seu_novo_open_id_da_nova_conta
OWNER_NAME=Seu Nome

# Automático do Manus (será fornecido)
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=seu_token_forge_aqui
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=seu_token_frontend_aqui
```

### 2.2 Onde Obter Cada Variável

| Variável | Onde Obter | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | Painel Manus → Database | `mysql://user:pass@host:3306/db` |
| `JWT_SECRET` | Gere um novo com: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` | `a1b2c3d4e5f6...` |
| `VITE_APP_ID` | Painel Manus → Settings → OAuth | `app_123456` |
| `OWNER_OPEN_ID` | Painel Manus → Account → Profile | `user_abc123` |
| `OWNER_NAME` | Seu nome | `João Silva` |
| `BUILT_IN_FORGE_API_KEY` | Painel Manus → API Keys | `key_xyz789` |

### 2.3 Validar Variáveis
```bash
# Verificar se todas as variáveis estão definidas
cat .env.local

# Testar conexão com banco
pnpm drizzle-kit studio
```

---

## 🗄️ Passo 3: Sincronizar Banco de Dados

### 3.1 Executar Migrações
```bash
# Gerar migrações (se houver mudanças)
pnpm drizzle-kit generate

# Executar todas as migrações
pnpm drizzle-kit migrate
```

### 3.2 Verificar Tabelas
```bash
# Abrir Drizzle Studio para verificar
pnpm drizzle-kit studio

# Ou verificar via SQL
mysql -u username -p database_name -e "SHOW TABLES;"
```

### 3.3 Adicionar Produtos Iniciais (Opcional)
```bash
# Se quiser adicionar os mesmos produtos, execute:
mysql -u username -p database_name < drizzle/seed-products.sql
```

---

## 🔐 Passo 4: Atualizar Credenciais Sensíveis

### 4.1 Mudar Senha do Admin

**Arquivo**: `server/routers.ts` (linhas 23-24)

```typescript
// ANTES:
const ADMIN_USERNAME = 'Aurora25';
const ADMIN_PASSWORD = 'Aqua1048';

// DEPOIS:
const ADMIN_USERNAME = 'seu_novo_usuario';
const ADMIN_PASSWORD = 'sua_nova_senha_forte';
```

### 4.2 Mudar Número do WhatsApp

**Arquivo**: `client/src/pages/Home.tsx` (linha 214)

```typescript
// ANTES:
const whatsappNumber = "5571992180210";

// DEPOIS:
const whatsappNumber = "seu_novo_numero_com_55";
```

### 4.3 Atualizar Informações da Loja

**Arquivo**: `client/src/pages/Home.tsx` (procure por):
- Nome da loja
- Email de contato
- Redes sociais
- Horário de funcionamento

---

## 🧪 Passo 5: Testar Localmente

### 5.1 Iniciar Servidor
```bash
pnpm dev
```

### 5.2 Testar Funcionalidades
- [ ] Página inicial carrega sem erros
- [ ] Produtos aparecem no catálogo
- [ ] Carrinho funciona
- [ ] Scroll do carrinho funciona
- [ ] Formulário de pedido valida corretamente
- [ ] Botão WhatsApp abre com número correto
- [ ] Painel admin abre com novas credenciais

### 5.3 Verificar Console
```bash
# Abrir DevTools (F12)
# Verificar se há erros em Console
# Verificar Network para requisições tRPC
```

---

## 🏗️ Passo 6: Build para Produção

### 6.1 Criar Build
```bash
pnpm build
```

### 6.2 Verificar Build
```bash
# Tamanho dos arquivos
ls -lh dist/

# Testar build localmente
pnpm preview
```

### 6.3 Verificar Erros
```bash
# TypeScript
pnpm check

# Testes
pnpm test
```

---

## 🚀 Passo 7: Deploy no Manus

### 7.1 Fazer Commit
```bash
git init
git add .
git commit -m "Migração para nova conta Manus"
```

### 7.2 Criar Checkpoint
```bash
# Via interface Manus:
# 1. Acesse o painel
# 2. Clique em "Create Checkpoint"
# 3. Adicione descrição: "Migração da conta anterior"
```

### 7.3 Publicar
```bash
# Via interface Manus:
# 1. Clique em "Publish"
# 2. Selecione o checkpoint
# 3. Escolha o domínio
# 4. Confirme
```

### 7.4 Configurar Domínio
```bash
# Via interface Manus:
# 1. Settings → Domains
# 2. Adicione domínio personalizado (se tiver)
# 3. Configure registros DNS
```

---

## ✅ Verificação Final

### 8.1 Checklist de Segurança
- [ ] `.env.local` não está commitado no Git
- [ ] Senhas padrão foram alteradas
- [ ] Número WhatsApp está correto
- [ ] Banco de dados está sincronizado
- [ ] Credenciais Manus estão corretas

### 8.2 Checklist de Funcionalidade
- [ ] Site carrega sem erros
- [ ] Produtos aparecem
- [ ] Carrinho funciona
- [ ] Pedidos podem ser criados
- [ ] WhatsApp recebe mensagens
- [ ] Painel admin funciona
- [ ] Notificações funcionam

### 8.3 Checklist de Performance
- [ ] Build completa sem warnings
- [ ] Testes passam
- [ ] TypeScript sem erros
- [ ] Tamanho do bundle aceitável

---

## 🔄 Troubleshooting

### Erro: "Database connection failed"
```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Testar conexão
pnpm drizzle-kit studio

# Verificar credenciais MySQL
mysql -u username -p -h host -e "SELECT 1;"
```

### Erro: "VITE_APP_ID not found"
```bash
# Verificar .env.local
cat .env.local | grep VITE_APP_ID

# Obter novo ID no painel Manus
# Settings → OAuth → Application ID
```

### Erro: "Build failed"
```bash
# Limpar cache
rm -rf node_modules .next dist
pnpm install

# Verificar TypeScript
pnpm check

# Build novamente
pnpm build
```

### Erro: "Banco de dados não sincronizado"
```bash
# Executar migrações novamente
pnpm drizzle-kit migrate

# Verificar tabelas
pnpm drizzle-kit studio
```

---

## 📞 Suporte

Se encontrar problemas:

1. **Verifique este checklist** - 90% dos problemas estão aqui
2. **Consulte os guias de documentação**:
   - `GUIA_CONTINUIDADE_COMPLETO.md`
   - `DEPLOY_E_CONFIGURACAO.md`
   - `DESENVOLVIMENTO_E_CUSTOMIZACAO.md`
3. **Acesse o suporte Manus**: https://help.manus.im

---

## 📝 Notas Importantes

- ⚠️ **Nunca commite `.env.local`** - Adicione ao `.gitignore`
- ⚠️ **Mude as senhas padrão** antes de publicar
- ⚠️ **Sincronize o banco** após clonar
- ⚠️ **Teste localmente** antes de publicar
- ⚠️ **Faça backup** das credenciais em local seguro

---

**Versão**: 22028e59  
**Data**: 13 de Fevereiro de 2026  
**Status**: ✅ Pronto para Migração
