# Sistema Automático de Prevenção de Erros de Tipo

## 📋 Visão Geral

Este sistema previne automaticamente erros de tipo que causam **carregamento infinito** na publicação. O problema ocorre quando há incompatibilidade entre tipos do schema Drizzle e tipos inferidos do banco de dados.

**Exemplo do erro:**
```
Type 'string | null' is not assignable to type 'string | undefined'
Type 'null' is not assignable to type 'string | undefined'
```

## 🔧 Como Funciona

### 1. **Validação Automática** (`validate-types.mjs`)
- Detecta campos TEXT/VARCHAR sem tipos explícitos
- Identifica mismatches entre `null` e `undefined`
- Verifica consistência de tipos em campos críticos

### 2. **Pre-commit Hook** (`.husky/pre-commit`)
- Roda validação antes de cada commit
- Impede commits com erros de tipo
- Sugere correção automática

### 3. **Correção Automática** (`--fix`)
- Converte `string | undefined` para `string | null`
- Adiciona tipos explícitos onde faltam
- Atualiza schema automaticamente

## 📝 Comandos Disponíveis

### Validar Tipos
```bash
pnpm validate-types
```
Verifica se há erros de tipo no schema.

### Corrigir Automaticamente
```bash
pnpm fix-types
```
Corrige erros de tipo automaticamente e sugere próximos passos.

### Executar Após Correção
```bash
pnpm drizzle-kit generate
pnpm db:push
```

## 🎯 Regras de Tipo

### Campos Nullable (podem ser NULL no banco)
```typescript
// ✅ Correto
url: text("url"),                    // Drizzle infere: string | null
ipAddress: varchar("ipAddress", { length: 45 }),  // Drizzle infere: string | null
```

### Campos com Tipo Explícito
```typescript
// ✅ Correto
errorStack: text("errorStack").$type<string | null>(),
userAgent: text("userAgent").$type<string | null>(),
```

### Tipos Incompatíveis (❌ EVITAR)
```typescript
// ❌ Errado - Drizzle retorna null, mas tipo diz undefined
url: text("url").$type<string | undefined>(),

// ❌ Errado - Sem tipo explícito (ambiguo)
ipAddress: varchar("ipAddress", { length: 45 }),
```

## 🛡️ Boas Práticas

1. **Sempre use tipos explícitos para campos nullable**
   ```typescript
   url: text("url").$type<string | null>(),
   ```

2. **Mantenha consistência entre schema e interfaces**
   ```typescript
   interface ErrorLog {
     url?: string | null;  // Matches schema
   }
   ```

3. **Rode validação antes de publicar**
   ```bash
   pnpm validate-types
   ```

4. **Se houver erro, use correção automática**
   ```bash
   pnpm fix-types
   pnpm drizzle-kit generate
   ```

## 🚀 Fluxo de Desenvolvimento

1. **Modificar schema** → `drizzle/schema.ts`
2. **Rodar validação** → `pnpm validate-types`
3. **Se erro, corrigir** → `pnpm fix-types`
4. **Gerar migração** → `pnpm drizzle-kit generate`
5. **Aplicar migração** → `pnpm db:push`
6. **Testar** → `pnpm test`
7. **Commitar** → Pre-commit hook valida automaticamente

## 📊 Campos Monitorados

O sistema monitora especialmente estes campos que causaram problemas:

- `errorLogs.url` - URL da página onde erro ocorreu
- `errorLogs.ipAddress` - IP do cliente
- `errorLogs.userAgent` - User agent do navegador
- `errorLogs.errorStack` - Stack trace do erro

## 🔍 Troubleshooting

### Erro: "Validação de tipos falhou"
```bash
# Corrigir automaticamente
pnpm fix-types

# Depois gerar migração
pnpm drizzle-kit generate

# Aplicar migração
pnpm db:push
```

### Erro: "Tipos ainda incompatíveis após fix"
1. Verifique se há interfaces customizadas que precisam atualizar
2. Procure por `interface ErrorLog` ou similar
3. Atualize tipos para `string | null` ao invés de `string | undefined`

### Pre-commit hook não funciona
```bash
# Reinstalar husky
pnpm prepare

# Tornar hook executável
chmod +x .husky/pre-commit
```

## 📚 Referências

- [Drizzle Type Safety](https://orm.drizzle.team/docs/sql-schema-declaration)
- [TypeScript null vs undefined](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [Husky Pre-commit Hooks](https://typicode.github.io/husky/)
