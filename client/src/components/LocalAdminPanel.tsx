import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, X, ChevronLeft, ChevronRight, TrendingUp, Package, ClipboardList, Wallet, Star, Plus } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export default function LocalAdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('produtos');
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', imageUrl: '', imageUrl2: '', imageUrl3: '' });
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [imagePreview, setImagePreview] = useState('');
  const [imageEditMode, setImageEditMode] = useState<'view' | 'replace' | 'add'>('view');
  const [photoIndex, setPhotoIndex] = useState<Record<number, number>>({});
  const [editingImageIndex, setEditingImageIndex] = useState<0 | 1 | 2>(0);

  const { data: products = [], refetch: refetchProducts } = trpc.products.list.useQuery(undefined, {
    enabled: isLoggedIn,
  });
  const { data: orders = [], refetch: refetchOrders } = trpc.orders.list.useQuery(undefined, {
    enabled: isLoggedIn,
    refetchInterval: 5000,
  });
  const { data: cashEntries = [] } = trpc.cashRegister.list.useQuery(undefined, {
    enabled: isLoggedIn,
  });
  const { data: allReviews = [], refetch: refetchReviews } = trpc.reviews.getAll.useQuery({}, {
    enabled: isLoggedIn,
  });

  const updateProductMutation = trpc.products.update.useMutation();
  const deleteProductMutation = trpc.products.delete.useMutation();
  const createProductMutation = trpc.products.create.useMutation();
  const updateStatusMutation = trpc.orders.updateStatus.useMutation();
  const approveReviewMutation = trpc.reviews.approve.useMutation();
  const deleteReviewMutation = trpc.reviews.delete.useMutation();
  const publishMutation = trpc.system.publish.useMutation();

  const totalSales = orders.reduce((acc: number, order: any) => acc + order.totalPrice, 0);
  const totalCashEntries = cashEntries.reduce((acc: number, entry: any) => {
    return entry.type === 'entrada' ? acc + entry.amount : acc - entry.amount;
  }, 0);

  useEffect(() => {
    const token = localStorage.getItem('adminLocalToken');
    if (token === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Aqua1048') {
      setIsLoggedIn(true);
      localStorage.setItem('adminLocalToken', 'true');
      toast.success('Login realizado com sucesso');
    } else {
      toast.error('Senha incorreta');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('adminLocalToken');
    toast.success('Logout realizado');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (editingProductId) {
          setFormData(prev => ({ ...prev, imageUrl: base64 }));
        } else {
          if (editingImageIndex === 0) setFormData(prev => ({ ...prev, imageUrl: base64 }));
          else if (editingImageIndex === 1) setFormData(prev => ({ ...prev, imageUrl2: base64 }));
          else if (editingImageIndex === 2) setFormData(prev => ({ ...prev, imageUrl3: base64 }));
        }
        setImagePreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrl = (url: string) => {
    if (editingProductId) {
      setFormData(prev => ({ ...prev, imageUrl: url }));
    } else {
      if (editingImageIndex === 0) setFormData(prev => ({ ...prev, imageUrl: url }));
      else if (editingImageIndex === 1) setFormData(prev => ({ ...prev, imageUrl2: url }));
      else if (editingImageIndex === 2) setFormData(prev => ({ ...prev, imageUrl3: url }));
    }
    setImagePreview(url);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', imageUrl: '', imageUrl2: '', imageUrl3: '' });
    setImagePreview('');
    setEditingProductId(null);
    setShowAddForm(false);
    setEditingImageIndex(0);
    setImageEditMode('view');
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProductId) {
        const product = products.find(p => p.id === editingProductId);
        const updates: any = {
          id: editingProductId,
          name: formData.name,
          description: formData.description,
          price: Math.round(parseFloat(formData.price) * 100),
        };

        if (imageEditMode === 'replace') {
          if (editingImageIndex === 0) updates.imageUrl = formData.imageUrl;
          if (editingImageIndex === 1) updates.imageUrl2 = formData.imageUrl;
          if (editingImageIndex === 2) updates.imageUrl3 = formData.imageUrl;
        } else if (imageEditMode === 'add') {
          if (!product?.imageUrl) updates.imageUrl = formData.imageUrl;
          else if (!product?.imageUrl2) updates.imageUrl2 = formData.imageUrl;
          else if (!product?.imageUrl3) updates.imageUrl3 = formData.imageUrl;
        }

        await updateProductMutation.mutateAsync(updates);
        toast.success('Produto atualizado com sucesso');
      } else {
        await createProductMutation.mutateAsync({
          name: formData.name,
          description: formData.description,
          price: Math.round(parseFloat(formData.price) * 100),
          imageUrl: formData.imageUrl,
          imageUrl2: formData.imageUrl2 || null,
          imageUrl3: formData.imageUrl3 || null,
          isAvailable: true,
        });
        toast.success('Produto criado com sucesso');
      }
      refetchProducts();
      resetForm();
    } catch (error) {
      toast.error('Erro ao salvar produto');
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProductId(product.id);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: (product.price / 100).toString(),
      imageUrl: product.imageUrl || '',
      imageUrl2: product.imageUrl2 || '',
      imageUrl3: product.imageUrl3 || '',
    });
    setImagePreview(product.imageUrl || '');
    setEditingImageIndex(0);
    setImageEditMode('view');
    setShowAddForm(false);
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm('Deseja realmente deletar este produto?')) {
      try {
        await deleteProductMutation.mutateAsync({ id });
        toast.success('Produto deletado');
        refetchProducts();
      } catch (error) {
        toast.error('Erro ao deletar produto');
      }
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50 px-4">
        <Card className="w-full max-w-md p-8">
          <h1 className="text-2xl font-bold text-center text-red-600 mb-6">Acesso Administrativo</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder="Digite a senha admin"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
              Entrar
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-red-600">Painel Administrativo</h1>
          <div className="flex gap-2">
            <Button 
              onClick={async () => {
                toast.promise(
                  publishMutation.mutateAsync(),
                  {
                    loading: 'Publicando última versão...',
                    success: 'Site publicado com sucesso!',
                    error: 'Erro ao publicar versão.',
                  }
                );
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-bold"
              size="sm"
            >
              🚀 Publicar Última Versão
            </Button>
            <Button onClick={handleLogout} variant="destructive" size="sm">
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total de Pedidos</p>
                <p className="text-3xl font-bold text-red-600">{orders.length}</p>
              </div>
              <ClipboardList className="w-8 h-8 text-red-600 opacity-50" />
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
                <p className="text-gray-600 text-sm">Saldo em Caixa</p>
                <p className="text-3xl font-bold text-blue-600">R$ {(totalCashEntries / 100).toFixed(2)}</p>
              </div>
              <Wallet className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="pedidos" className="flex gap-2"><ClipboardList className="w-4 h-4" /> <span className="hidden md:inline">Pedidos</span></TabsTrigger>
            <TabsTrigger value="produtos" className="flex gap-2"><Package className="w-4 h-4" /> <span className="hidden md:inline">Produtos</span></TabsTrigger>
            <TabsTrigger value="caixa" className="flex gap-2"><Wallet className="w-4 h-4" /> <span className="hidden md:inline">Caixa</span></TabsTrigger>
            <TabsTrigger value="avaliacoes" className="flex gap-2"><Star className="w-4 h-4" /> <span className="hidden md:inline">Avaliações</span></TabsTrigger>
          </TabsList>

          <TabsContent value="pedidos" className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Gerenciar Pedidos</h2>
            {orders.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhum pedido recebido ainda.</p>
            ) : (
              <div className="grid gap-4">
                {orders.map((order: any) => (
                  <Card key={order.id} className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-bold text-lg">{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">{order.customerName} - {order.customerPhone}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        order.status === 'novo' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'em_preparo' ? 'bg-yellow-100 text-yellow-700' :
                        order.status === 'entregue' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => updateStatusMutation.mutateAsync({ id: order.id, status: 'em_preparo' }).then(() => refetchOrders())}>Preparar</Button>
                      <Button size="sm" variant="outline" onClick={() => updateStatusMutation.mutateAsync({ id: order.id, status: 'entregue' }).then(() => refetchOrders())}>Entregar</Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="caixa" className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Controle de Caixa</h2>
            <Card className="p-6">
              <div className="space-y-4">
                {cashEntries.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">Nenhuma movimentação de caixa registrada.</p>
                ) : (
                  <div className="divide-y">
                    {cashEntries.map((entry: any) => (
                      <div key={entry.id} className="py-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{entry.description}</p>
                          <p className="text-xs text-gray-500">{new Date(entry.createdAt).toLocaleString('pt-BR')}</p>
                        </div>
                        <p className={`font-bold ${entry.type === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                          {entry.type === 'entrada' ? '+' : '-'} R$ {(entry.amount / 100).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="avaliacoes" className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Avaliações de Clientes</h2>
            {allReviews.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhuma avaliação recebida ainda.</p>
            ) : (
              <div className="grid gap-4">
                {allReviews.map((review: any) => (
                  <Card key={review.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold">{review.customerName}</p>
                        <div className="flex text-yellow-500">
                          {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${review.isApproved ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {review.isApproved ? 'Aprovada' : 'Pendente'}
                      </div>
                    </div>
                    {review.comment && <p className="text-sm text-gray-700 mb-3 bg-gray-50 p-2 rounded italic">"{review.comment}"</p>}
                    <div className="flex gap-2">
                      {!review.isApproved && (
                        <Button size="sm" className="h-7 text-xs" onClick={() => approveReviewMutation.mutateAsync({ id: review.id }).then(() => refetchReviews())}>Aprovar</Button>
                      )}
                      <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => deleteReviewMutation.mutateAsync({ id: review.id }).then(() => refetchReviews())}>Deletar</Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="produtos">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Gerenciar Cardápio ({products.length})</h2>
              <Button onClick={() => { setShowAddForm(true); setEditingProductId(null); setFormData({ name: '', description: '', price: '', imageUrl: '', imageUrl2: '', imageUrl3: '' }); setImagePreview(''); setEditingImageIndex(0); }} className="bg-red-600 hover:bg-red-700">
                + Novo Produto
              </Button>
            </div>

            {showAddForm && editingProductId === null && (
              <Card className="p-6 mb-6">
                <h3 className="text-lg font-bold mb-4">Novo Produto</h3>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Nome</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Descrição</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Preço (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-sm font-medium mb-2">Imagens (Até 3)</label>
                      <div className="flex gap-2 mb-2">
                        {[0, 1, 2].map((idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setEditingImageIndex(idx as 0 | 1 | 2);
                              const currentImg = idx === 0 ? formData.imageUrl : idx === 1 ? formData.imageUrl2 : formData.imageUrl3;
                              setImagePreview(currentImg || '');
                            }}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                              editingImageIndex === idx ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            Foto {idx + 1}
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-2 mb-3">
                        <button
                          type="button"
                          onClick={() => setImageMode('upload')}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                            imageMode === 'upload' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          Upload
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageMode('url')}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                            imageMode === 'url' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          URL
                        </button>
                      </div>

                      {imageMode === 'url' ? (
                        <input
                          type="url"
                          value={imagePreview}
                          onChange={(e) => handleImageUrl(e.target.value)}
                          placeholder="https://exemplo.com/imagem.jpg"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      ) : (
                        <label className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-600 hover:bg-red-50 transition">
                          <div className="text-center">
                            <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                            <span className="text-sm text-gray-600">Clique para selecionar imagem</span>
                          </div>
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                      )}

                      {imagePreview && (
                        <div className="mt-3 relative">
                          <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview('');
                              if (editingImageIndex === 0) setFormData({ ...formData, imageUrl: '' });
                              else if (editingImageIndex === 1) setFormData({ ...formData, imageUrl2: '' });
                              else if (editingImageIndex === 2) setFormData({ ...formData, imageUrl3: '' });
                            }}
                            className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700">Criar Produto</Button>
                    <Button type="button" onClick={resetForm} variant="outline" className="flex-1">Cancelar</Button>
                  </div>
                </form>
              </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Card key={product.id} className="p-0 flex flex-col transition-all overflow-hidden border-2 border-transparent hover:border-red-100">
                  <div className="relative w-full bg-gray-200 overflow-hidden" style={{ height: '300px' }}>
                    <img
                      src={product.imageUrl || 'https://via.placeholder.com/400x300?text=Sem+Imagem'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {[product.imageUrl2, product.imageUrl3].filter(Boolean).length > 0 && (
                      <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                        +{[product.imageUrl2, product.imageUrl3].filter(Boolean).length} fotos
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 flex-1 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center mt-auto">
                      <p className="text-red-600 font-bold">R$ {(product.price / 100).toFixed(2)}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)}>Editar</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteProduct(product.id)}>Deletar</Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
