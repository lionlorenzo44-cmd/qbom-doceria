import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface ImageUploadProps {
  onImageSelect: (base64: string) => void;
  preview?: string;
  label?: string;
}

export function ImageUpload({ onImageSelect, preview, label = "Selecionar Imagem" }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    // Validar tamanho (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande (máximo 5MB)");
      return;
    }

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        onImageSelect(base64);
        toast.success("Imagem carregada com sucesso");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Erro ao processar imagem");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">{label}</Label>

      {/* Preview da imagem */}
      {preview && (
        <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => onImageSelect("")}
            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Botões de upload */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={handleCameraClick}
          disabled={isLoading}
          className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2"
        >
          <Camera className="w-5 h-5" />
          <span className="text-sm">Câmera</span>
        </Button>

        <Button
          onClick={handleGalleryClick}
          disabled={isLoading}
          className="h-12 bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center justify-center gap-2"
        >
          <Upload className="w-5 h-5" />
          <span className="text-sm">Galeria</span>
        </Button>
      </div>

      {/* Inputs file ocultos */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Selecionar imagem da galeria"
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Capturar foto com câmera"
      />

      {/* Dica de uso */}
      <p className="text-xs text-gray-500 text-center">
        Máximo 5MB • Formatos: JPG, PNG, WebP
      </p>
    </div>
  );
}
