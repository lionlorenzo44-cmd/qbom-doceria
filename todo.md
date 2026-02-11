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
