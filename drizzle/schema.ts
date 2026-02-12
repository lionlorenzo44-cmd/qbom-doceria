import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).$type<string>().notNull().unique(),
  name: text("name").$type<string | null>(),
  email: varchar("email", { length: 320 }).$type<string | null>(),
  loginMethod: varchar("loginMethod", { length: 64 }).$type<string | null>(),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).$type<string>().notNull(),
  description: text("description").$type<string | null>(),
  price: int("price").notNull(), // Preço em centavos (ex: 1200 = R$ 12,00)
  imageUrl: text("imageUrl").$type<string | null>(),
  imageUrl2: text("imageUrl2").$type<string | null>(), // Segunda foto do produto
  imageUrl3: text("imageUrl3").$type<string | null>(), // Terceira foto do produto
  isActive: int("isActive").default(1).notNull(), // 1 = ativo, 0 = inativo
  isAvailable: int("isAvailable").default(1).notNull(), // 1 = disponivel, 0 = esgotado
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).$type<string>().notNull().unique(),
  customerName: varchar("customerName", { length: 255 }).$type<string>().notNull(),
  customerPhone: varchar("customerPhone", { length: 20 }).$type<string>().notNull(),
  customerAddress: text("customerAddress").$type<string | null>(),
  totalPrice: int("totalPrice").notNull(), // em centavos
  status: mysqlEnum("status", ["novo", "em_preparo", "entregue", "cancelado"]).default("novo").notNull(),
  orderType: mysqlEnum("orderType", ["whatsapp", "balcao"]).default("whatsapp").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }).$type<string | null>(),
  notes: text("notes").$type<string | null>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").notNull(),
  priceAtTime: int("priceAtTime").notNull(), // Preço do produto no momento da compra
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  amount: int("amount").notNull(), // em centavos
  paymentMethod: varchar("paymentMethod", { length: 50 }).$type<string>().notNull(),
  status: mysqlEnum("status", ["pendente", "recebido", "cancelado"]).default("pendente").notNull(),
  notes: text("notes").$type<string | null>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

export const cashRegister = mysqlTable("cashRegister", {
  id: int("id").autoincrement().primaryKey(),
  amount: int("amount").notNull(), // em centavos
  type: mysqlEnum("type", ["entrada", "saida"]).notNull(),
  description: varchar("description", { length: 255 }).$type<string>().notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }).$type<string | null>(),
  orderId: int("orderId"), // Referência ao pedido, se aplicável
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CashRegister = typeof cashRegister.$inferSelect;
export type InsertCashRegister = typeof cashRegister.$inferInsert;

export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  customerName: varchar("customerName", { length: 255 }).$type<string>().notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).$type<string | null>(),
  rating: int("rating").notNull(), // 1-5 estrelas
  comment: text("comment").$type<string | null>(),
  isApproved: int("isApproved").default(0).notNull(), // 0 = pendente, 1 = aprovado
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

export const errorLogs = mysqlTable("errorLogs", {
  id: int("id").autoincrement().primaryKey(),
  errorMessage: text("errorMessage").$type<string>().notNull(),
  errorStack: text("errorStack").$type<string | null>(),
  errorType: varchar("errorType", { length: 100 }).$type<string>().default("unknown").notNull(),
  userAgent: text("userAgent").$type<string | null>(),
  url: text("url").$type<string | null>(),
  ipAddress: varchar("ipAddress", { length: 45 }).$type<string | null>(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  isResolved: int("isResolved").default(0).notNull(), // 0 = não resolvido, 1 = resolvido
  resolvedAt: timestamp("resolvedAt"),
  notes: text("notes").$type<string | null>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ErrorLog = typeof errorLogs.$inferSelect;
export type InsertErrorLog = typeof errorLogs.$inferInsert;


export const healthChecks = mysqlTable("healthChecks", {
  id: int("id").autoincrement().primaryKey(),
  status: mysqlEnum("status", ["online", "offline"]).default("online").notNull(),
  responseTime: int("responseTime"), // em milissegundos
  lastAlertSent: timestamp("lastAlertSent"),
  alertCount: int("alertCount").default(0).notNull(),
  isAlertActive: int("isAlertActive").default(0).notNull(), // 1 = alerta ativo, 0 = resolvido
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HealthCheck = typeof healthChecks.$inferSelect;
export type InsertHealthCheck = typeof healthChecks.$inferInsert;


export const recoveryWebhooks = mysqlTable("recoveryWebhooks", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).$type<string>().notNull(),
  url: varchar("url", { length: 2048 }).$type<string>().notNull(),
  method: mysqlEnum("method", ["GET", "POST", "PUT"]).default("POST").notNull(),
  headers: json("headers").$type<Record<string, string>>(),
  payload: json("payload").$type<Record<string, any>>(),
  isActive: int("isActive").default(1).notNull(),
  lastExecuted: timestamp("lastExecuted"),
  lastStatus: int("lastStatus"), // HTTP status code
  failureCount: int("failureCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RecoveryWebhook = typeof recoveryWebhooks.$inferSelect;
export type InsertRecoveryWebhook = typeof recoveryWebhooks.$inferInsert;
