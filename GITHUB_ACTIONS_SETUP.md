# 🚀 Configuração de GitHub Actions - Guia Manual

Devido a restrições de permissões do GitHub App, você precisará adicionar os workflows manualmente via GitHub Web Interface.

---

## 📋 Workflows a Serem Criados

Existem 3 workflows que precisam ser criados:

1. **CI - Testes e Validação** (`ci.yml`)
2. **Build e Deploy** (`build.yml`)
3. **Análise de Código** (`code-analysis.yml`)

---

## 🔧 Como Adicionar os Workflows

### Passo 1: Acessar GitHub

1. Vá para seu repositório: https://github.com/lionlorenzo44-cmd/qbom-doceria
2. Clique na aba **"Actions"**
3. Clique em **"New workflow"** ou **"set up a workflow yourself"**

### Passo 2: Criar o Primeiro Workflow (CI)

1. Clique em **"set up a workflow yourself"**
2. Nomeie o arquivo como `ci.yml`
3. Copie o conteúdo abaixo:

```yaml
name: CI - Testes e Validação

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    name: Testes e Validação
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x, 22.x]
    
    steps:
    - name: Checkout código
      uses: actions/checkout@v4
    
    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Instalar pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 10
    
    - name: Instalar dependências
      run: pnpm install --frozen-lockfile
    
    - name: Validar tipos
      run: pnpm validate-types
    
    - name: Executar testes
      run: pnpm test
    
    - name: Fazer build
      run: pnpm build
    
    - name: Upload artefatos de build
      if: success()
      uses: actions/upload-artifact@v4
      with:
        name: dist-${{ matrix.node-version }}
        path: dist/
        retention-days: 7

  lint:
    name: Linting e Formatação
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout código
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '22.x'
        cache: 'npm'
    
    - name: Instalar pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 10
    
    - name: Instalar dependências
      run: pnpm install --frozen-lockfile
    
    - name: Verificar formatação com Prettier
      run: pnpm prettier --check . || true
    
    - name: Verificar tipos TypeScript
      run: pnpm tsc --noEmit || true

  security:
    name: Verificação de Segurança
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout código
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '22.x'
        cache: 'npm'
    
    - name: Instalar pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 10
    
    - name: Instalar dependências
      run: pnpm install --frozen-lockfile
    
    - name: Verificar vulnerabilidades npm
      run: npm audit --audit-level=moderate || true
```

4. Clique em **"Commit changes"**
5. Escolha **"Create a new branch for this commit and start a pull request"**
6. Clique em **"Propose changes"**

### Passo 3: Criar o Segundo Workflow (Build)

Repita o processo acima, mas:
- Nome do arquivo: `build.yml`
- Conteúdo: [veja abaixo]

```yaml
name: Build e Deploy

on:
  push:
    branches: [ main ]
  workflow_run:
    workflows: ["CI - Testes e Validação"]
    types: [completed]
    branches: [main]

jobs:
  build:
    name: Build da Aplicação
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'success' || github.event_name == 'push' }}
    
    steps:
    - name: Checkout código
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '22.x'
        cache: 'npm'
    
    - name: Instalar pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 10
    
    - name: Instalar dependências
      run: pnpm install --frozen-lockfile
    
    - name: Validar tipos
      run: pnpm validate-types
    
    - name: Executar testes
      run: pnpm test
    
    - name: Fazer build
      run: pnpm build
    
    - name: Upload artefatos de build
      uses: actions/upload-artifact@v4
      with:
        name: production-build
        path: dist/
        retention-days: 30
    
    - name: Sucesso no Build
      run: |
        echo "✅ Build e testes completados com sucesso!"
        echo "📦 Artefatos prontos para deploy"
```

### Passo 4: Criar o Terceiro Workflow (Análise)

Repita o processo acima, mas:
- Nome do arquivo: `code-analysis.yml`
- Conteúdo: [veja abaixo]

```yaml
name: Análise de Código

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
  schedule:
    - cron: '0 2 * * *'

jobs:
  analyze:
    name: Análise Estática de Código
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout código
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '22.x'
        cache: 'npm'
    
    - name: Instalar pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 10
    
    - name: Instalar dependências
      run: pnpm install --frozen-lockfile
    
    - name: Verificar tipos TypeScript
      run: pnpm tsc --noEmit || true
    
    - name: Verificar vulnerabilidades
      run: npm audit --audit-level=moderate || true
```

---

## ✅ Verificar Workflows

Após criar os workflows:

1. Vá para a aba **"Actions"** do seu repositório
2. Você verá os 3 workflows listados
3. Faça um push para testar (ex: `git push`)
4. Os workflows devem começar a executar automaticamente

---

## 🔍 Monitorar Execução

1. Clique na aba **"Actions"**
2. Clique no workflow que está executando
3. Você verá o status de cada job em tempo real

---

## 📊 Badges de Status

Adicione estas linhas ao seu `README.md`:

```markdown
## Status dos Workflows

[![CI - Testes e Validação](https://github.com/lionlorenzo44-cmd/qbom-doceria/actions/workflows/ci.yml/badge.svg)](https://github.com/lionlorenzo44-cmd/qbom-doceria/actions/workflows/ci.yml)
[![Build e Deploy](https://github.com/lionlorenzo44-cmd/qbom-doceria/actions/workflows/build.yml/badge.svg)](https://github.com/lionlorenzo44-cmd/qbom-doceria/actions/workflows/build.yml)
[![Análise de Código](https://github.com/lionlorenzo44-cmd/qbom-doceria/actions/workflows/code-analysis.yml/badge.svg)](https://github.com/lionlorenzo44-cmd/qbom-doceria/actions/workflows/code-analysis.yml)
```

---

## 🚨 Solução de Problemas

### Workflow não aparece
- Verifique se o arquivo está em `.github/workflows/`
- Verifique se o nome do arquivo termina com `.yml`
- Aguarde alguns segundos e recarregue a página

### Workflow falha
- Clique no workflow para ver os logs
- Procure pela mensagem de erro
- Corrija o problema e faça push novamente

### Testes falhando
- Execute `pnpm test` localmente
- Corrija os erros
- Faça push novamente

---

## 📚 Referências

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Marketplace Actions](https://github.com/marketplace?type=actions)

---

**Status:** ⏳ Aguardando configuração manual via GitHub Web Interface
