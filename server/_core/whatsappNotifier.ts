import { ENV } from "./env";

export type WhatsAppMessage = {
  phoneNumber: string;
  message: string;
};

/**
 * Envia notificação via WhatsApp para o número da loja
 * Usa a API do Manus para enviar mensagens
 */
export async function sendWhatsAppNotification(
  phoneNumber: string,
  message: string
): Promise<boolean> {
  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
    console.warn("[WhatsApp] Notification service not configured");
    return false;
  }

  try {
    const endpoint = new URL(
      "webdevtoken.v1.WebDevService/SendWhatsApp",
      ENV.forgeApiUrl.endsWith("/") ? ENV.forgeApiUrl : `${ENV.forgeApiUrl}/`
    ).toString();

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1",
      },
      body: JSON.stringify({
        phoneNumber: sanitizePhoneNumber(phoneNumber),
        message: message.substring(0, 1000), // Limitar a 1000 caracteres
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[WhatsApp] Failed to send message (${response.status} ${response.statusText})${
          detail ? `: ${detail}` : ""
        }`
      );
      return false;
    }

    console.log("[WhatsApp] Message sent successfully");
    return true;
  } catch (error) {
    console.error("[WhatsApp] Error sending notification:", error);
    return false;
  }
}

/**
 * Sanitiza número de telefone para formato WhatsApp (apenas dígitos)
 */
function sanitizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Envia alerta de site fora do ar via WhatsApp
 */
export async function notifyDowntime(
  phoneNumber: string,
  errorMessage?: string
): Promise<boolean> {
  const message = errorMessage
    ? `⚠️ ALERTA: Seu site está fora do ar!\n\nErro: ${errorMessage}\n\nVerifique o servidor imediatamente.`
    : `⚠️ ALERTA: Seu site está fora do ar!\n\nVerifique o servidor imediatamente.`;

  return sendWhatsAppNotification(phoneNumber, message);
}

/**
 * Envia confirmação de que site voltou online
 */
export async function notifyRecovery(
  phoneNumber: string,
  responseTime?: number
): Promise<boolean> {
  const message = responseTime
    ? `✅ Seu site voltou online!\n\nTempo de resposta: ${responseTime}ms`
    : `✅ Seu site voltou online!`;

  return sendWhatsAppNotification(phoneNumber, message);
}
