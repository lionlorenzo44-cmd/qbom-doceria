# 🚀 Guia de Deploy e Configuração - QBom Doceria

---

## 📋 Checklist de Deploy

- [ ] Banco de dados configurado e sincronizado
- [ ] Variáveis de ambiente definidas
- [ ] Dependências instaladas
- [ ] Build testado localmente
- [ ] Checkpoint criado
- [ ] Domínio configurado
- [ ] Publicado no Manus

---

## 🔧 Configuração Inicial

### 1. Variáveis de Ambiente Necessárias

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Banco de Dados (obrigatório)
DATABASE_URL=mysql://username:password@host:3306/database_name

# JWT (obrigatório)
JWT_SECRET=sua_chave_secreta_muito_longa_e_aleatoria_aqui

# OAuth Manus (obrigatório)
VITE_APP_ID=seu_app_id_aqui
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Informações do Proprietário (obrigatório)
OWNER_NAME=Seu Nome
OWNER_OPEN_ID=seu_open_id

# APIs Internas Manus (automático)
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=seu_token_aqui
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=seu_token_frontend_aqui
```

### 2. Sincronizar Banco de Dados

```bash
# Gerar migrações (se houver mudanças no schema)
pnpm drizzle-kit generate

# Executar migrações
pnpm drizzle-kit migrate

# Verificar status
pnpm drizzle-kit studio
```

### 3. Instalar Dependências

```bash
pnpm install
```

### 4. Testar Localmente

```bash
# Iniciar servidor de desenvolvimento
pnpm dev

# Abrir no navegador
# http://localhost:3000
```

---

## 🌐 Configuração de Domínio

### Opção 1: Domínio Manus Automático
1. Acesse o painel do Manus
2. Vá para Settings → Domains
3. Use o domínio gerado automaticamente (ex: qbomdoces-7.manus.space)

### Opção 2: Domínio Personalizado
1. Compre um domínio (GoDaddy, Namecheap, etc.)
2. No painel Manus, vá para Settings → Domains
3. Clique em "Add Custom Domain"
4. Siga as instruções para configurar registros DNS
5. Aguarde a propagação DNS (até 24 horas)

### Opção 3: Domínio Existente
1. Acesse seu registrador de domínio
2. Configure os registros DNS para apontar para o Manus
3. Adicione o domínio no painel Manus

---

## 📦 Build para Produção

### 1. Criar Build

```bash
pnpm build
```

### 2. Testar Build

```bash
pnpm preview
```

### 3. Verificar Tamanho

```bash
ls -lh dist/
```

---

## 🚀 Deploy no Manus

### Passo 1: Criar Checkpoint

```bash
# Já feito! Versão: 22028e59
# Mas você pode criar um novo se tiver mudanças:
# Use a interface do Manus ou git commit + push
```

### Passo 2: Publicar

1. Acesse o painel do Manus
2. Vá para o projeto "qbom-doceria-app"
3. Clique no botão "Publish" (canto superior direito)
4. Selecione o domínio desejado
5. Confirme a publicação
6. Aguarde o deploy (geralmente 2-5 minutos)

### Passo 3: Verificar Deploy

```bash
# Teste a URL publicada
curl https://seu-dominio.com

# Ou acesse no navegador
# https://seu-dominio.com
```

---

## 🔄 Atualizar Projeto em Produção

### Fluxo de Atualização

1. **Fazer mudanças localmente**
   ```bash
   # Editar arquivos
   # Testar com pnpm dev
   ```

2. **Commit e Push**
   ```bash
   git add .
   git commit -m "Descrição das mudanças"
   git push origin main
   ```

3. **Criar Checkpoint**
   ```bash
   # Usar interface do Manus ou:
   git tag -a v1.1.0 -m "Versão 1.1.0"
   git push origin v1.1.0
   ```

4. **Publicar**
   - Clique em "Publish" no painel do Manus
   - Selecione o novo checkpoint
   - Confirme

---

## 🛡️ Segurança

### 1. Proteger Credenciais

✅ **Fazer**:
```bash
# Usar .env.local (nunca commitar)
echo ".env.local" >> .gitignore
```

❌ **Não fazer**:
```bash
# Nunca commitar credenciais
git add .env.local  # ERRADO!
```

### 2. Senhas do Admin

**Localização**: `server/routers.ts` linha 23-24

**Mudar senha**:
```typescript
const ADMIN_USERNAME = 'NovoUsuario';
const ADMIN_PASSWORD = 'NovaSenha123!';
```

⚠️ **Importante**: Mude a senha padrão!

### 3. JWT Secret

Gere um novo JWT Secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Atualize em `.env.local`:
```env
JWT_SECRET=seu_novo_secret_aqui
```

---

## 📊 Monitoramento

### Logs do Servidor

```bash
# Ver logs em tempo real
tail -f .manus-logs/devserver.log

# Ver erros de console
tail -f .manus-logs/browserConsole.log

# Ver requisições de rede
tail -f .manus-logs/networkRequests.log
```

### Verificar Status

```bash
# Testar conexão com banco
pnpm drizzle-kit studio

# Verificar build
pnpm build

# Verificar testes
pnpm test
```

---

## 🐛 Troubleshooting de Deploy

### Erro: "Build failed"
```bash
# Limpar cache e reinstalar
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

### Erro: "Database connection failed"
```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Testar conexão
pnpm drizzle-kit studio
```

### Erro: "Port already in use"
```bash
# Matar processo na porta 3000
lsof -i :3000
kill -9 <PID>

# Ou usar porta diferente
PORT=3001 pnpm dev
```

### Erro: "Module not found"
```bash
# Reinstalar dependências
pnpm install

# Limpar cache
pnpm store prune
```

---

## 📈 Performance

### Otimizações Implementadas

1. ✅ Compressão de imagens
2. ✅ Lazy loading de componentes
3. ✅ Cache de produtos
4. ✅ Minificação de CSS/JS
5. ✅ HTTP/2 Server Push

### Melhorias Futuras

- [ ] Implementar Service Worker (PWA)
- [ ] Adicionar CDN para imagens
- [ ] Implementar caching de API
- [ ] Otimizar bundle size

---

## 🔄 Rollback (Reverter Deploy)

Se algo der errado após publicar:

1. **Via Manus UI**:
   - Vá para Dashboard
   - Selecione o checkpoint anterior
   - Clique em "Rollback"

2. **Via Git**:
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

3. **Criar novo checkpoint** e publicar

---

## 📞 Suporte Manus

Para problemas com:
- Deploy
- Domínios
- Certificados SSL
- Performance

Acesse: https://help.manus.im

---

**Última atualização**: 13 de Fevereiro de 2026  
**Versão**: 22028e59
