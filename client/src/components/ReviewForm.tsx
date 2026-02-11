import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ReviewFormProps {
  productId: number;
  productName: string;
  onReviewSubmitted?: () => void;
}

export function ReviewForm({ productId, productName, onReviewSubmitted }: ReviewFormProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [comment, setComment] = useState("");

  const createReviewMutation = trpc.reviews.create.useMutation();

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      toast.error("Por favor, digite seu nome");
      return;
    }

    try {
      await createReviewMutation.mutateAsync({
        productId,
        customerName,
        customerEmail: customerEmail || undefined,
        rating,
        comment: comment || undefined,
      });

      toast.success("Avaliação enviada com sucesso! Será exibida após aprovação.");
      setOpen(false);
      setCustomerName("");
      setCustomerEmail("");
      setComment("");
      setRating(5);
      onReviewSubmitted?.();
    } catch (error) {
      toast.error("Erro ao enviar avaliação");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          Deixar Avaliação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Avaliar {productName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Sua Nota</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="name">Seu Nome *</Label>
            <Input
              id="name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Digite seu nome"
            />
          </div>

          <div>
            <Label htmlFor="email">Email (opcional)</Label>
            <Input
              id="email"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <Label htmlFor="comment">Comentário (opcional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Compartilhe sua experiência com este doce..."
              rows={4}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={createReviewMutation.isPending}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            Enviar Avaliação
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
