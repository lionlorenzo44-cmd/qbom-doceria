# 🚀 Configuração CI/CD com GitHub Actions

Este documento descreve a configuração de CI/CD para o projeto Qbom Doceria.

---

## 📋 Visão Geral

O projeto possui 3 workflows principais configurados no GitHub Actions:

### 1. **CI - Testes e Validação** (`.github/workflows/ci.yml`)
Executa automaticamente a cada push ou pull request nas branches `main` e `develop`.

**O que faz:**
- ✅ Instala dependências
- ✅ Valida tipos TypeScript
- ✅ Executa testes unitários (37 testes)
- ✅ Faz build da aplicação
- ✅ Verifica formatação com Prettier
- ✅ Verifica vulnerabilidades de segurança

**Testado com:**
- Node.js 18.x, 20.x, 22.x

**Tempo de execução:** ~5-10 minutos

---

### 2. **Build e Deploy** (`.github/workflows/build.yml`)
Executa automaticamente após sucesso do workflow CI na branch `main`.

**O que faz:**
- ✅ Faz build da aplicação
- ✅ Valida tipos
- ✅ Executa testes
- ✅ Faz upload de artefatos
- ✅ Verifica estrutura do build
- ✅ Gera release notes

**Artefatos gerados:**
- `production-build/` - Código compilado pronto para deploy
- `build-info/` - Informações do build

**Tempo de execução:** ~5-8 minutos

---

### 3. **Análise de Código** (`.github/workflows/code-analysis.yml`)
Executa a cada push, pull request e diariamente às 2 AM.

**O que faz:**
- ✅ Análise estática de código
- ✅ Verificação de tipos TypeScript
- ✅ Verificação de formatação
- ✅ Análise de dependências
- ✅ Verificação de vulnerabilidades
- ✅ Cobertura de testes

**Tempo de execução:** ~3-5 minutos

---

## 🔄 Fluxo de Execução

```
Push no GitHub
    ↓
[CI - Testes e Validação]
    ├─ Testes (Node 18.x, 20.x, 22.x)
    ├─ Linting e Formatação
    └─ Segurança
    ↓
Se sucesso na main:
    ↓
[Build e Deploy]
    ├─ Build da Aplicação
    ├─ Teste do Build
    └─ Notificação de Sucesso
    ↓
[Análise de Código] (paralelo)
    ├─ Análise Estática
    ├─ Verificação de Dependências
    └─ Cobertura de Testes
```

---

## 📊 Status dos Workflows

Para ver o status dos workflows:

1. Vá para seu repositório: https://github.com/lionlorenzo44-cmd/qbom-doceria
2. Clique na aba **"Actions"**
3. Você verá todos os workflows e seu status

### Badges de Status

Adicione estas linhas ao seu `README.md` para mostrar o status:

```markdown
[![CI - Testes e Validação](https://github.com/lionlorenzo44-cmd/qbom-doceria/actions/workflows/ci.yml/badge.svg)](https://github.com/lionlorenzo44-cmd/qbom-doceria/actions/workflows/ci.yml)
[![Build e Deploy](https://github.com/lionlorenzo44-cmd/qbom-doceria/actions/workflows/build.yml/badge.svg)](https://github.com/lionlorenzo44-cmd/qbom-doceria/actions/workflows/build.yml)
[![Análise de Código](https://github.com/lionlorenzo44-cmd/qbom-doceria/actions/workflows/code-analysis.yml/badge.svg)](https://github.com/lionlorenzo44-cmd/qbom-doceria/actions/workflows/code-analysis.yml)
```

---

## 🛠️ Configuração Local

Para testar os workflows localmente, você pode usar o `act`:

```bash
# Instalar act
brew install act  # macOS
# ou
choco install act  # Windows

# Executar um workflow específico
act -j test

# Executar todos os workflows
act
```

---

## 📝 Variáveis de Ambiente

Os workflows usam as seguintes variáveis:

| Variável | Descrição |
|----------|-----------|
| `GITHUB_SHA` | Hash do commit atual |
| `GITHUB_REF` | Branch/tag atual |
| `GITHUB_ACTOR` | Usuário que fez o push |
| `GITHUB_RUN_NUMBER` | Número da execução |

---

## 🔐 Secrets e Configuração

Atualmente, os workflows não requerem secrets. Se você precisar adicionar:

1. Vá para **Settings → Secrets and variables → Actions**
2. Clique em **"New repository secret"**
3. Adicione a variável (ex: `DATABASE_URL`)

---

## ✅ Checklist de Verificação

Cada workflow verifica:

- [ ] Dependências instaladas corretamente
- [ ] Tipos TypeScript válidos
- [ ] Todos os 37 testes passando
- [ ] Build gerado com sucesso
- [ ] Sem vulnerabilidades críticas
- [ ] Código formatado corretamente
- [ ] Sem dependências desatualizadas

---

## 🚨 Solução de Problemas

### Workflow falha nos testes
1. Verifique os logs no GitHub Actions
2. Execute `pnpm test` localmente
3. Corrija os erros e faça push novamente

### Build falha
1. Verifique `pnpm build` localmente
2. Verifique se há arquivos grandes sendo commitados
3. Limpe cache: `pnpm store prune`

### Vulnerabilidades detectadas
1. Atualize as dependências: `pnpm update`
2. Verifique `npm audit` para detalhes
3. Faça push das atualizações

---

## 📈 Próximas Melhorias

- [ ] Adicionar cobertura de testes com relatórios
- [ ] Integrar com SonarCloud para análise de qualidade
- [ ] Adicionar deploy automático em staging
- [ ] Adicionar notificações no Slack/Discord
- [ ] Criar releases automáticas no GitHub

---

## 📚 Referências

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Marketplace Actions](https://github.com/marketplace?type=actions)

---

**Última atualização:** 12 de Fevereiro de 2026
**Status:** ✅ Configurado e Funcionando
