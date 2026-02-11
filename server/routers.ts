import { COOKIE_NAME } from "../shared/const";
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
        imageUrl3: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        return db.createProduct({
          name: input.name,
          description: input.description,
          price: Math.round(input.price * 100),
          imageUrl: input.imageUrl,
          imageUrl2: input.imageUrl2,
          imageUrl3: input.imageUrl3,
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
        imageUrl3: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        const updates: any = {};
        if (input.name) updates.name = input.name;
        if (input.description !== undefined) updates.description = input.description;
        if (input.price) updates.price = Math.round(input.price * 100);
        if (input.imageUrl !== undefined) updates.imageUrl = input.imageUrl;
        if (input.imageUrl2 !== undefined) updates.imageUrl2 = input.imageUrl2;
        if (input.imageUrl3 !== undefined) updates.imageUrl3 = input.imageUrl3;
        return db.updateProduct(input.id, updates);
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
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      return db.getAllOrders();
    }),
    create: publicProcedure
      .input(z.object({
        customerName: z.string(),
        customerPhone: z.string(),
        customerAddress: z.string().optional(),
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number(),
          priceAtTime: z.number(),
        })),
        paymentMethod: z.string(),
        totalPrice: z.number(),
      }))
      .mutation(async ({ input }) => {
        const orderNumber = `ORD-${Date.now()}`;
        const order = await db.createOrder({
          orderNumber,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          customerAddress: input.customerAddress,
          status: 'novo',
          totalPrice: Math.round(input.totalPrice * 100),
          paymentMethod: input.paymentMethod,
        });

        await db.createOrderItems(
          input.items.map(item => ({
            orderId: order.insertId,
            productId: item.productId,
            quantity: item.quantity,
            priceAtTime: item.priceAtTime,
          }))
        );

        await notifyOwner({
          title: 'Novo Pedido Recebido',
          content: `Novo pedido de ${input.customerName} - R$ ${(input.totalPrice).toFixed(2)}`,
        });

        return order;
      }),
    updateStatus: protectedProcedure
      .input(z.object({ id: z.number(), status: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        return db.updateOrderStatus(input.id, input.status);
      }),
    getCustomerOrders: publicProcedure
      .input(z.object({ customerPhone: z.string() }).optional())
      .query(async ({ input }) => {
        const phone = input?.customerPhone || '';
        if (!phone) {
          return [];
        }
        return db.getCustomerOrders(phone);
      }),
    repeatOrder: publicProcedure
      .input(z.object({ orderId: z.number(), items: z.array(z.any()).optional() }))
      .mutation(async ({ input }) => {
        return { success: true, orderId: input.orderId };
      }),
  }),

  payments: router({
    create: protectedProcedure
      .input(z.object({
        orderId: z.number(),
        amount: z.number(),
        paymentMethod: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        return db.createPayment({
          orderId: input.orderId,
          amount: input.amount,
          paymentMethod: input.paymentMethod,
          status: 'recebido',
        });
      }),
  }),

  cashRegister: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      return db.getCashRegisterEntries();
    }),
    create: protectedProcedure
      .input(z.object({
        amount: z.number(),
        type: z.enum(['entrada', 'saida']),
        description: z.string(),
        paymentMethod: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        return db.createCashEntry({
          amount: input.amount,
          type: input.type,
          description: input.description,
          paymentMethod: input.paymentMethod,
        });
      }),
  }),

  reviews: router({
    create: publicProcedure
      .input(z.object({
        productId: z.number(),
        customerName: z.string(),
        customerEmail: z.string().optional(),
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

  errorLogs: router({
    log: publicProcedure
      .input(z.object({
        errorMessage: z.string(),
        errorStack: z.string().optional(),
        errorType: z.string().optional(),
        userAgent: z.string().optional(),
        url: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.logError({
          errorMessage: input.errorMessage,
          errorStack: input.errorStack,
          errorType: input.errorType || 'unknown',
          userAgent: input.userAgent,
          url: input.url,
          severity: 'medium',
          isResolved: 0,
        });
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      return db.getErrorLogs(100);
    }),
  }),

  health: router({
    check: publicProcedure.query(async () => {
      const health = await db.getLatestHealthCheck();
      return {
        status: health?.status || 'online',
        responseTime: health?.responseTime,
        isAlertActive: health?.isAlertActive || 0,
        lastUpdated: health?.updatedAt,
      };
    }),

    history: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      return db.getHealthCheckHistory(50);
    }),
  }),

  webhooks: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.user?.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        return db.getWebhooks(false);
      }),

      create: protectedProcedure
        .input(z.object({
          name: z.string().min(1),
          url: z.string().url(),
          method: z.enum(['GET', 'POST', 'PUT']).default('POST'),
        }))
        .mutation(async ({ input, ctx }) => {
          if (ctx.user?.role !== 'admin') {
            throw new Error('Unauthorized');
          }
          return db.createWebhook(input);
        }),

      update: protectedProcedure
        .input(z.object({
          id: z.number(),
          name: z.string().optional(),
          url: z.string().url().optional(),
          method: z.enum(['GET', 'POST', 'PUT']).optional(),
          isActive: z.number().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          if (ctx.user?.role !== 'admin') {
            throw new Error('Unauthorized');
          }
          const { id, ...data } = input;
          return db.updateWebhook(id, data);
        }),

      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input, ctx }) => {
          if (ctx.user?.role !== 'admin') {
            throw new Error('Unauthorized');
          }
          return db.deleteWebhook(input.id);
        }),
    }),
});

export type AppRouter = typeof appRouter;
