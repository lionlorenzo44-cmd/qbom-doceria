import { useState, useEffect } from 'react';
import { Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PixPaymentProps {
  pixKey: string;
  receiverName: string;
}

export default function PixPayment({ pixKey, receiverName }: PixPaymentProps) {
  const [copied, setCopied] = useState(false);
  const [showInstruction, setShowInstruction] = useState(false);

  const handleCopyPixKey = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    try {
      // Usar Clipboard API para copiar
      await navigator.clipboard.writeText(pixKey);
      
      // Mostrar feedback visual
      setCopied(true);
      setShowInstruction(true);
      
      // Retornar ao estado normal após 2 segundos
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    } catch (err) {
      // Fallback para método antigo se Clipboard API falhar
      try {
        const textArea = document.createElement('textarea');
        textArea.value = pixKey;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        setCopied(true);
        setShowInstruction(true);
        
        const timer = setTimeout(() => {
          setCopied(false);
        }, 2000);
        
        return () => clearTimeout(timer);
      } catch (fallbackErr) {
        console.error('Erro ao copiar chave Pix:', fallbackErr);
      }
    }
  };

  // Remover mensagem de instrução após 3 segundos
  useEffect(() => {
    if (showInstruction) {
      const timer = setTimeout(() => {
        setShowInstruction(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showInstruction]);

  return (
    <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
      {/* Título */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-2xl">💳</span>
        Pagamento via Pix
      </h3>

      {/* Bloco com informações */}
      <div className="bg-white rounded-lg p-4 mb-4 border border-blue-100">
        {/* Nome do recebedor */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 font-medium mb-1">Recebedor</p>
          <p className="text-gray-900 font-semibold">{receiverName}</p>
        </div>

        {/* Chave Pix */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 font-medium mb-1">Chave Pix</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-gray-100 p-3 rounded text-sm font-mono text-gray-800 break-all">
              {pixKey}
            </code>
          </div>
        </div>

        {/* Botão Copiar */}
        <Button
          onClick={handleCopyPixKey}
          className={`w-full transition-all duration-300 ${
            copied
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {copied ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Copiado ✅
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copiar chave Pix
            </>
          )}
        </Button>
      </div>

      {/* Mensagem de instrução */}
      {showInstruction && (
        <div className="animate-fade-in bg-blue-100 border border-blue-300 rounded-lg p-4 text-blue-900">
          <p className="font-medium mb-2">📋 Instruções:</p>
          <p className="text-sm">
            Após pagar, envie o comprovante pelo WhatsApp para confirmar seu pedido.
          </p>
        </div>
      )}

      {/* Dica adicional */}
      <div className="mt-4 p-3 bg-blue-100 rounded-lg text-sm text-blue-900">
        <p>
          <strong>💡 Dica:</strong> Você pode usar qualquer app de banco ou carteira digital que suporte Pix.
        </p>
      </div>
    </div>
  );
}
