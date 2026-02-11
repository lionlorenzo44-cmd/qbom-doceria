import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, products, orders, orderItems, payments, cashRegister, InsertOrder, InsertOrderItem, InsertPayment, InsertCashRegister, InsertReview, reviews, InsertProduct, errorLogs, InsertErrorLog, healthChecks, InsertHealthCheck, recoveryWebhooks, InsertRecoveryWebhook, RecoveryWebhook } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
import { Order } from "../drizzle/schema";

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getActiveProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.isActive, 1));
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createOrder(order: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.insert(orders).values(order) as any;
  return { insertId: result.insertId || 0 };
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(orders.createdAt);
}

export async function updateOrderStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.update(orders).set({ status: status as any }).where(eq(orders.id, id));
}

export async function createOrderItems(items: InsertOrderItem[]) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.insert(orderItems).values(items);
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function createPayment(payment: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.insert(payments).values(payment);
}

export async function getPaymentsByOrder(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payments).where(eq(payments.orderId, orderId));
}

export async function createCashEntry(entry: InsertCashRegister) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.insert(cashRegister).values(entry);
}

export async function getCashRegisterEntries() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cashRegister).orderBy(cashRegister.createdAt);
}

// Reviews functions

export async function createReview(review: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.insert(reviews).values(review) as any;
  return { insertId: result.insertId || 0 };
}

export async function getApprovedReviews(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews).where(eq(reviews.productId, productId) && eq(reviews.isApproved, 1));
}

export async function getAllReviews(productId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (productId) {
    return db.select().from(reviews).where(eq(reviews.productId, productId));
  }
  return db.select().from(reviews);
}

export async function approveReview(reviewId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.update(reviews).set({ isApproved: 1 }).where(eq(reviews.id, reviewId));
}

export async function deleteReview(reviewId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.delete(reviews).where(eq(reviews.id, reviewId));
}

export async function getProductAverageRating(productId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(reviews).where(eq(reviews.productId, productId) && eq(reviews.isApproved, 1));
  if (result.length === 0) return 0;
  const sum = result.reduce((acc: number, r: any) => acc + r.rating, 0);
  return Math.round((sum / result.length) * 10) / 10;
}

export async function toggleProductAvailability(productId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const product = await getProductById(productId);
  if (!product) throw new Error('Product not found');
  
  const newAvailability = product.isAvailable === 1 ? 0 : 1;
  return db.update(products).set({ isAvailable: newAvailability }).where(eq(products.id, productId));
}

export async function createProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.insert(products).values(product) as any;
  return { insertId: result.insertId || 0 };
}

export async function updateProduct(id: number, updates: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.update(products).set(updates).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.delete(products).where(eq(products.id, id));
}

export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products);
}


// Error Logs
export async function logError(errorData: InsertErrorLog) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot log error: database not available");
    return null;
  }
  
  try {
    const result = await db.insert(errorLogs).values(errorData) as any;
    return { insertId: result.insertId || 0 };
  } catch (error) {
    console.error("[Database] Failed to log error:", error);
    return null;
  }
}

export async function getErrorLogs(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db.select().from(errorLogs).orderBy((t) => t.createdAt).limit(limit);
  } catch (error) {
    console.error("[Database] Failed to get error logs:", error);
    return [];
  }
}

export async function getUnresolvedErrors() {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db.select().from(errorLogs).where(eq(errorLogs.isResolved, 0));
  } catch (error) {
    console.error("[Database] Failed to get unresolved errors:", error);
    return [];
  }
}

export async function markErrorAsResolved(errorId: number, notes?: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  return db.update(errorLogs)
    .set({ 
      isResolved: 1, 
      resolvedAt: new Date(),
      notes: notes || null
    })
    .where(eq(errorLogs.id, errorId));
}

export async function deleteErrorLog(errorId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  return db.delete(errorLogs).where(eq(errorLogs.id, errorId));
}


// Health Checks
export async function getLatestHealthCheck() {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.select().from(healthChecks).orderBy((t) => t.id).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get health check:", error);
    return null;
  }
}

export async function updateHealthCheck(status: 'online' | 'offline', responseTime?: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update health check: database not available");
    return null;
  }
  
  try {
    const latest = await getLatestHealthCheck();
    
    if (!latest) {
      // Criar primeiro registro
      const result = await db.insert(healthChecks).values({
        status,
        responseTime,
        isAlertActive: status === 'offline' ? 1 : 0,
      }) as any;
      return { insertId: result.insertId || 0 };
    }
    
    // Atualizar registro existente
    return db.update(healthChecks)
      .set({ 
        status, 
        responseTime,
        isAlertActive: status === 'offline' ? 1 : 0,
        updatedAt: new Date(),
      })
      .where(eq(healthChecks.id, latest.id));
  } catch (error) {
    console.error("[Database] Failed to update health check:", error);
    return null;
  }
}

export async function recordAlertSent() {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const latest = await getLatestHealthCheck();
    if (!latest) return null;
    
    return db.update(healthChecks)
      .set({ 
        lastAlertSent: new Date(),
        alertCount: (latest.alertCount || 0) + 1,
      })
      .where(eq(healthChecks.id, latest.id));
  } catch (error) {
    console.error("[Database] Failed to record alert:", error);
    return null;
  }
}

export async function getHealthCheckHistory(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db.select().from(healthChecks).orderBy((t) => t.createdAt).limit(limit);
  } catch (error) {
    console.error("[Database] Failed to get health check history:", error);
    return [];
  }
}


// Recovery Webhooks
export async function createWebhook(data: InsertRecoveryWebhook) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.insert(recoveryWebhooks).values(data) as any;
    return { insertId: result.insertId || 0 };
  } catch (error) {
    console.error("[Database] Failed to create webhook:", error);
    return null;
  }
}

export async function getWebhooks(activeOnly: boolean = true) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    if (activeOnly) {
      return await db.select().from(recoveryWebhooks).where(eq(recoveryWebhooks.isActive, 1));
    }
    return await db.select().from(recoveryWebhooks);
  } catch (error) {
    console.error("[Database] Failed to get webhooks:", error);
    return [];
  }
}

export async function getWebhookById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.select().from(recoveryWebhooks).where(eq(recoveryWebhooks.id, id));
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get webhook:", error);
    return null;
  }
}

export async function updateWebhook(id: number, data: Partial<InsertRecoveryWebhook>) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    return await db.update(recoveryWebhooks)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(recoveryWebhooks.id, id));
  } catch (error) {
    console.error("[Database] Failed to update webhook:", error);
    return null;
  }
}

export async function deleteWebhook(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    return await db.delete(recoveryWebhooks).where(eq(recoveryWebhooks.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete webhook:", error);
    return null;
  }
}

export async function recordWebhookExecution(id: number, status: number) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const webhook = await getWebhookById(id);
    if (!webhook) return null;
    
    const failureCount = status >= 400 ? (webhook.failureCount || 0) + 1 : 0;
    
    return await db.update(recoveryWebhooks)
      .set({
        lastExecuted: new Date(),
        lastStatus: status,
        failureCount,
      })
      .where(eq(recoveryWebhooks.id, id));
  } catch (error) {
    console.error("[Database] Failed to record webhook execution:", error);
    return null;
  }
}
