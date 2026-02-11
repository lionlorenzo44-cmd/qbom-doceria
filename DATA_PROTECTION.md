# Política de Proteção de Dados - Qbom Doceria

## Objetivo

Este documento estabelece regras rigorosas para evitar sobrescrita acidental de dados e funcionalidades já implementadas no projeto.

## Regras Fundamentais

### 1. Arquivos Intocáveis (Sem Modificação)

Os seguintes arquivos **NUNCA** devem ser completamente reescritos com `write` action:

- `client/src/pages/Admin.tsx` - Painel administrativo completo
- `client/src/pages/Home.tsx` - Homepage com cardápio
- `server/db.ts` - Funções de banco de dados
- `drizzle/schema.ts` - Schema do banco de dados
- `client/src/components/ProductManager.tsx` - Gerenciador de produtos

**Exceção:** Usar `edit` action para modificações cirúrgicas em linhas específicas.

### 2. Dados de Produtos

**NUNCA:**
- Sobrescrever imagens de produtos existentes sem confirmação
- Alterar IDs de produtos
- Deletar produtos sem backup
- Modificar preços sem auditoria

**SEMPRE:**
- Fazer backup antes de alterações em massa
- Usar transações SQL para mudanças críticas
- Registrar alterações no histórico

### 3. Dados de Pedidos

**NUNCA:**
- Modificar pedidos históricos
- Alterar status de pedidos completados
- Deletar registros de pagamento

**SEMPRE:**
- Manter histórico completo de pedidos
- Usar soft deletes (marcar como deletado, não remover)
- Registrar quem fez cada alteração

### 4. Rotas e Endpoints

**NUNCA:**
- Remover rotas públicas existentes
- Alterar URLs de endpoints
- Mudar assinatura de procedures tRPC sem migração

**SEMPRE:**
- Adicionar novas rotas, não remover
- Manter compatibilidade com versões anteriores
- Testar todas as rotas após mudanças

### 5. Componentes React

**NUNCA:**
- Recriar componentes inteiros quando precisa de pequenas mudanças
- Remover props de componentes existentes
- Alterar estrutura de pastas sem avisar

**SEMPRE:**
- Usar `edit` action para mudanças pontuais
- Criar novos componentes ao invés de modificar existentes
- Manter componentes modulares e reutilizáveis

## Fluxo de Desenvolvimento Seguro

### Ao Fazer Alterações:

1. **Ler o arquivo completo** antes de editar
2. **Usar `edit` action** para mudanças específicas
3. **Testar com vitest** após cada alteração
4. **Criar checkpoint** antes de mudanças arriscadas
5. **Documentar** o que foi alterado e por quê

### Ao Adicionar Funcionalidades:

1. **Criar novos arquivos** ao invés de modificar existentes
2. **Integrar gradualmente** sem quebrar funcionalidades
3. **Testar fluxo completo** antes de commitar
4. **Atualizar todo.md** com progresso

## Estrutura de Arquivos Protegidos

```
client/src/
├── pages/
│   ├── Home.tsx ⚠️ PROTEGIDO
│   ├── Admin.tsx ⚠️ PROTEGIDO
│   ├── AdminLogin.tsx ✅ NOVO (seguro)
│   └── NotFound.tsx
├── components/
│   ├── ProductManager.tsx ⚠️ PROTEGIDO
│   └── [outros componentes]
└── lib/
    └── trpc.ts ⚠️ PROTEGIDO

server/
├── routers.ts ⚠️ PROTEGIDO (usar edit para novos endpoints)
├── db.ts ⚠️ PROTEGIDO
└── [testes]

drizzle/
└── schema.ts ⚠️ PROTEGIDO
```

## Checklist Antes de Commitar

- [ ] Todos os 18+ testes vitest passando
- [ ] Nenhum arquivo protegido foi reescrito com `write`
- [ ] Novas funcionalidades em arquivos novos
- [ ] Imagens de produtos não foram sobrescritas
- [ ] Dados de pedidos intactos
- [ ] Rotas públicas funcionando
- [ ] todo.md atualizado com progresso

## Recuperação de Erros

Se algo foi sobrescrito acidentalmente:

1. **IMEDIATAMENTE** chamar `webdev_rollback_checkpoint`
2. **Identificar** qual checkpoint restaurar
3. **Reimplementar** a funcionalidade de forma segura
4. **Documentar** o que aconteceu

## Contato e Suporte

Para dúvidas sobre proteção de dados, consulte este documento antes de fazer alterações.

---

**Última atualização:** 11 de fevereiro de 2026  
**Versão:** 1.0
