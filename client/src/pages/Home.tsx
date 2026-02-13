import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SoldOutBadge } from "@/components/SoldOutBadge";
import PixPayment from "@/components/PixPayment";
import { trpc } from "@/lib/trpc";
import { MessageCircle, Plus, Trash2, MapPin, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

interface CartItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

interface ValidationErrors {
  name?: string;
  phone?: string;
}

export default function Home() {
  const { data: products = [] } = trpc.products.list.useQuery();
  const createOrderMutation = trpc.orders.create.useMutation();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerNeighborhood, setCustomerNeighborhood] = useState("");
  const [customerReference, setCustomerReference] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("dinheiro");
  const [needsChange, setNeedsChange] = useState(false);
  const [changeAmount, setChangeAmount] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [photoIndex, setPhotoIndex] = useState<Record<number, number>>({});
  const [flyingProduct, setFlyingProduct] = useState<{ id: number; x: number; y: number; targetX: number; targetY: number } | null>(null);
  const addressSectionRef = useRef<HTMLDivElement>(null);

  const scrollToAddressSection = () => {
    const element = addressSectionRef.current;
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - 100; // Sobe 100px acima do elemento
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleCartClick = () => {
      scrollToAddressSection();
    };
    window.addEventListener('cartClicked', handleCartClick);
    return () => window.removeEventListener('cartClicked', handleCartClick);
  }, []);

  // Proteger contra tradução automática
  useEffect(() => {
    const elements = document.querySelectorAll('[data-translate-no]');
    elements.forEach(el => {
      el.setAttribute('translate', 'no');
    });
  }, []);

  // Atualizar cartCount quando o carrinho muda
  useEffect(() => {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    // Emitir evento customizado para atualizar Header
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: totalItems, cart } }));
  }, [cart]);

  // Validação em tempo real
  const validateName = (name: string) => {
    if (!name.trim()) {
      return "Nome é obrigatório";
    }
    if (name.trim().length < 3) {
      return "Nome deve ter pelo menos 3 caracteres";
    }
    return "";
  };

  const validatePhone = (phone: string) => {
    if (!phone.trim()) {
      return "Telefone é obrigatório";
    }
    const phoneRegex = /^[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      return "Telefone contém caracteres inválidos";
    }
    if (phone.replace(/\D/g, "").length < 10) {
      return "Telefone deve ter pelo menos 10 dígitos";
    }
    return "";
  };

  const handleNameChange = (value: string) => {
    setCustomerName(value);
    const error = validateName(value);
    setErrors(prev => ({ ...prev, name: error }));
  };

  const handlePhoneChange = (value: string) => {
    setCustomerPhone(value);
    const error = validatePhone(value);
    setErrors(prev => ({ ...prev, phone: error }));
  };

  const handleAddToCart = (product: any, event?: React.MouseEvent) => {
    if (!product.isAvailable) {
      toast.error("Este produto está esgotado");
      return;
    }
    if (event) {
      const button = event.currentTarget as HTMLElement;
      const rect = button.getBoundingClientRect();
      const cartIcon = document.querySelector('[data-cart-icon]');
      const cartRect = cartIcon?.getBoundingClientRect();
      
      if (cartRect) {
        setFlyingProduct({
          id: product.id,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          targetX: cartRect.left + cartRect.width / 2,
          targetY: cartRect.top + cartRect.height / 2,
        } as any);
        setTimeout(() => setFlyingProduct(null), 600);
      }
    }
    const existingItem = cart.find(item => item.productId === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price,
      }]);
    }
    toast.success(`${product.name} adicionado ao carrinho`);
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const handleQuantityChange = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmitOrder = async () => {
    const nameError = validateName(customerName);
    const phoneError = validatePhone(customerPhone);

    if (nameError || phoneError) {
      setErrors({
        name: nameError,
        phone: phoneError,
      });
      toast.error("Por favor, corrija os erros no formulário");
      return;
    }

    if (cart.length === 0) {
      toast.error("Adicione pelo menos um produto ao carrinho");
      return;
    }

    try {
      const result = await createOrderMutation.mutateAsync({
        customerName,
        customerPhone,
        customerAddress,
        totalPrice,
        paymentMethod,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          priceAtTime: item.price,
        })),
      });

      if (!result || !result.orderNumber) {
        throw new Error('Pedido nao foi criado corretamente - orderNumber ausente');
      }

      // Montar mensagem para WhatsApp
      const itemsText = cart
        .map(item => `${item.productName} (x${item.quantity}) - R$ ${(item.price * item.quantity / 100).toFixed(2)}`)
        .join("\n");

      const fullAddress = `${customerAddress}${customerNeighborhood ? `, ${customerNeighborhood}` : ""}${customerReference ? ` - Ref: ${customerReference}` : ""}`;
      const message = `Ola! Gostaria de fazer um pedido na Qbom Doceria:\n\n${itemsText}\n\nTotal: R$ ${(totalPrice / 100).toFixed(2)}\nNome: ${customerName}\nTelefone: ${customerPhone}\nEndereco: ${fullAddress || "Endereco nao informado"}\nForma de pagamento: ${paymentMethod}\n\nPedido: ${result.orderNumber}`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappNumber = "5571992180210";
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

      toast.success("Pedido criado! Redirecionando para WhatsApp...");
      window.open(whatsappUrl, "_blank");

      // Limpar formulário
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setCustomerNeighborhood("");
      setCustomerReference("");
      setPaymentMethod("dinheiro");
      setErrors({});
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Erro ao criar pedido";
      toast.error(errorMsg);
      console.error('[Order Creation Error]:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50" translate="no">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Produtos */}
          <div className="lg:col-span-2">
            <div className="mb-8 pt-8">
              <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-4">Escolha seus doces</h2>
              <div className="flex justify-center mb-6">
                <ChevronDown className="w-6 md:w-8 h-6 md:h-8 text-red-600 animate-bounce" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {products.map((product, index) => {
                const images = [product.imageUrl, product.imageUrl2, product.imageUrl3].filter(Boolean);
                const currentIndex = photoIndex[product.id] || 0;
                const currentImage = images[currentIndex];

                const handlePrevPhoto = () => {
                  setPhotoIndex(prev => ({
                    ...prev,
                    [product.id]: currentIndex === 0 ? images.length - 1 : currentIndex - 1
                  }));
                };

                const handleNextPhoto = () => {
                  setPhotoIndex(prev => ({
                    ...prev,
                    [product.id]: currentIndex === images.length - 1 ? 0 : currentIndex + 1
                  }));
                };

                return (
                  <Card key={product.id} className="overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 flex flex-col border border-gray-200 hover:border-red-300 cursor-pointer animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
                    {!product.isAvailable && <SoldOutBadge />}
                    {currentImage && (
                      <div className="relative w-full bg-gray-200 overflow-hidden group" style={{ height: '384px' }}>
                        <img
                          src={currentImage}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Navegação de fotos */}
                        {images.length > 1 && (
                          <>
                            {/* Setas */}
                            <button
                              onClick={handlePrevPhoto}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                              onClick={handleNextPhoto}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>

                            {/* Dots */}
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                              {images.map((_, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setPhotoIndex(prev => ({ ...prev, [product.id]: idx }))}
                                  className={`w-2 h-2 rounded-full transition-all ${
                                    idx === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/75'
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    <div className="p-4 flex-1 flex flex-col">
                      {(() => {
                        const parts = product.name.split(' com ');
                        const mainTitle = parts[0];
                        const flavor = parts.length > 1 ? 'com ' + parts.slice(1).join(' com ') : '';
                        return (
                          <>
                            <h3 className="font-bold text-xl text-gray-800 mb-1">{mainTitle}</h3>
                            {flavor && <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">{flavor}</p>}
                          </>
                        );
                      })()}
                      {product.description && (
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{product.description}</p>
                      )}
                      <div className="flex justify-between items-center mt-auto">
                        <span className="text-lg font-bold text-red-600">
                          R$ {(product.price / 100).toFixed(2)}
                        </span>
                        <Button
                          onClick={(e) => handleAddToCart(product, e as React.MouseEvent)}
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 hover:shadow-lg hover:scale-110 transition-all duration-200 active:scale-95 md:p-2 p-3"
                          disabled={!product.isAvailable}
                        >
                          <Plus className="w-4 h-4 md:w-4 md:h-4 w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Carrinho e Formulário */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4" ref={addressSectionRef}>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Seu Pedido</h2>

              {/* Carrinho */}
              <div className="mb-6 max-h-64 overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Carrinho vazio</p>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.productId} className="border-b pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-800">{item.productName}</span>
                          <Button
                            onClick={() => handleRemoveFromCart(item.productId)}
                            variant="ghost"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value))}
                            className="w-12 px-2 py-1 border rounded"
                          />
                          <span className="text-sm text-gray-600">
                            R$ {(item.price * item.quantity / 100).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-bold">R$ {(totalPrice / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Entrega:</span>
                  <span className="font-bold text-green-600">Grátis</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-red-600">R$ {(totalPrice / 100).toFixed(2)}</span>
                </div>
              </div>

              {/* Formulário */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={customerName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Seu nome"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <div className="flex items-center gap-2 mt-1 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={customerPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && (
                    <div className="flex items-center gap-2 mt-1 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {errors.phone}
                    </div>
                  )}
                  {!errors.phone && customerPhone && (
                    <div className="flex items-center gap-2 mt-1 text-green-600 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      Telefone válido
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Endereço de Entrega</Label>
                  <div className="space-y-2">
                    <Input
                      id="address"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Rua, número"
                    />
                    <Input
                      id="neighborhood"
                      value={customerNeighborhood}
                      onChange={(e) => setCustomerNeighborhood(e.target.value)}
                      placeholder="Bairro"
                    />
                    <Input
                      id="reference"
                      value={customerReference}
                      onChange={(e) => setCustomerReference(e.target.value)}
                      placeholder="Referência (ex: perto do mercado)"
                    />
                    <p className="text-xs text-gray-500">Ou</p>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-red-200 hover:bg-red-50 text-red-600"
                      onClick={() => {
                        const msg = `Oi! Para facilitar a entrega, estou enviando minha localizacao. Pedido de: ${customerName}`;
                        const whatsappNumber = "5571992180210";
                        const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
                        window.open(url, '_blank');
                      }}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Enviar Localização via WhatsApp
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Forma de Pagamento *</Label>
                  <div className="payment-options space-y-2 mt-2">
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-red-50 transition">
                      <input
                        type="radio"
                        name="payment"
                        value="dinheiro"
                        checked={paymentMethod === "dinheiro"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-red-600"
                      />
                      <span className="text-lg">💵</span>
                      <span className="font-medium">Dinheiro</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-red-50 transition">
                      <input
                        type="radio"
                        name="payment"
                        value="pix"
                        checked={paymentMethod === "pix"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-red-600"
                      />
                      <span className="text-lg">📲</span>
                      <span className="font-medium">PIX</span>
                    </label>
                  </div>
                </div>

                {paymentMethod === "dinheiro" && (
                  <div className="space-y-3 border-t pt-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="needsChange"
                        checked={needsChange}
                        onChange={(e) => {
                          setNeedsChange(e.target.checked);
                          if (!e.target.checked) setChangeAmount("");
                        }}
                        className="w-4 h-4 text-red-600 cursor-pointer"
                      />
                      <label htmlFor="needsChange" className="cursor-pointer text-sm font-medium">
                        Precisa de troco?
                      </label>
                    </div>
                    {needsChange && (
                      <div>
                        <Label htmlFor="changeAmount">Valor pago em dinheiro</Label>
                        <Input
                          id="changeAmount"
                          type="number"
                          step="0.01"
                          value={changeAmount}
                          onChange={(e) => setChangeAmount(e.target.value)}
                          placeholder="Ex: 50.00"
                          className="text-red-600 font-semibold"
                        />
                        {changeAmount && !isNaN(parseFloat(changeAmount)) && (
                          <p className="text-sm text-green-600 mt-2 font-semibold">
                            Troco: R$ {(parseFloat(changeAmount) - totalPrice / 100).toFixed(2)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {paymentMethod === "pix" && (
                  <PixPayment 
                    pixKey="vitoriabjj953@gmail.com" 
                    receiverName="Walesca Vitória Oliveira Dos Santos"
                  />
                )}

                <Button
                  onClick={handleSubmitOrder}
                  disabled={cart.length === 0 || createOrderMutation.isPending}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold hover:shadow-lg hover:scale-105 transition-all duration-200 active:scale-95"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Enviar para WhatsApp
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {flyingProduct && (
        <div
          className="fixed animate-fly-to-cart"
          style={{
            left: `${flyingProduct.x}px`,
            top: `${flyingProduct.y}px`,
            '--tx': `${flyingProduct.targetX - flyingProduct.x}px`,
            '--ty': `${flyingProduct.targetY - flyingProduct.y}px`,
          } as any}
        >
          <div className="w-10 h-10 bg-red-600 rounded-lg shadow-lg flex items-center justify-center text-white font-bold text-sm">
            1
          </div>
        </div>
      )}
    </div>
  );
}
