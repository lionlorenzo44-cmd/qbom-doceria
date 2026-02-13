# 📋 Guia de Continuidade - QBom Doceria

## Como Continuar o Projeto

Se você precisar clonar novamente ou continuar em outro ambiente, siga este guia passo a passo.

---

## ✅ Passo 1: Preparação Inicial

### Clone o Repositório
```bash
cd /home/ubuntu
gh repo clone lionlorenzo44-cmd/qbom-doceria-app qbom-doceria-app
cd qbom-doceria-app
```

### Instale Dependências
```bash
pnpm install
```

### Verifique Variáveis de Ambiente
As variáveis de ambiente são injetadas automaticamente pelo Manus. Você pode verificar com:
```bash
echo $DATABASE_URL
echo $JWT_SECRET
```

---

## 🗄️ Passo 2: Banco de Dados

### Aplique Migrações
```bash
pnpm drizzle-kit migrate
```

### Verifique Tabelas Criadas
Todas as tabelas devem ser criadas automaticamente:
- `users`
- `products`
- `orders`
- `orderItems`
- `payments`
- `cashRegister`

### Insira Dados Iniciais (Opcional)
Se precisar popular com produtos:
```bash
node scripts/seed-products.mjs
```

---

## 🚀 Passo 3: Inicie o Desenvolvimento

### Inicie o Servidor
```bash
pnpm dev
```

### Acesse o Site
- **Local:** http://localhost:3000
- **Desenvolvimento:** https://3000-ix89a74xg9efbbe71yzw0-bbaec3e7.us1.manus.computer
- **Produção:** https://qbomdocer-gjtnqdbq.manus.space

---

## 📝 Passo 4: Verifique Tarefas Pendentes

Abra o arquivo `todo.md` para ver o que ainda precisa ser feito:
```bash
cat todo.md
```

---

## 🔍 Passo 5: Estrutura do Projeto

Consulte `PROJECT_STRUCTURE.md` para entender a organização dos arquivos:
```bash
cat PROJECT_STRUCTURE.md
```

---

## 🛠️ Desenvolvimento

### Adicionar Novo Recurso

1. **Atualizar Schema** (se necessário)
   ```bash
   # Editar: drizzle/schema.ts
   # Depois:
   pnpm drizzle-kit generate
   pnpm drizzle-kit migrate
   ```

2. **Adicionar Query Helper** (se necessário)
   ```bash
   # Editar: server/db.ts
   ```

3. **Criar Procedure tRPC**
   ```bash
   # Editar: server/routers.ts
   ```

4. **Criar Testes**
   ```bash
   # Criar: server/feature.test.ts
   # Executar: pnpm test
   ```

5. **Criar Interface**
   ```bash
   # Editar: client/src/pages/ ou client/src/components/
   ```

---

## ✨ Funcionalidades Implementadas

- ✅ Cardápio digital com produtos
- ✅ Carrinho de compras
- ✅ Integração WhatsApp
- ✅ Painel administrativo local
- ✅ Histórico de pedidos
- ✅ Sistema de avaliações
- ✅ Controle de caixa
- ✅ Monitoramento de saúde
- ✅ Webhooks
- ✅ Autenticação admin

---

## 📊 Tabelas Principais

### products
Armazena os doces disponíveis:
```sql
SELECT * FROM products WHERE isActive = 1;
```

### orders
Armazena os pedidos:
```sql
SELECT * FROM orders ORDER BY createdAt DESC;
```

### orderItems
Itens de cada pedido:
```sql
SELECT oi.*, p.name FROM orderItems oi 
JOIN products p ON oi.productId = p.id 
WHERE oi.orderId = ?;
```

---

## 🔐 Painel Admin

### Acessar Painel Admin
1. Acesse a página inicial
2. Clique no ❤️ (coração) no rodapé
3. Insira a senha admin (definida no código)

### Funcionalidades do Admin
- Adicionar/editar/deletar produtos
- Visualizar pedidos
- Mudar status de pedidos
- Gerenciar avaliações
- Controle de caixa
- Webhooks

---

## 🧪 Testes

### Executar Todos os Testes
```bash
pnpm test
```

### Executar Teste Específico
```bash
pnpm test -- auth.logout.test.ts
```

### Verificar Tipos TypeScript
```bash
pnpm check
```

---

## 📦 Build e Deploy

### Build para Produção
```bash
pnpm build
```

### Iniciar Servidor de Produção
```bash
pnpm start
```

### Publicar no Manus
1. Salve um checkpoint via interface Manus
2. Clique em "Publish"
3. Aguarde o deploy

---

## 🐛 Troubleshooting

### Erro: "Table doesn't exist"
```bash
# Solução:
pnpm drizzle-kit migrate
```

### Erro: "Module not found"
```bash
# Solução:
pnpm install
pnpm check
```

### Erro: "Port already in use"
```bash
# Solução:
lsof -i :3000
kill -9 <PID>
```

### Erro: "Database connection failed"
```bash
# Verifique variáveis de ambiente:
echo $DATABASE_URL
# Se vazio, reinicie o servidor
```

---

## 📚 Recursos Úteis

- **Documentação Manus:** https://docs.manus.im
- **tRPC Docs:** https://trpc.io
- **Drizzle ORM:** https://orm.drizzle.team
- **Tailwind CSS:** https://tailwindcss.com
- **React 19:** https://react.dev

---

## 💾 Checkpoint Atual

**Versão:** 46dc17fc  
**Data:** 13 de Fevereiro de 2026  
**Status:** Pronto para publicação

---

## 📞 Próximos Passos

1. Configure o domínio personalizado em Settings → Domains
2. Adicione mais produtos via painel admin
3. Teste o fluxo completo de pedidos
4. Configure número WhatsApp para receber pedidos
5. Publique o site

---

**Última Atualização:** 13 de Fevereiro de 2026
