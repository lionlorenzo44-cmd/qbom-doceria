import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: int("price").notNull(), // Preço em centavos (ex: 1200 = R$ 12,00)
  imageUrl: text("imageUrl"),
  isActive: int("isActive").default(1).notNull(), // 1 = ativo, 0 = inativo
  isAvailable: int("isAvailable").default(1).notNull(), // 1 = disponivel, 0 = esgotado
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 20 }).notNull(),
  customerAddress: text("customerAddress"),
  totalPrice: int("totalPrice").notNull(), // em centavos
  status: mysqlEnum("status", ["novo", "em_preparo", "entregue", "cancelado"]).default("novo").notNull(),
  orderType: mysqlEnum("orderType", ["whatsapp", "balcao"]).default("whatsapp").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }), // dinheiro, pix, cartao, etc
  notes: text("notes"),
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
  paymentMethod: varchar("paymentMethod", { length: 50 }).notNull(),
  status: mysqlEnum("status", ["pendente", "recebido", "cancelado"]).default("pendente").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

export const cashRegister = mysqlTable("cashRegister", {
  id: int("id").autoincrement().primaryKey(),
  amount: int("amount").notNull(), // em centavos
  type: mysqlEnum("type", ["entrada", "saida"]).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  orderId: int("orderId"), // Referência ao pedido, se aplicável
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CashRegister = typeof cashRegister.$inferSelect;
export type InsertCashRegister = typeof cashRegister.$inferInsert;

export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }),
  rating: int("rating").notNull(), // 1-5 estrelas
  comment: text("comment"),
  isApproved: int("isApproved").default(0).notNull(), // 0 = pendente, 1 = aprovado
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;