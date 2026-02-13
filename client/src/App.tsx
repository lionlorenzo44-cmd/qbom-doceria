import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import LocalAdminPanel from "./components/LocalAdminPanel";
import MyOrders from "./pages/MyOrders";
import { Heart, MessageCircle, ShoppingCart, Instagram, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

function Header({ cartCount: initialCount = 0 }) {
  const [location, navigate] = useLocation();
  const [cartCount, setCartCount] = useState(initialCount);

  useEffect(() => {
    const handleCartUpdate = (event: any) => {
      setCartCount(event.detail.count);
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);
  
  return (
    <header className="bg-gradient-to-r from-red-600 to-pink-600 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-5">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() => navigate("/")}
          >
            <div className="bg-white rounded-full p-2 shadow-md">
              <Heart className="w-6 h-6 text-red-600 fill-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">Qbom Doceria</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-4">
            <div 
              className="relative cursor-pointer hover:scale-110 transition-transform" 
              data-cart-icon
              onClick={() => window.dispatchEvent(new CustomEvent('cartClicked'))}
            >
              <ShoppingCart className="w-6 h-6 text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
          </nav>

          {/* Menu mobile */}
          <div className="md:hidden flex items-center gap-3">
            <div 
              className="relative" 
              data-cart-icon
              onClick={() => window.dispatchEvent(new CustomEvent('cartClicked'))}
            >
              <ShoppingCart className="w-5 h-5 text-white cursor-pointer hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-600 text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const [, navigate] = useLocation();
  
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Sobre */}
          <div>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-600 fill-red-600" />
              Qbom Doceria
            </h3>
            <p className="text-sm">Doces caseiros feitos com amor e ingredientes especiais. Entrega grátis para qualquer pedido!</p>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-white font-bold mb-4">Contato</h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>WhatsApp:</strong>{" "}
                <a 
                  href="https://wa.me/5571992180210" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 transition"
                >
                  (71) 99218-0210
                </a>
              </p>
              <p>
                <strong>Email:</strong>{" "}
                <a 
                  href="mailto:contato@qbomdoceria.com" 
                  className="text-red-400 hover:text-red-300 transition"
                >
                  contato@qbomdoceria.com
                </a>
              </p>
            </div>
          </div>

          {/* Horário */}
          <div>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Horário
            </h3>
            <div className="space-y-2 text-sm">
              <p><strong>Seg-Sex:</strong> 08:00-18:00</p>
              <p><strong>Sábado:</strong> 09:00-17:00</p>
              <p><strong>Domingo:</strong> Fechado</p>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <a href="https://instagram.com/qbomdoceria" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 transition">
                  <Instagram className="w-5 h-5" />
                  <span className="text-sm">@qbomdoceria</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Divisor */}
        <div className="border-t border-gray-700 pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Políticas */}
            <div>
              <h4 className="text-white font-bold mb-3">Políticas</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition">
                    Política de Privacidade
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition" translate="no">
                    Termos de Uso
                  </a>
                </li>
              </ul>
            </div>


          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
          <p>
            &copy; 2026 Qbom Doceria. Todos os direitos reservados. Feito com{" "}
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate("/admin");
              }}
              onTouchEnd={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate("/admin");
              }}
              className="text-red-600 hover:text-red-500 active:text-red-700 transition cursor-pointer inline bg-transparent border-none p-0 m-0"
              title="Acesso ao painel administrativo"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              ❤️
            </button>
            {" "}para você.
          </p>
        </div>
      </div>
    </footer>
  );
}

function ProtectedAdminRoute() {
  // Usar painel admin local independente
  return <LocalAdminPanel />;
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/meus-pedidos" component={MyOrders} />
      <Route path="/admin" component={ProtectedAdminRoute} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  const [cartCount, setCartCount] = useState(0);
  
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <div className="flex flex-col min-h-screen">
            <Header cartCount={cartCount} />
            <main className="flex-1">
              <Router />
            </main>
            <Footer />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
