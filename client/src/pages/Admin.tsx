import { useAuth } from "@/_core/hooks/useAuth";
import { ProductManager } from "@/components/ProductManager";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Plus, Printer, TrendingUp, Check, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Admin() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [selectedTab, setSelectedTab] = useState("pedidos");

  // Queries
  const { data: orders = [], refetch: refetchOrders } = trpc.orders.list.useQuery();
  const { data: products = [], refetch: refetchProducts } = trpc.products.list.useQuery();
  const { data: cashEntries = [] } = trpc.cashRegister.list.useQuery();
  const { data: allReviews = [], refetch: refetchReviews } = trpc.reviews.getAll.useQuery({});

  // Mutations
  const updateStatusMutation = trpc.orders.updateStatus.useMutation();
  const createPaymentMutation = trpc.payments.create.useMutation();
  const createCashEntryMutation = trpc.cashRegister.create.useMutation();
  const approveReviewMutation = trpc.reviews.approve.useMutation();
  const deleteReviewMutation = trpc.reviews.delete.useMutation();
  const toggleAvailability = trpc.products.toggleAvailability.useMutation();

  // Form states
  const [newPaymentOrderId, setNewPaymentOrderId] = useState<number | null>(null);
  const [newPaymentAmount, setNewPaymentAmount] = useState("");
  const [newPaymentMethod, setNewPaymentMethod] = useState("dinheiro");

  const [newCashAmount, setNewCashAmount] = useState("");
  const [newCashType, setNewCashType] = useState<"entrada" | "saida">("entrada");
  const [newCashDescription, setNewCashDescription] = useState("");
  const [newCashMethod, setNewCashMethod] = useState("dinheiro");

  // Verificar se é admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: orderId,
        status: newStatus as any,
      });
      refetchOrders();
      toast.success("Status atualizado com sucesso");
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  const handleAddPayment = async () => {
    if (!newPaymentOrderId || !newPaymentAmount) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      await createPaymentMutation.mutateAsync({
        orderId: newPaymentOrderId,
        amount: Math.round(parseFloat(newPaymentAmount) * 100),
        paymentMethod: newPaymentMethod,
      });
      setNewPaymentOrderId(null);
      setNewPaymentAmount("");
      setNewPaymentMethod("dinheiro");
      refetchOrders();
      toast.success("Pagamento registrado com sucesso");
    } catch (error) {
      toast.error("Erro ao registrar pagamento");
    }
  };

  const handleAddCashEntry = async () => {
    if (!newCashAmount || !newCashDescription) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      await createCashEntryMutation.mutateAsync({
        amount: Math.round(parseFloat(newCashAmount) * 100),
        type: newCashType,
        description: newCashDescription,
        paymentMethod: newCashMethod,
      });
      setNewCashAmount("");
      setNewCashDescription("");
      setNewCashType("entrada");
      setNewCashMethod("dinheiro");
      toast.success("Registro de caixa adicionado com sucesso");
    } catch (error) {
      toast.error("Erro ao adicionar registro de caixa");
    }
  };

  const handlePrintOrder = (order: any) => {
    const printContent = `
      <html>
        <head>
          <title>Pedido ${order.orderNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #ec4899; }
            .info { margin: 10px 0; }
            .items { margin-top: 20px; }
            .item { margin: 10px 0; border-bottom: 1px solid #ccc; padding: 10px 0; }
            .total { font-weight: bold; font-size: 18px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>Pedido ${order.orderNumber}</h1>
          <div class="info"><strong>Cliente:</strong> ${order.customerName}</div>
          <div class="info"><strong>Telefone:</strong> ${order.customerPhone}</div>
          <div class="info"><strong>Endereço:</strong> ${order.customerAddress || "Retirada no balcão"}</div>
          <div class="info"><strong>Status:</strong> ${order.status}</div>
          <div class="items">
            <h3>Itens do Pedido:</h3>
            <div class="item">Itens: ${order.items?.length || 0}</div>
          </div>
          <div class="total">Total: R$ ${(order.totalPrice / 100).toFixed(2)}</div>
        </body>
      </html>
    `;
    const printWindow = window.open("", "", "height=400,width=600");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const totalCashEntries = cashEntries.reduce((sum: number, entry: any) => {
    return sum + (entry.type === "entrada" ? entry.amount : -entry.amount);
  }, 0);

  const totalSales = orders.reduce((sum: number, order: any) => sum + order.totalPrice, 0);

  if (user?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-red-700">Painel Administrativo</h1>
          </div>
          <div className="text-sm text-gray-600">
            Bem-vindo, {user?.name}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total de Pedidos</p>
                <p className="text-3xl font-bold text-red-600">{orders.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-red-600 opacity-50" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total de Vendas</p>
                <p className="text-3xl font-bold text-green-600">R$ {(totalSales / 100).toFixed(2)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Caixa</p>
                <p className="text-3xl font-bold text-blue-600">R$ {(totalCashEntries / 100).toFixed(2)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
            <TabsTrigger value="produtos">Produtos</TabsTrigger>
            <TabsTrigger value="caixa">Caixa</TabsTrigger>
            <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>

          {/* Pedidos Tab */}
          <TabsContent value="pedidos" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Gerenciar Pedidos</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-red-600 hover:bg-red-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Pedido (Balcão)
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo Pedido no Balcão</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-gray-600">Use a página de pedidos para criar pedidos. Esta funcionalidade será implementada em breve.</p>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {orders.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nenhum pedido ainda</p>
              ) : (
                orders.map((order: any) => (
                  <Card key={order.id} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Pedido</p>
                        <p className="font-bold">{order.orderNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Cliente</p>
                        <p className="font-bold">{order.customerName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="font-bold text-red-600">R$ {(order.totalPrice / 100).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <Select value={order.status} onValueChange={(value) => handleUpdateStatus(order.id, value)}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="novo">Novo</SelectItem>
                            <SelectItem value="em_preparo">Em Preparo</SelectItem>
                            <SelectItem value="entregue">Entregue</SelectItem>
                            <SelectItem value="cancelado">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handlePrintOrder(order)}
                        variant="outline"
                        size="sm"
                      >
                        <Printer className="w-4 h-4 mr-2" />
                        Imprimir
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setNewPaymentOrderId(order.id)}
                          >
                            Registrar Pagamento
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Registrar Pagamento</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Valor</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={newPaymentAmount}
                                onChange={(e) => setNewPaymentAmount(e.target.value)}
                                placeholder="0.00"
                              />
                            </div>
                            <div>
                              <Label>Forma de Pagamento</Label>
                              <Select value={newPaymentMethod} onValueChange={setNewPaymentMethod}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                                  <SelectItem value="pix">PIX</SelectItem>
                                  <SelectItem value="cartao">Cartão</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Button
                              onClick={handleAddPayment}
                              className="w-full bg-red-600 hover:bg-red-700"
                            >
                              Registrar
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Produtos Tab */}
          <TabsContent value="produtos" className="space-y-4">
            <ProductManager />
          </TabsContent>

          {/* Caixa Tab */}
          <TabsContent value="caixa" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Controle de Caixa</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-red-600 hover:bg-red-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Registro
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo Registro de Caixa</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Tipo</Label>
                      <Select value={newCashType} onValueChange={(value: any) => setNewCashType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entrada">Entrada</SelectItem>
                          <SelectItem value="saida">Saída</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Valor</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newCashAmount}
                        onChange={(e) => setNewCashAmount(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Input
                        value={newCashDescription}
                        onChange={(e) => setNewCashDescription(e.target.value)}
                        placeholder="Ex: Venda de doces"
                      />
                    </div>
                    <div>
                      <Label>Forma de Pagamento</Label>
                      <Select value={newCashMethod} onValueChange={setNewCashMethod}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dinheiro">Dinheiro</SelectItem>
                          <SelectItem value="pix">PIX</SelectItem>
                          <SelectItem value="cartao">Cartão</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={handleAddCashEntry}
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      Registrar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="p-6 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-600">Total em Caixa</p>
                  <p className="text-3xl font-bold text-blue-600">R$ {(totalCashEntries / 100).toFixed(2)}</p>
                </div>
              </div>
            </Card>

            <div className="space-y-2">
              {cashEntries.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nenhum registro de caixa</p>
              ) : (
                cashEntries.map((entry: any) => (
                  <Card key={entry.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Descrição</p>
                        <p className="font-bold">{entry.description}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tipo</p>
                        <p className="font-bold">{entry.type === "entrada" ? "Entrada" : "Saída"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Valor</p>
                        <p className={`font-bold ${entry.type === "entrada" ? "text-green-600" : "text-red-600"}`}>
                          {entry.type === "entrada" ? "+" : "-"} R$ {(entry.amount / 100).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Data</p>
                        <p className="font-bold">{new Date(entry.createdAt).toLocaleDateString("pt-BR")}</p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Relatórios Tab */}
          <TabsContent value="relatorios" className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Relatórios de Vendas</h2>

            <Card className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">Total de Pedidos</p>
                    <p className="text-3xl font-bold">{orders.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Ticket Médio</p>
                    <p className="text-3xl font-bold">R$ {orders.length > 0 ? ((totalSales / orders.length) / 100).toFixed(2) : "0.00"}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-bold mb-4">Pedidos por Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Novo</span>
                      <span className="font-bold">{orders.filter((o: any) => o.status === "novo").length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Em Preparo</span>
                      <span className="font-bold">{orders.filter((o: any) => o.status === "em_preparo").length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Entregue</span>
                      <span className="font-bold">{orders.filter((o: any) => o.status === "entregue").length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cancelado</span>
                      <span className="font-bold">{orders.filter((o: any) => o.status === "cancelado").length}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-bold mb-4">Resumo Financeiro</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total de Vendas</span>
                      <span className="font-bold text-green-600">R$ {(totalSales / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total em Caixa</span>
                      <span className="font-bold text-blue-600">R$ {(totalCashEntries / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Avaliações Tab */}
          <TabsContent value="avaliacoes" className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Gerenciar Avaliações</h2>

            <div className="space-y-4">
              {allReviews.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nenhuma avaliação</p>
              ) : (
                allReviews.map((review: any) => (
                  <Card key={review.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">Cliente</p>
                        <p className="font-bold">{review.customerName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Nota</p>
                        <p className="font-bold text-yellow-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <p className={`font-bold ${review.isApproved ? 'text-green-600' : 'text-orange-600'}`}>
                          {review.isApproved ? 'Aprovada' : 'Pendente'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Data</p>
                        <p className="font-bold">{new Date(review.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    {review.comment && (
                      <div className="mb-3 p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-700">{review.comment}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      {!review.isApproved && (
                        <Button
                          onClick={async () => {
                            try {
                              await approveReviewMutation.mutateAsync({ id: review.id });
                              refetchReviews();
                              toast.success('Avaliação aprovada!');
                            } catch (error) {
                              toast.error('Erro ao aprovar avaliação');
                            }
                          }}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Aprovar
                        </Button>
                      )}
                      <Button
                        onClick={async () => {
                          try {
                            await deleteReviewMutation.mutateAsync({ id: review.id });
                            refetchReviews();
                            toast.success('Avaliação deletada!');
                          } catch (error) {
                            toast.error('Erro ao deletar avaliação');
                          }
                        }}
                        size="sm"
                        variant="destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Deletar
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
