import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewsList } from "@/components/ReviewsList";
import { trpc } from "@/lib/trpc";
import { ShoppingCart, Share2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Home() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data: products = [] } = trpc.products.list.useQuery();
  const [expandedProduct, setExpandedProduct] = useState<number | null>(null);

  const handleOrderClick = () => {
    if (user?.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/order");
    }
  };

  const handleShareProduct = (product: typeof products[0]) => {
    const shareText = `Confira este doce delicioso da Qbom Doceria: ${product.name} - R$ ${(product.price / 100).toFixed(2)}`;
    const whatsappNumber = "5571992180210";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-500 text-white py-12 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Doces que dão vontade de repetir 😋</h2>
          <p className="text-base md:text-xl mb-8 opacity-90">
            Doceria caseira com receitas especiais feitas com amor
          </p>
          <Button
            onClick={handleOrderClick}
            size="lg"
            className="bg-white text-red-600 hover:bg-red-50 font-bold text-base md:text-lg px-6 md:px-8 py-2 md:py-3"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Fazer Pedido
          </Button>
        </div>
      </section>

      {/* Cardápio Section */}
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl md:text-4xl font-bold text-center mb-4 text-red-700">Nossos Doces</h3>
          <p className="text-center text-gray-600 mb-8 md:mb-12">
            Escolha seus doces favoritos e faça seu pedido
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isExpanded={expandedProduct === product.id}
                onToggleExpand={() =>
                  setExpandedProduct(expandedProduct === product.id ? null : product.id)
                }
                onOrderClick={handleOrderClick}
                onShare={() => handleShareProduct(product)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="bg-red-50 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-red-600 mb-3">🏍️</div>
              <h4 className="font-bold text-lg mb-2">Entrega Grátis</h4>
              <p className="text-gray-600 text-sm md:text-base">Em qualquer pedido, sem valor mínimo</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-red-600 mb-3">💝</div>
              <h4 className="font-bold text-lg mb-2">Feito com Amor</h4>
              <p className="text-gray-600 text-sm md:text-base">Receitas caseiras e ingredientes de qualidade</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-red-600 mb-3">📱</div>
              <h4 className="font-bold text-lg mb-2">Pedidos Fáceis</h4>
              <p className="text-gray-600 text-sm md:text-base">Peça pelo WhatsApp de forma rápida e simples</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 text-center">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl md:text-3xl font-bold text-red-700 mb-6">Pronto para saborear?</h3>
          <Button
            onClick={handleOrderClick}
            size="lg"
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-base md:text-lg px-6 md:px-8 py-2 md:py-3"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Fazer Pedido Agora
          </Button>
        </div>
      </section>
    </div>
  );
}

interface ProductCardProps {
  product: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onOrderClick: () => void;
  onShare: () => void;
}

function ProductCard({
  product,
  isExpanded,
  onToggleExpand,
  onOrderClick,
  onShare,
}: ProductCardProps) {
  const { data: reviews = [] } = trpc.reviews.getApproved.useQuery(
    { productId: product.id },
    { enabled: isExpanded }
  );
  const { data: averageRating = 0 } = trpc.reviews.getAverageRating.useQuery({
    productId: product.id,
  });

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow flex flex-col ${!product.isAvailable ? 'opacity-60' : ''}`}>
      {product.imageUrl && (
        <div className="w-full h-40 md:h-56 bg-gray-200 overflow-hidden flex items-center justify-center p-2 relative">
          <img
            src={product.imageUrl}
            alt={product.name}
            className={`w-full h-full object-cover ${product.isAvailable ? 'hover:scale-105 transition-transform' : ''}`}
          />
          {!product.isAvailable && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-red-600 text-white px-3 py-1 md:px-4 md:py-2 rounded-lg font-bold text-sm md:text-lg">ESGOTADO</span>
            </div>
          )}
        </div>
      )}
      <div className="p-3 md:p-4 flex-1 flex flex-col">
        <h4 className="font-bold text-base md:text-lg text-gray-800 mb-2">{product.name}</h4>
        {product.description && (
          <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">{product.description}</p>
        )}

        {/* Rating */}
        <div className="mb-3 md:mb-4">
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-xs md:text-sm ${
                    star <= Math.round(averageRating)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-xs md:text-sm font-semibold">{averageRating.toFixed(1)}</span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-auto gap-2">
          <span className="text-xl md:text-2xl font-bold text-red-600">
            R$ {(product.price / 100).toFixed(2)}
          </span>
          <div className="flex gap-1 md:gap-2">
            <Button
              onClick={onShare}
              size="sm"
              variant="ghost"
              className="text-red-600 hover:bg-red-50 p-1 md:p-2"
              title="Compartilhar no WhatsApp"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              onClick={onOrderClick}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-xs md:text-sm px-2 md:px-3 py-1 md:py-2"
              disabled={!product.isAvailable}
            >
              {product.isAvailable ? 'Pedir' : 'Esgotado'}
            </Button>
          </div>
        </div>

        {/* Reviews Section */}
        {isExpanded && (
          <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t space-y-3">
            <ReviewsList
              reviews={reviews}
              averageRating={averageRating}
              totalReviews={reviews.length}
            />
            <ReviewForm
              productId={product.id}
              productName={product.name}
              onReviewSubmitted={onToggleExpand}
            />
          </div>
        )}

        {!isExpanded && reviews.length > 0 && (
          <Button
            onClick={onToggleExpand}
            variant="ghost"
            size="sm"
            className="w-full mt-2 text-red-600 text-xs md:text-sm"
          >
            Ver {reviews.length} avaliação{reviews.length !== 1 ? "ões" : ""}
          </Button>
        )}

        {!isExpanded && reviews.length === 0 && (
          <Button
            onClick={onToggleExpand}
            variant="ghost"
            size="sm"
            className="w-full mt-2 text-red-600 text-xs md:text-sm"
          >
            Deixar Avaliação
          </Button>
        )}
      </div>
    </Card>
  );
}
