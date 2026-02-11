# Qbom Doceria - TODO

## Banco de Dados
- [x] Criar tabelas: products, orders, order_items, payments, users
- [x] Configurar relacionamentos entre tabelas

## Página Inicial e Cardápio
- [x] Design página inicial com identidade visual (vermelho rosado)
- [x] Implementar cardápio digital com produtos
- [x] Gerar/adicionar imagens dos doces
- [x] Botão "Fazer pedido no WhatsApp"
- [ ] Opção admin para adicionar novos produtos

## Integração WhatsApp
- [x] Implementar link WhatsApp com mensagem pré-formatada
- [x] Estruturar mensagem com produto, quantidade e dados do cliente
- [x] Testar envio de mensagens

## Painel Administrativo
- [x] Criar layout do painel admin (protegido por autenticação)
- [x] Listar pedidos em tempo real
- [x] Alterar status do pedido (novo, em preparo, entregue)
- [x] Opção de impressão de pedidos
- [ ] Modo balcão para pedidos presenciais (interface criada, falta integração)

## Controle de Caixa
- [x] Registrar entradas de pagamento
- [x] Visualizar histórico de transações
- [x] Totalizadores por período

## Relatórios de Vendas
- [x] Relatório básico com totalizadores
- [ ] Filtro por período
- [ ] Visualizar vendas por produto

## Notificações
- [x] Enviar notificação ao dono quando novo pedido é criado
- [x] Suportar pedidos via WhatsApp e balcão

## Imagens dos Doces
- [x] Gerar imagem: Bolo de pote Ninho com brigadeiro
- [x] Gerar imagem: Bolo de pote chocolate com brigadeiro e doce de leite
- [x] Gerar imagem: Doce de leite 200ml
- [x] Gerar imagem: Surpresa de uva

## Testes e Entrega
- [ ] Testar fluxo completo de pedido
- [ ] Testar painel administrativo
- [ ] Verificar responsividade
- [ ] Entregar sistema ao usuário

## Sistema de Avaliações
- [x] Criar tabela de avaliações no banco de dados
- [x] Implementar procedimentos tRPC para criar, listar e moderar avaliações
- [x] Criar componente de avaliação com estrelas e campo de comentário
- [x] Exibir avaliações no cardápio digital
- [x] Adicionar painel de avaliações no admin para moderar comentários
- [x] Testar fluxo completo de avaliações (14 testes passando)

## Mudança de Paleta de Cores
- [x] Mudar cores de rosa para vermelho em todos os componentes
- [x] Atualizar tema global (index.css)
- [x] Atualizar componentes React (Home, Order, Admin, etc)
- [x] Testar responsividade com novas cores
- [x] Entregar ao usuário

## Ajuste de Tom de Cor
- [x] Atualizar cores para tom específico da logo (rosa/vermelho vibrante)
- [x] Testar em todos os componentes
- [x] Entregar ao usuário

## Novo Produto e Correções
- [x] Upload da foto de Surpresa de Morango para S3
- [x] Adicionar produto Surpresa de Morango ao banco de dados
- [x] Corrigir erros de escrita em todo o site ("Pedir" -> "Fazer Pedido")
- [x] Testar e entregar (14 testes passando)

## Reorganização de Nomes de Produtos
- [x] Atualizar nome dos produtos para "Bolo de Pote" com sabor na descrição
- [x] Testar produtos no cardápio (14 testes passando)
- [x] Entregar ao usuário

## Bugs Reportados
- [x] Carrinho não atualiza o valor total ao adicionar produtos (continua em R$ 0) - CORRIGIDO: Adicionada verificação de disponibilidade

## Melhorias de UX e Confiabilidade do Checkout
- [x] Implementar validação em tempo real dos campos (nome, telefone, endereço)
- [x] Melhorar responsividade mobile (botões maiores, textos legíveis)
- [x] Adicionar menu superior com navegação clara (Home • Cardápio • Contato)
- [x] Adicionar footer com informações de contato e política de privacidade
- [x] Adicionar sinais de segurança (cadeado HTTPS, selo de confiança)
- [x] Tornar opções de pagamento mais claras e clicáveis
- [x] Remover indicador de progresso para checkout rápido
- [x] Remover opção de "retirada no balcão"
- [x] Adicionar campos de Bairro e Referência no endereço
- [x] Transformar Order na homepage (layout produtos + carrinho)
- [x] Remover rota /order e páginas desnecessarias
- [x] Testar todas as alterações com vitest

## Melhorias de Apresentação de Produtos
- [x] Aumentar tamanho das fotos dos produtos (48rem)
- [x] Adicionar suporte a múltiplas fotos por produto (até 3 fotos)
- [x] Implementar carrossel com setas de navegação
- [x] Adicionar indicadores de foto (dots) clicáveis
- [x] Adicionar campos imageUrl2 e imageUrl3 no banco de dados
- [x] Testar carrossel com vitest


## Diretrizes de Desenvolvimento
- Revisar estrutura completa antes de editar arquivos
- Usar `edit` action para modificações pontuais, não `write` para recriar
- Manter todas as funcionalidades já corrigidas
- Testar após cada alteração
- Modularizar componentes quando necessário
- Documentar mudanças realizadas

## Ajustes de Layout
- [x] Remover seção "Formas de Pagamento" do footer

## Imagens de Produtos
- [x] Adicionar segunda imagem ao Bolo de Pote (Ninho com brigadeiro)
- [x] Substituir imagem do Produto 4 (Surpresa de Uva)
- [x] Substituir imagem do Produto 3 (Doce de Leite 200ml)
- [x] Substituir primeira imagem do Produto 1 (Bolo de Pote Ninho)
- [x] Substituir imagens do Produto 2 (Bolo de Pote Chocolate) - 2 imagens
- [x] Adicionar segunda imagem ao Produto 4 (Surpresa de Uva)


## Painel Administrativo - Gerenciamento de Produtos
- [x] Criar endpoints tRPC para criar, editar e deletar produtos
- [x] Criar componente ProductManager para gerenciar produtos
- [x] Integrar ProductManager no Admin.tsx
- [x] Upload de imagens (via URL)
- [x] Editar produtos com opção de substituir ou adicionar imagens
- [x] Deletar produtos
- [x] Listar todos os produtos no admin
- [ ] Implementar autenticação por senha para /admin
- [ ] Exibir selo visual de esgotado no site público
- [ ] Desativar botão de adicionar ao carrinho quando esgotado


## Autenticação Segura do Painel Admin
- [x] Criar endpoint tRPC auth.adminLogin (novo, sem alterar rotas existentes)
- [x] Criar página AdminLogin.tsx (novo arquivo, sem modificar Admin.tsx)
- [x] Implementar proteção de rota /admin com token localStorage
- [ ] Adicionar botão logout no painel admin
- [x] Testar autenticação com 4+ testes vitest (18 testes totais passando)
- [x] Criar DATA_PROTECTION.md com regras de integridade

## Regras de Proteção de Dados
- NUNCA sobrescrever imagens de produtos existentes
- NUNCA modificar dados de pedidos anteriores
- NUNCA alterar Admin.tsx diretamente (usar componentes novos)
- NUNCA deletar ou alterar rotas públicas
- SEMPRE usar edições cirúrgicas (edit action) ao invés de recriar arquivos
- SEMPRE testar com vitest antes de commitar


## Sistema de Fallback com WhatsApp
- [x] Criar componente ErrorFallback.tsx (novo arquivo)
- [x] Melhorar ErrorBoundary com fallback WhatsApp
- [x] Testar comportamento de erro com vitest (5 testes adicionais)
- [x] Exibir ícone WhatsApp quando site cai
- [x] Direcionar para WhatsApp da loja em caso de erro (23 testes totais passando)


## Analytics de Erros
- [x] Criar tabela de erros no banco de dados
- [x] Criar endpoint tRPC para registrar erros (errorLogs.log e errorLogs.list)
- [x] Integrar registro de erros no ErrorFallback
- [x] Criar painel de visualização de erros no admin (ErrorLogsPanel.tsx)
- [x] Testar analytics com vitest (5 testes adicionais, 28 testes totais passando)


## Notificação Automática via WhatsApp
- [x] Criar tabela de health checks no banco
- [x] Criar endpoint tRPC para health check (health.check e health.history)
- [x] Criar serviço de monitoramento com cron job (healthMonitor.ts)
- [x] Integrar notificação WhatsApp quando site cai (whatsappNotifier.ts)
- [x] Testar sistema com vitest (5 testes adicionais, 33 testes totais passando)


## Webhooks de Recuperação
- [x] Criar tabela de webhooks no banco
- [x] Criar funções de gerenciamento de webhooks (CRUD)
- [x] Integrar execução de webhooks no healthMonitor
- [x] Criar endpoints tRPC para gerenciar webhooks (list, create, update, delete)
- [x] Criar painel de gerenciamento de webhooks (WebhooksPanel.tsx)
- [x] Testar webhooks com vitest (4 testes, 37 testes totais passando)


## Proteção Contra Tradução Automática
- [x] Adicionar translate="no" em componentes críticos
- [x] Proteger textos em páginas públicas (Home.tsx, Order.tsx)
- [x] Proteger textos no painel admin (Admin.tsx)
- [x] Adicionar useEffect para proteger elementos dinâmicos
- [x] Testar com tradução automática ativada


## Produtos Esgotados
- [x] Criar componente SoldOutBadge com selo visual
- [x] Integrar selo nos cards de produtos (Home.tsx e Order.tsx)
- [x] Desabilitar botão "Adicionar ao Carrinho" quando indisponível
- [x] Adicionar toggle de disponibilidade no painel admin (ProductManager.tsx)
- [x] Testar com vitest (37 testes passando)


## Meus Pedidos - Histórico de Compras
- [x] Criar página MyOrders.tsx com histórico de pedidos
- [x] Adicionar rota /meus-pedidos no App.tsx
- [x] Criar endpoint tRPC para listar pedidos do cliente (getCustomerOrders)
- [x] Adicionar filtros por status (pendente, confirmado, entregue)
- [x] Implementar busca por nome e número do pedido
- [x] Adicionar botão "Repetir Pedido" para adicionar itens ao carrinho
- [x] Testar com vitest (37 testes passando)
