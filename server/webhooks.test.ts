import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
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
      cookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "user",
    email: "user@example.com",
    name: "User",
    loginMethod: "manus",
    role: "user",
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
      cookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("webhooks", () => {
  it("should create a webhook as admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.webhooks.create({
      name: "Clear Cache",
      url: "https://example.com/clear-cache",
      method: "POST",
    });

    expect(result).toBeDefined();
    expect(result?.insertId).toBeGreaterThanOrEqual(0);
  });

  it("should list webhooks as admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const webhooks = await caller.webhooks.list();

    expect(Array.isArray(webhooks)).toBe(true);
  });

  it("should not allow non-admin to create webhook", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.webhooks.create({
        name: "Test",
        url: "https://example.com",
        method: "POST",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("Unauthorized");
    }
  });

  it("should not allow non-admin to list webhooks", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.webhooks.list();
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("Unauthorized");
    }
  });


});
