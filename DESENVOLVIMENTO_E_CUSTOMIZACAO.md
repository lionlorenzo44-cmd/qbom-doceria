# 💻 Guia de Desenvolvimento e Customização - QBom Doceria

---

## 🎨 Customizações Visuais

### Cores e Tema

**Arquivo**: `client/src/index.css`

```css
/* Cores principais */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.6%;
    --primary: 0 84.2% 60.2%;  /* Vermelho */
    --primary-foreground: 0 0% 100%;
    --secondary: 0 0% 96.1%;
    --accent: 0 84.2% 60.2%;   /* Vermelho */
  }
}
```

**Para mudar cores**:
1. Edite os valores RGB/HSL
2. Teste com `pnpm dev`
3. Commit e deploy

### Logo e Favicon

**Logo**: `client/public/logo.svg`  
**Favicon**: `client/public/favicon.ico`

Para mudar:
1. Substitua os arquivos em `client/public/`
2. Atualize referências em `client/index.html`
3. Limpe cache do navegador

### Fontes

**Arquivo**: `client/index.html`

```html
<!-- Adicionar Google Font -->
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
```

Depois em `client/src/index.css`:
```css
@layer base {
  body {
    font-family: 'Poppins', sans-serif;
  }
}
```

---

## 🛍️ Adicionar Novos Produtos

### Via Painel Admin

1. Acesse: `https://seu-dominio.com/admin`
2. Login: `Aurora25` / `Aqua1048`
3. Clique em "Novo Produto"
4. Preencha:
   - Nome
   - Descrição
   - Preço (em reais)
   - Imagens (URLs)
5. Clique em "Salvar"

### Via SQL Direto

```sql
INSERT INTO products (name, description, price, imageUrl, isActive, isAvailable)
VALUES (
  'Bolo de Pote Ninho',
  'Delicioso bolo de pote com leite ninho cremoso e brigadeiro caseiro',
  2500,  -- R$ 25.00
  'https://exemplo.com/imagem.jpg',
  1,
  1
);
```

### Estrutura de Produto

```typescript
interface Product {
  id: number;
  name: string;              // Nome do produto
  description: string;       // Descrição
  price: number;             // Preço em centavos
  imageUrl: string;          // Imagem principal
  imageUrl2?: string;        // Imagem secundária
  imageUrl3?: string;        // Imagem terciária
  isActive: boolean;         // Ativo no catálogo
  isAvailable: boolean;      // Disponível para compra
  createdAt: Date;
}
```

---

## 📝 Adicionar Novas Funcionalidades

### Exemplo: Adicionar Campo de Cupom de Desconto

#### 1. Atualizar Schema

**Arquivo**: `drizzle/schema.ts`

```typescript
export const orders = mysqlTable('orders', {
  // ... campos existentes ...
  couponCode: text('coupon_code'),
  discountAmount: int('discount_amount').default(0),
});
```

#### 2. Gerar Migração

```bash
pnpm drizzle-kit generate
```

#### 3. Executar Migração

```bash
pnpm drizzle-kit migrate
```

#### 4. Atualizar Banco de Dados

Use a interface do Manus ou execute o SQL gerado.

#### 5. Atualizar Tipos

**Arquivo**: `server/db.ts`

```typescript
export async function createOrder(order: InsertOrder & { couponCode?: string; discountAmount?: number }) {
  // ... implementação ...
}
```

#### 6. Atualizar Procedure

**Arquivo**: `server/routers.ts`

```typescript
orders: router({
  create: publicProcedure
    .input(z.object({
      // ... campos existentes ...
      couponCode: z.string().optional(),
      discountAmount: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      // ... implementação ...
    }),
}),
```

#### 7. Atualizar UI

**Arquivo**: `client/src/pages/Home.tsx`

```typescript
const [couponCode, setCouponCode] = useState("");

// No formulário:
<Input
  placeholder="Código do cupom"
  value={couponCode}
  onChange={(e) => setCouponCode(e.target.value)}
/>

// Ao enviar:
await createOrderMutation.mutateAsync({
  // ... dados existentes ...
  couponCode,
  discountAmount: calculateDiscount(couponCode),
});
```

#### 8. Testar

```bash
pnpm dev
# Teste a nova funcionalidade
```

#### 9. Commit e Deploy

```bash
git add .
git commit -m "Adicionar suporte a cupom de desconto"
git push origin main
```

---

## 🔌 Integrar APIs Externas

### Exemplo: Integrar com Serviço de SMS

#### 1. Instalar Dependência

```bash
pnpm add twilio
```

#### 2. Criar Helper

**Arquivo**: `server/_core/sms.ts`

```typescript
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function sendSMS(phoneNumber: string, message: string) {
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('SMS Error:', error);
    throw error;
  }
}
```

#### 3. Usar na Procedure

**Arquivo**: `server/routers.ts`

```typescript
import { sendSMS } from './_core/sms';

orders: router({
  create: publicProcedure
    .input(z.object({
      // ... campos ...
    }))
    .mutation(async ({ input }) => {
      const order = await db.createOrder({...});
      
      // Enviar SMS
      await sendSMS(
        input.customerPhone,
        `Pedido confirmado! Número: ${order.orderNumber}`
      );
      
      return order;
    }),
}),
```

#### 4. Adicionar Variáveis de Ambiente

```env
TWILIO_ACCOUNT_SID=seu_sid
TWILIO_AUTH_TOKEN=seu_token
TWILIO_PHONE_NUMBER=+55xxxx
```

---

## 🧪 Testes

### Executar Testes

```bash
pnpm test
```

### Criar Novo Teste

**Arquivo**: `server/minha-funcionalidade.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { minhaFuncao } from './minha-funcionalidade';

describe('Minha Funcionalidade', () => {
  it('deve fazer algo', () => {
    const resultado = minhaFuncao();
    expect(resultado).toBe(true);
  });
});
```

### Exemplo: Teste de Criação de Pedido

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as db from './db';

describe('Order Creation', () => {
  it('should create order with valid data', async () => {
    const order = await db.createOrder({
      orderNumber: 'ORD-TEST-123',
      customerName: 'João Silva',
      customerPhone: '71999999999',
      customerAddress: 'Rua Teste, 123',
      status: 'novo',
      totalPrice: 5000,
      paymentMethod: 'dinheiro',
    });

    expect(order).toBeDefined();
    expect(order.orderNumber).toBe('ORD-TEST-123');
  });

  it('should fail with invalid data', async () => {
    expect(async () => {
      await db.createOrder({} as any);
    }).rejects.toThrow();
  });
});
```

---

## 🔐 Segurança

### Validação de Entrada

Sempre valide dados no backend:

```typescript
import { z } from 'zod';

const orderSchema = z.object({
  customerName: z.string().min(3).max(255),
  customerPhone: z.string().regex(/^\d{10,}$/),
  totalPrice: z.number().positive(),
});

// Usar em procedure
orders: router({
  create: publicProcedure
    .input(orderSchema)
    .mutation(async ({ input }) => {
      // input já foi validado
    }),
}),
```

### Proteção contra SQL Injection

✅ **Usar Drizzle ORM** (já faz isso):
```typescript
db.select().from(products).where(eq(products.id, id));
```

❌ **Nunca fazer**:
```typescript
db.raw(`SELECT * FROM products WHERE id = ${id}`);
```

### Rate Limiting

Implementar rate limiting para APIs públicas:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições
});

app.use('/api/trpc', limiter);
```

---

## 📱 Responsividade

### Breakpoints Tailwind

```css
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Exemplo de Layout Responsivo

```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>
```

---

## 🚀 Performance

### Lazy Loading de Imagens

```typescript
<img
  src={imageUrl}
  alt="Produto"
  loading="lazy"
  className="w-full h-auto"
/>
```

### Code Splitting

```typescript
import { lazy, Suspense } from 'react';

const AdminPanel = lazy(() => import('./pages/AdminPanel'));

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <AdminPanel />
    </Suspense>
  );
}
```

### Otimizar Bundle

```bash
# Analisar bundle
pnpm build --analyze

# Remover dependências não usadas
pnpm prune
```

---

## 📚 Recursos Úteis

- [Documentação tRPC](https://trpc.io)
- [Documentação Drizzle ORM](https://orm.drizzle.team)
- [Documentação Tailwind CSS](https://tailwindcss.com)
- [Documentação shadcn/ui](https://ui.shadcn.com)
- [Documentação React](https://react.dev)

---

**Última atualização**: 13 de Fevereiro de 2026  
**Versão**: 22028e59
