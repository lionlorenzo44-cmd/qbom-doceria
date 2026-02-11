import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Heart, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data: products = [] } = trpc.products.list.useQuery();

  const handleOrderClick = () => {
    if (user?.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/order");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-pink-600 fill-pink-600" />
            <h1 className="text-2xl font-bold text-pink-700">Qbom Doceria</h1>
          </div>
          <nav className="flex gap-4 items-center">
            {user?.role === "admin" && (
              <Button onClick={() => navigate("/admin")} variant="outline">
                Painel Admin
              </Button>
            )}
            {user && (
              <Button onClick={() => navigate("/profile")} variant="ghost">
                {user.name || "Perfil"}
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-600 to-pink-500 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Doces que dão vontade de repetir 😋</h2>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Doceria caseira com receitas especiais feitas com amor
          </p>
          <Button
            onClick={handleOrderClick}
            size="lg"
            className="bg-white text-pink-600 hover:bg-pink-50 font-bold"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Fazer Pedido
          </Button>
        </div>
      </section>

      {/* Cardápio Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-4 text-pink-700">Nossos Doces</h3>
          <p className="text-center text-gray-600 mb-12">
            Escolha seus doces favoritos e faça seu pedido
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {product.imageUrl && (
                  <div className="w-full h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h4 className="font-bold text-lg text-gray-800 mb-2">{product.name}</h4>
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-pink-600">
                      R$ {(product.price / 100).toFixed(2)}
                    </span>
                    <Button
                      onClick={handleOrderClick}
                      size="sm"
                      className="bg-pink-600 hover:bg-pink-700"
                    >
                      Pedir
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="bg-pink-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-pink-600 mb-2">🚚</div>
              <h4 className="font-bold text-lg mb-2">Entrega Grátis</h4>
              <p className="text-gray-600">Em qualquer pedido, sem valor mínimo</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-pink-600 mb-2">💝</div>
              <h4 className="font-bold text-lg mb-2">Feito com Amor</h4>
              <p className="text-gray-600">Receitas caseiras e ingredientes de qualidade</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-pink-600 mb-2">📱</div>
              <h4 className="font-bold text-lg mb-2">Pedidos Fáceis</h4>
              <p className="text-gray-600">Peça pelo WhatsApp de forma rápida e simples</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-pink-700 mb-6">Pronto para saborear?</h3>
          <Button
            onClick={handleOrderClick}
            size="lg"
            className="bg-pink-600 hover:bg-pink-700 text-white font-bold"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Fazer Pedido Agora
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">© 2026 Qbom Doceria - Todos os direitos reservados</p>
          <p className="text-gray-400">Feito com ❤️ para você</p>
        </div>
      </footer>
    </div>
  );
}
