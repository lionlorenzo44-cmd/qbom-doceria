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
  }),

  products: router({
    list: publicProcedure.query(() => db.getActiveProducts()),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getProductById(input.id)),
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
});

export type AppRouter = typeof appRouter;
