import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

function createPublicContext(): TrpcContext {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("products", () => {
  it("should list active products", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const products = await caller.products.list();

    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
    expect(products[0]).toHaveProperty("name");
    expect(products[0]).toHaveProperty("price");
  });

  it("should get product by id", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const products = await caller.products.list();
    if (products.length === 0) {
      expect(true).toBe(true);
      return;
    }

    const product = await caller.products.getById({ id: products[0].id });

    expect(product).toBeDefined();
    expect(product?.name).toBe(products[0].name);
  });
});

describe("orders", () => {
  it("should create an order", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.orders.create({
      customerName: "Test Customer",
      customerPhone: "11999999999",
      customerAddress: "Rua Teste, 123",
      totalPrice: 2400,
      paymentMethod: "dinheiro",
      items: [
        {
          productId: 1,
          quantity: 2,
          priceAtTime: 1200,
        },
      ],
    });

    expect(result).toHaveProperty("insertId");
    expect(result.insertId).toBeGreaterThanOrEqual(0);
  });

  it("should list orders as admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const orders = await caller.orders.list();

    expect(Array.isArray(orders)).toBe(true);
  });

  it("should update order status as admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const orders = await caller.orders.list();
    if (orders.length === 0) {
      expect(true).toBe(true);
      return;
    }

    const result = await caller.orders.updateStatus({
      id: orders[0].id,
      status: "em_preparo",
    });

    expect(result).toBeDefined();
  });
});

describe("payments", () => {
  it("should create a payment as admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.payments.create({
      orderId: 1,
      amount: 1200,
      paymentMethod: "dinheiro",
    });

    expect(result).toBeDefined();
  });
});

describe("cashRegister", () => {
  it("should create a cash entry as admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cashRegister.create({
      amount: 5000,
      type: "entrada",
      description: "Venda de doces",
      paymentMethod: "dinheiro",
    });

    expect(result).toBeDefined();
  });

  it("should list cash entries as admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const entries = await caller.cashRegister.list();

    expect(Array.isArray(entries)).toBe(true);
  });
});


describe("reviews", () => {
  it("should create a review", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.reviews.create({
      productId: 1,
      customerName: "Test Customer",
      customerEmail: "test@example.com",
      rating: 5,
      comment: "Muito bom!",
    });

    expect(result).toHaveProperty("insertId");
  });

  it("should get approved reviews", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const reviews = await caller.reviews.getApproved({ productId: 1 });

    expect(Array.isArray(reviews)).toBe(true);
  });

  it("should get average rating", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const rating = await caller.reviews.getAverageRating({ productId: 1 });

    expect(typeof rating).toBe("number");
    expect(rating).toBeGreaterThanOrEqual(0);
    expect(rating).toBeLessThanOrEqual(5);
  });

  it("should approve a review as admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.reviews.approve({ id: 1 });

    expect(result).toBeDefined();
  });

  it("should delete a review as admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.reviews.delete({ id: 1 });

    expect(result).toBeDefined();
  });
});
