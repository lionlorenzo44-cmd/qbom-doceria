# 🍰 QBom Doceria - Site Interativo

[![Status](https://img.shields.io/badge/Status-Pronto%20para%20Deploy-brightgreen)](https://github.com/lionlorenzo44-cmd/qbom-doceria)
[![Versão](https://img.shields.io/badge/Versão-22028e59-blue)](https://github.com/lionlorenzo44-cmd/qbom-doceria)
[![Licença](https://img.shields.io/badge/Licença-Privada-red)](LICENSE)

Site interativo completo para a QBom Doceria com catálogo digital, carrinho de compras, pedidos via WhatsApp e painel administrativo.

**Hospedado em**: [Manus](https://manus.im)

---

## 🚀 Início Rápido

### 1. Clonar Repositório
```bash
git clone https://github.com/lionlorenzo44-cmd/qbom-doceria.git
cd qbom-doceria
```

### 2. Instalar Dependências
```bash
pnpm install
```

### 3. Configurar Ambiente
```bash
# Criar arquivo .env.local
cp .env.example .env.local

# Editar com suas credenciais Manus
nano .env.local
```

### 4. Sincronizar Banco de Dados
```bash
pnpm drizzle-kit migrate
```

### 5. Iniciar Desenvolvimento
```bash
pnpm dev
# Acesse: http://localhost:3000
```

---

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| **[GUIA_CONTINUIDADE_COMPLETO.md](GUIA_CONTINUIDADE_COMPLETO.md)** | Visão geral do projeto, estrutura, funcionalidades |
| **[DEPLOY_E_CONFIGURACAO.md](DEPLOY_E_CONFIGURACAO.md)** | Como publicar no Manus e configurar domínio |
| **[DESENVOLVIMENTO_E_CUSTOMIZACAO.md](DESENVOLVIMENTO_E_CUSTOMIZACAO.md)** | Como adicionar features e customizar |
| **[CHECKLIST_MIGRACAO_NOVA_CONTA.md](CHECKLIST_MIGRACAO_NOVA_CONTA.md)** | Passo-a-passo para migrar para nova conta Manus |

---

## ✨ Funcionalidades

- ✅ **Catálogo de Produtos** - Exibição com múltiplas imagens
- ✅ **Carrinho Interativo** - Adicionar/remover produtos com scroll automático
- ✅ **Formulário de Pedido** - Validação completa de dados
- ✅ **Integração WhatsApp** - Envio automático de pedidos
- ✅ **Painel Administrativo** - Gerenciar produtos e pedidos
- ✅ **Banco de Dados** - MySQL/TiDB com Drizzle ORM
- ✅ **Autenticação** - OAuth Manus integrado
- ✅ **Notificações** - Sistema de alertas para pedidos

---

## 🛠️ Tecnologias

- **Frontend**: React 19 + Tailwind CSS 4 + shadcn/ui
- **Backend**: Express 4 + tRPC 11
- **Banco**: MySQL/TiDB com Drizzle ORM
- **Build**: Vite
- **Testes**: Vitest
- **Autenticação**: OAuth Manus
- **Hospedagem**: Manus

---

## 📁 Estrutura do Projeto

```
qbom-doceria/
├── client/                  # Frontend React
│   ├── src/
│   │   ├── pages/          # Páginas principais
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── lib/            # Utilitários e hooks
│   │   └── App.tsx         # Roteamento principal
│   └── public/             # Arquivos estáticos
├── server/                  # Backend Express + tRPC
│   ├── routers.ts          # Procedures tRPC
│   ├── db.ts               # Funções de banco de dados
│   └── _core/              # Configurações internas
├── drizzle/                 # Schema e migrações
│   ├── schema.ts           # Definição de tabelas
│   └── *.sql               # Migrações SQL
├── package.json            # Dependências
├── tsconfig.json           # Configuração TypeScript
└── vite.config.ts          # Configuração Vite
```

---

## 🔐 Credenciais Padrão

| Item | Valor |
|------|-------|
| **Admin Username** | Aurora25 |
| **Admin Password** | Aqua1048 |
| **WhatsApp** | (71) 99218-0210 |

⚠️ **IMPORTANTE**: Mude as credenciais padrão antes de publicar!

---

## 🚀 Deploy no Manus

### 1. Criar Checkpoint
```bash
git add .
git commit -m "Versão pronta para produção"
git push origin main
```

### 2. Publicar
1. Acesse o painel Manus
2. Clique em "Publish"
3. Selecione o checkpoint
4. Escolha o domínio
5. Confirme

### 3. Configurar Domínio (Opcional)
1. Vá para Settings → Domains
2. Configure seu domínio personalizado
3. Atualize registros DNS

---

## 📊 Variáveis de Ambiente

Crie um arquivo `.env.local` com:

```env
# Banco de Dados
DATABASE_URL=mysql://user:password@host:3306/database

# JWT
JWT_SECRET=sua_chave_secreta_aqui

# OAuth Manus
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Proprietário
OWNER_OPEN_ID=seu_open_id
OWNER_NAME=Seu Nome

# APIs Manus
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=seu_token_aqui
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=seu_token_frontend_aqui
```

---

## 🧪 Testes

```bash
# Executar testes
pnpm test

# Verificar TypeScript
pnpm check

# Formatar código
pnpm format
```

---

## 🐛 Troubleshooting

### Erro: "Database connection failed"
```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Testar conexão
pnpm drizzle-kit studio
```

### Erro: "Build failed"
```bash
# Limpar cache
rm -rf node_modules dist
pnpm install
pnpm build
```

### Erro: "Banco não sincronizado"
```bash
# Executar migrações
pnpm drizzle-kit migrate
```

---

## 📞 Suporte

- **Documentação**: Veja os arquivos `.md` neste repositório
- **Suporte Manus**: https://help.manus.im
- **GitHub Issues**: Abra uma issue neste repositório

---

## 📝 Histórico de Versões

| Versão | Data | Status | Notas |
|--------|------|--------|-------|
| **22028e59** | 13/02/2026 | ✅ Estável | Versão final com documentação completa |
| dd99fec5 | 13/02/2026 | ✅ Estável | Scroll do carrinho ajustado |
| a33ffe7a | 13/02/2026 | ✅ Estável | Scroll do carrinho implementado |
| f78f0931 | 13/02/2026 | ✅ Inicial | Projeto criado |

---

## 📄 Licença

Privada - Todos os direitos reservados à QBom Doceria

---

## 🤝 Contribuindo

Este é um repositório privado. Para contribuir, entre em contato com o proprietário.

---

**Criado com ❤️ para QBom Doceria**

**Última atualização**: 13 de Fevereiro de 2026
