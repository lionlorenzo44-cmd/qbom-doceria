import * as db from "../db";
import type { RecoveryWebhook } from "../../drizzle/schema";

/**
 * Executa um webhook de recuperação
 */
export async function executeWebhook(webhook: RecoveryWebhook): Promise<boolean> {
  if (!webhook.url || webhook.isActive === 0) {
    console.log(`[Webhook] Webhook ${webhook.id} is inactive or missing URL`);
    return false;
  }

  try {
    console.log(`[Webhook] Executing webhook: ${webhook.name} (${webhook.url})`);

    const options: RequestInit = {
      method: webhook.method || "POST",
      headers: {
        "Content-Type": "application/json",
        ...webhook.headers,
      },
    };

    if (webhook.method !== "GET" && webhook.payload) {
      options.body = JSON.stringify(webhook.payload);
    }

    const response = await fetch(webhook.url, options);

    // Registrar execução
    await db.recordWebhookExecution(webhook.id, response.status);

    if (response.ok) {
      console.log(
        `[Webhook] Webhook ${webhook.id} executed successfully (${response.status})`
      );
      return true;
    } else {
      console.warn(
        `[Webhook] Webhook ${webhook.id} returned status ${response.status}`
      );
      return false;
    }
  } catch (error) {
    console.error(`[Webhook] Error executing webhook ${webhook.id}:`, error);
    await db.recordWebhookExecution(webhook.id, 500);
    return false;
  }
}

/**
 * Executa todos os webhooks ativos de recuperação
 */
export async function executeRecoveryWebhooks(): Promise<{
  total: number;
  successful: number;
  failed: number;
}> {
  try {
    console.log("[Webhook] Starting recovery webhooks execution");

    const webhooks = await db.getWebhooks(true);

    if (webhooks.length === 0) {
      console.log("[Webhook] No active webhooks to execute");
      return { total: 0, successful: 0, failed: 0 };
    }

    let successful = 0;
    let failed = 0;

    // Executar webhooks em paralelo com Promise.all
    const results = await Promise.all(
      webhooks.map((webhook) => executeWebhook(webhook))
    );

    results.forEach((result) => {
      if (result) {
        successful++;
      } else {
        failed++;
      }
    });

    console.log(
      `[Webhook] Recovery webhooks execution completed: ${successful}/${webhooks.length} successful`
    );

    return {
      total: webhooks.length,
      successful,
      failed,
    };
  } catch (error) {
    console.error("[Webhook] Error executing recovery webhooks:", error);
    return { total: 0, successful: 0, failed: 0 };
  }
}
