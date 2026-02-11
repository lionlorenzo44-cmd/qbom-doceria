import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, MessageCircle, Plus, Trash2, MapPin, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
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

export default function Order() {
  const [, navigate] = useLocation();
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

  // Proteger contra tradução automática
  useEffect(() => {
    const elements = document.querySelectorAll('[data-translate-no]');
    elements.forEach(el => {
      el.setAttribute('translate', 'no');
    });
  }, []);

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

  const handleAddToCart = (product: any) => {
    if (!product.isAvailable) {
      toast.error("Este produto está esgotado");
      return;
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
        orderType: "whatsapp",
        paymentMethod,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          priceAtTime: item.price,
        })),
      });

      // Montar mensagem para WhatsApp
      const itemsText = cart
        .map(item => `${item.productName} (x${item.quantity}) - R$ ${(item.price * item.quantity / 100).toFixed(2)}`)
        .join("\n");

      const fullAddress = `${customerAddress}${customerNeighborhood ? `, ${customerNeighborhood}` : ""}${customerReference ? ` - Ref: ${customerReference}` : ""}`;
      const message = `Olá! Gostaria de fazer um pedido na Qbom Doceria:\n\n${itemsText}\n\nTotal: R$ ${(totalPrice / 100).toFixed(2)}\nNome: ${customerName}\nTelefone: ${customerPhone}\nEndereço: ${fullAddress || "Endereço não informado"}\nForma de pagamento: ${paymentMethod}\n\nPedido: ${result.orderNumber}`;

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
      toast.error("Erro ao criar pedido");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white" translate="no">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Produtos */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Escolha seus doces</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {product.imageUrl && (
                    <div className="w-full h-32 bg-gray-200 overflow-hidden">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-red-600">
                        R$ {(product.price / 100).toFixed(2)}
                      </span>
                      <Button
                        onClick={() => handleAddToCart(product)}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                        disabled={!product.isAvailable}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Carrinho e Formulário */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
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
                  <div className="space-y-3 border-t pt-3 bg-red-50 p-3 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      <p className="text-sm font-semibold text-red-700">Chaves PIX para transferência:</p>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-white p-2 rounded border border-red-200">
                        <p className="text-xs text-gray-600">Email:</p>
                        <p className="text-sm font-mono font-semibold text-gray-800">vitoriabjj953@gmail.com</p>
                      </div>
                      <div className="bg-white p-2 rounded border border-red-200">
                        <p className="text-xs text-gray-600">Telefone:</p>
                        <p className="text-sm font-mono font-semibold text-gray-800">75 98299-6939</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 italic">Copie uma das chaves acima e faça a transferencia no seu banco.</p>
                  </div>
                )}

                <Button
                  onClick={handleSubmitOrder}
                  disabled={cart.length === 0 || createOrderMutation.isPending}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Enviar para WhatsApp
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
