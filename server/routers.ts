import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { notifyOwner } from "./_core/notification";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    adminLogin: publicProcedure
      .input(z.object({ username: z.string(), password: z.string() }))
      .mutation(({ input, ctx }) => {
        const ADMIN_USERNAME = 'Aurora25';
        const ADMIN_PASSWORD = 'Aqua1048';
        
        if (input.username === ADMIN_USERNAME && input.password === ADMIN_PASSWORD) {
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie('admin_session', 'authenticated', { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
          return { success: true };
        }
        throw new Error('Credenciais invalidas');
      }),
    adminLogout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie('admin_session', { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),
  }),

  products: router({
    list: publicProcedure.query(() => db.getActiveProducts()),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getProductById(input.id)),
    toggleAvailability: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        return db.toggleProductAvailability(input.id);
      }),
    listAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      return db.getAllProducts();
    }),
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        price: z.number(),
        imageUrl: z.string().optional(),
        imageUrl2: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        return db.createProduct({
          name: input.name,
          description: input.description,
          price: input.price,
          imageUrl: input.imageUrl,
          imageUrl2: input.imageUrl2,
          isActive: 1,
          isAvailable: 1,
        });
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.number().optional(),
        imageUrl: z.string().optional(),
        imageUrl2: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        const { id, ...updates } = input;
        return db.updateProduct(id, updates);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        return db.deleteProduct(input.id);
      }),
  }),

  orders: router({
    create: publicProcedure
      .input(z.object({
        customerName: z.string(),
        customerPhone: z.string(),
        customerAddress: z.string().optional(),
        totalPrice: z.number(),
        orderType: z.enum(["whatsapp", "balcao"]),
        paymentMethod: z.string().optional(),
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number(),
          priceAtTime: z.number(),
        })),
      }))
      .mutation(async ({ input }) => {
        const orderNumber = `QBD-${Date.now()}`;
        const order = await db.createOrder({
          orderNumber,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          customerAddress: input.customerAddress,
          totalPrice: input.totalPrice,
          orderType: input.orderType,
          paymentMethod: input.paymentMethod,
        });

        if (order.insertId) {
          await db.createOrderItems(
            input.items.map(item => ({
              orderId: Number(order.insertId),
              productId: item.productId,
              quantity: item.quantity,
              priceAtTime: item.priceAtTime,
            }))
          );

          const totalFormatted = (input.totalPrice / 100).toFixed(2);
          await notifyOwner({
            title: `Novo pedido: ${orderNumber}`,
            content: `Cliente: ${input.customerName}\nTelefone: ${input.customerPhone}\nTotal: R$ ${totalFormatted}\nTipo: ${input.orderType === 'whatsapp' ? 'WhatsApp' : 'Balcão'}`,
          });
        }

        return { orderId: order.insertId, orderNumber };
      }),

    list: protectedProcedure.query(() => db.getAllOrders()),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const order = await db.getOrderById(input.id);
        if (!order) return null;
        const items = await db.getOrderItems(input.id);
        return { ...order, items };
      }),

    updateStatus: protectedProcedure
      .input(z.object({ id: z.number(), status: z.enum(["novo", "em_preparo", "entregue", "cancelado"]) }))
      .mutation(({ input }) => db.updateOrderStatus(input.id, input.status)),
  }),

  payments: router({
    create: protectedProcedure
      .input(z.object({
        orderId: z.number(),
        amount: z.number(),
        paymentMethod: z.string(),
      }))
      .mutation(({ input }) => db.createPayment({
        orderId: input.orderId,
        amount: input.amount,
        paymentMethod: input.paymentMethod,
        status: "recebido",
      })),

    getByOrder: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(({ input }) => db.getPaymentsByOrder(input.orderId)),
  }),

  cashRegister: router({
    create: protectedProcedure
      .input(z.object({
        amount: z.number(),
        type: z.enum(["entrada", "saida"]),
        description: z.string(),
        paymentMethod: z.string().optional(),
        orderId: z.number().optional(),
      }))
      .mutation(({ input }) => db.createCashEntry(input)),

    list: protectedProcedure.query(() => db.getCashRegisterEntries()),
  }),

  reviews: router({
    create: publicProcedure
      .input(z.object({
        productId: z.number(),
        customerName: z.string(),
        customerEmail: z.string().email().optional(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await db.createReview({
          productId: input.productId,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          rating: input.rating,
          comment: input.comment,
          isApproved: 0,
        });
        return result;
      }),

    getApproved: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(({ input }) => db.getApprovedReviews(input.productId)),

    getAll: protectedProcedure
      .input(z.object({ productId: z.number().optional() }))
      .query(({ input }) => db.getAllReviews(input.productId)),

    approve: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.approveReview(input.id)),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteReview(input.id)),

    getAverageRating: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(({ input }) => db.getProductAverageRating(input.productId)),
  }),
});

export type AppRouter = typeof appRouter;
