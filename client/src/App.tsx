import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import MyOrders from "./pages/MyOrders";
import { Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

function Header() {
  const [location, navigate] = useLocation();
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
            onClick={() => navigate("/")}
          >
            <Heart className="w-6 h-6 text-red-600 fill-red-600" />
            <h1 className="text-2xl font-bold text-red-700">Qbom Doceria</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a 
              href="https://wa.me/5571992180210?text=Olá%20Qbom%20Doceria!"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">Contato</span>
            </a>
          </nav>

          {/* Menu mobile */}
          <div className="md:hidden flex items-center gap-2">
            <a 
              href="https://wa.me/5571992180210?text=Olá%20Qbom%20Doceria!"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
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

          {/* Segurança */}
          <div translate="no">
            <h3 className="text-white font-bold mb-4">Segurança</h3>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <span className="text-green-400">🔒</span>
                <span translate="no">Conexão segura (HTTPS)</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span translate="no">Dados protegidos</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span translate="no">Pagamento seguro</span>
              </p>
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
                  <a href="#" className="text-gray-400 hover:text-white transition">
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
              onClick={(e) => {
                e.preventDefault();
                navigate("/admin");
              }}
              onTouchStart={(e) => {
                e.preventDefault();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                navigate("/admin");
              }}
              onPointerDown={(e) => {
                if (e.pointerType === 'touch') {
                  e.preventDefault();
                  navigate("/admin");
                }
              }}
              className="text-red-600 hover:text-red-500 active:text-red-700 transition cursor-pointer inline bg-transparent border-none p-0 m-0 select-none"
              title="Acesso ao painel administrativo"
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                WebkitUserSelect: 'none',
                userSelect: 'none',
                touchAction: 'manipulation'
              }}
              type="button"
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
  const adminToken = localStorage.getItem("adminToken");
  
  if (!adminToken) {
    return <AdminLogin />;
  }
  
  return <Admin />;
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
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <div className="flex flex-col min-h-screen">
            <Header />
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
