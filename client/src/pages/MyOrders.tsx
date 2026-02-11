import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Package, Calendar, MapPin, Phone, DollarSign, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function MyOrders() {
  const [, navigate] = useLocation();
  const { data: orders = [] } = trpc.orders.getCustomerOrders.useQuery();
  const repeatOrderMutation = trpc.orders.repeatOrder.useMutation();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Proteger contra tradução automática
  useEffect(() => {
    const elements = document.querySelectorAll('[data-translate-no]');
    elements.forEach(el => {
      el.setAttribute('translate', 'no');
    });
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const handleRepeatOrder = async (order: any) => {
    try {
      const result = await repeatOrderMutation.mutateAsync({
        orderId: order.id,
        items: order.items || []
      });
      toast.success("Pedido adicionado ao carrinho!");
      navigate("/");
    } catch (error) {
      toast.error("Erro ao repetir pedido");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente":
        return "bg-yellow-100 text-yellow-800";
      case "confirmado":
        return "bg-blue-100 text-blue-800";
      case "entregue":
        return "bg-green-100 text-green-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pendente: "Pendente",
      confirmado: "Confirmado",
      entregue: "Entregue",
      cancelado: "Cancelado"
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white" translate="no">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            size="sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">Meus Pedidos</h1>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Input
            placeholder="Buscar por nome ou número do pedido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-gray-300"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="confirmado">Confirmado</SelectItem>
              <SelectItem value="entregue">Entregue</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de Pedidos */}
        {filteredOrders.length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {orders.length === 0 ? "Você ainda não fez nenhum pedido" : "Nenhum pedido encontrado com os filtros selecionados"}
            </p>
            {orders.length === 0 && (
              <Button
                onClick={() => navigate("/")}
                className="mt-4 bg-red-600 hover:bg-red-700"
              >
                Fazer Primeiro Pedido
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Informações do Pedido */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-800">
                        Pedido #{order.id}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{order.customerPhone}</span>
                      </div>
                      {order.customerAddress && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 mt-1" />
                          <span>{order.customerAddress}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Itens e Total */}
                  <div>
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Itens:</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        {(order.items || []).map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between">
                            <span>
                              {item.quantity}x {item.productName}
                            </span>
                            <span className="font-medium">
                              R$ {((item.priceAtTime * item.quantity) / 100).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-red-600" />
                        <span className="text-lg font-bold text-red-600">
                          R$ {(order.totalPrice / 100).toFixed(2)}
                        </span>
                      </div>
                      <Button
                        onClick={() => handleRepeatOrder(order)}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                        disabled={repeatOrderMutation.isPending}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Repetir
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
