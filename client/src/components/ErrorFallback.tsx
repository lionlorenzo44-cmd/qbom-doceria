import { Heart, MessageCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
}

export default function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const whatsappNumber = "5571992180210";
  const whatsappMessage = encodeURIComponent(
    "Olá Qbom Doceria! Estou tendo problemas para acessar o site. Pode me ajudar?"
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-red-600 fill-red-600" />
            <h1 className="text-2xl font-bold text-red-700">Qbom Doceria</h1>
          </div>
        </div>

        {/* Ícone de erro */}
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </div>
        </div>

        {/* Mensagem de erro */}
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Oops! Algo deu errado
        </h2>
        <p className="text-gray-600 mb-2">
          Desculpe, estamos com dificuldades técnicas no momento.
        </p>
        <p className="text-gray-500 text-sm mb-6">
          Mas não se preocupe! Entre em contato conosco pelo WhatsApp.
        </p>

        {/* Detalhes do erro (apenas em desenvolvimento) */}
        {error && process.env.NODE_ENV === "development" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-xs font-mono text-red-700 break-words">
              {error.message}
            </p>
          </div>
        )}

        {/* Botão WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-3 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200 mb-4"
        >
          <MessageCircle className="w-6 h-6" />
          <span>Fale Conosco no WhatsApp</span>
        </a>

        {/* Botão de tentar novamente */}
        {resetError && (
          <Button
            onClick={resetError}
            variant="outline"
            className="w-full border-red-600 text-red-600 hover:bg-red-50"
          >
            Tentar Novamente
          </Button>
        )}

        {/* Informações de contato */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">
            <strong>WhatsApp:</strong>
          </p>
          <a
            href={whatsappUrl}
            className="text-green-500 hover:text-green-600 font-semibold text-sm"
          >
            (71) 99218-0210
          </a>
          <p className="text-xs text-gray-500 mt-4">
            Estamos aqui para ajudar! 💚
          </p>
        </div>
      </div>
    </div>
  );
}
