import * as db from "../db";
import { notifyOwner } from "./notification";
import { notifyDowntime, notifyRecovery } from "./whatsappNotifier";
import { executeRecoveryWebhooks } from "./webhookExecutor";

const HEALTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutos
const ALERT_COOLDOWN = 15 * 60 * 1000; // 15 minutos entre alertas

let lastAlertTime = 0;
let monitoringInterval: NodeJS.Timeout | null = null;

export async function startHealthMonitoring() {
  if (monitoringInterval) {
    console.log("[Health Monitor] Already running");
    return;
  }

  console.log("[Health Monitor] Starting health checks every 5 minutes");

  // Executar primeira verificação imediatamente
  await performHealthCheck();

  // Executar verificações periódicas
  monitoringInterval = setInterval(async () => {
    await performHealthCheck();
  }, HEALTH_CHECK_INTERVAL);
}

export async function stopHealthMonitoring() {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
    console.log("[Health Monitor] Stopped");
  }
}

export async function performHealthCheck() {
  try {
    const startTime = Date.now();

    // Verificar se o banco de dados está acessível
    const healthCheck = await db.getLatestHealthCheck();
    const responseTime = Date.now() - startTime;

    const status = "online";

    // Atualizar status
    await db.updateHealthCheck(status, responseTime);

    // Se estava offline, notificar que voltou online
    if (healthCheck && healthCheck.status === "offline") {
      console.log("[Health Monitor] Site voltou online!");
      const phoneNumber = process.env.SHOP_WHATSAPP_NUMBER || "5571992180210";
      await notifyRecovery(phoneNumber, responseTime);
      await notifyOwner({
        title: "✅ Site Voltou Online",
        content: `Seu site está funcionando normalmente. Tempo de resposta: ${responseTime}ms`,
      });
      
      // Executar webhooks de recuperação
      console.log("[Health Monitor] Executing recovery webhooks");
      const webhookResults = await executeRecoveryWebhooks();
      console.log(`[Health Monitor] Recovery webhooks: ${webhookResults.successful}/${webhookResults.total} successful`);
    }

    console.log(
      `[Health Monitor] Check OK - Status: ${status}, Response time: ${responseTime}ms`
    );
  } catch (error) {
    console.error("[Health Monitor] Health check failed:", error);

    // Registrar como offline
    await db.updateHealthCheck("offline");

    // Enviar alerta se passou o cooldown
    const now = Date.now();
    if (now - lastAlertTime > ALERT_COOLDOWN) {
      lastAlertTime = now;

      console.log("[Health Monitor] Sending alert to owner");
      const phoneNumber = process.env.SHOP_WHATSAPP_NUMBER || "5571992180210";
      const errorMsg = error instanceof Error ? error.message : "Erro desconhecido";
      await notifyDowntime(phoneNumber, errorMsg);
      await notifyOwner({
        title: "⚠️ Site Fora do Ar",
        content:
          "Seu site está fora do ar. Por favor, verifique o servidor e corrija o problema.",
      });

      // Registrar alerta no banco
      await db.recordAlertSent();
    }
  }
}

// Iniciar monitoramento quando o servidor inicia
if (process.env.NODE_ENV === "production" || process.env.ENABLE_HEALTH_MONITOR === "true") {
  startHealthMonitoring().catch(console.error);
}
