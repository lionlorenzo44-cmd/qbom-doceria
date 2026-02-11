import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "sample-user",
    email: "sample@example.com",
    name: "Sample User",
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

describe("errorLogs", () => {
  it("should log an error", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.errorLogs.log({
      errorMessage: "Test error message",
      errorType: "RuntimeError",
      severity: "medium",
      url: "https://example.com/test",
    });

    expect(result).toBeDefined();
    expect(result?.insertId).toBeGreaterThanOrEqual(0);
  });

  it("should log error with stack trace", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.errorLogs.log({
      errorMessage: "Error with stack",
      errorStack: "Error: Test\n  at test.ts:10",
      errorType: "TypeError",
      severity: "high",
    });

    expect(result).toBeDefined();
  });

  it("should list errors as admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const errors = await caller.errorLogs.list();

    expect(Array.isArray(errors)).toBe(true);
  });

  it("should not allow non-admin to list errors", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.errorLogs.list();
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("Unauthorized");
    }
  });

  it("should log error with default severity", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.errorLogs.log({
      errorMessage: "Error without severity",
    });

    expect(result).toBeDefined();
  });
});
