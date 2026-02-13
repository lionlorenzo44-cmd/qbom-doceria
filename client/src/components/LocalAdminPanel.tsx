import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, X, ChevronLeft, ChevronRight, TrendingUp, Package, ClipboardList, Wallet, Star } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export default function LocalAdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('produtos');
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', imageUrl: '' });
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('upload');
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
  const updateStatusMutation = trpc.orders.updateStatus.useMutation();
  const approveReviewMutation = trpc.reviews.approve.useMutation();
  const deleteReviewMutation = trpc.reviews.delete.useMutation();
  const publishMutation = trpc.system.publish.useMutation();

  const totalSales = orders.reduce((acc: number, order: any) => acc + order.totalPrice, 0);
  const totalCashEntries = cashEntries.reduce((acc: number, entry: any) => {
    return entry.type === 'entrada' ? acc + entry.amount : acc - entry.amount;
  }, 0);
  const deleteProductMutation = trpc.products.delete.useMutation();
  const createProductMutation = trpc.products.create.useMutation();

  useEffect(() => {
    const token = localStorage.getItem('adminLocalToken');
    if (token === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Aqua1048') {
      localStorage.setItem('adminLocalToken', 'true');
      setIsLoggedIn(true);
      setPassword('');
    } else {
      alert('Senha incorreta!');
      setPassword('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLocalToken');
    setIsLoggedIn(false);
    setPassword('');
  };



  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setFormData({ ...formData, imageUrl: base64 });
        setImagePreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrl = (url: string) => {
    setFormData({ ...formData, imageUrl: url });
    setImagePreview(url);
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

        // Preservar outras imagens ao atualizar uma específica
        if (imageEditMode === 'replace') {
          if (editingImageIndex === 0) updates.imageUrl = formData.imageUrl;
          if (editingImageIndex === 1) updates.imageUrl2 = formData.imageUrl;
          if (editingImageIndex === 2) updates.imageUrl3 = formData.imageUrl;
        } else if (imageEditMode === 'add') {
          if (!product.imageUrl) updates.imageUrl = formData.imageUrl;
          else if (!product.imageUrl2) updates.imageUrl2 = formData.imageUrl;
          else if (!product.imageUrl3) updates.imageUrl3 = formData.imageUrl;
        }

        await updateProductMutation.mutateAsync(updates);
        toast.success('Produto atualizado com sucesso');
      } else {
        await createProductMutation.mutateAsync({
          name: formData.name,
          description: formData.description,
          price: Math.round(parseFloat(formData.price) * 100),
          imageUrl: formData.imageUrl,
        });
        toast.success('Produto criado com sucesso');
      }
      await refetchProducts();
      resetForm();
    } catch (error) {
      toast.error('Erro ao salvar produto');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', imageUrl: '' });
    setImagePreview('');
    setEditingProductId(null);
    setShowAddForm(false);
    setImageEditMode('view');
    setEditingImageIndex(0);
  };

  const handleEditProduct = (product: any) => {
    setEditingProductId(product.id);
    setFormData({ name: product.name, description: product.description, price: (product.price / 100).toString(), imageUrl: product.imageUrl || '' });
    setImagePreview(product.imageUrl ? product.imageUrl : '');
    setImageEditMode('view');
    setTimeout(() => {
      const element = document.getElementById(`product-${product.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm('Deletar este produto?')) {
      try {
        await deleteProductMutation.mutateAsync({ id });
        await refetchProducts();
        toast.success('Produto deletado com sucesso');
      } catch (error) {
        toast.error('Erro ao deletar produto');
      }
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-600 to-red-800 p-4" translate="no">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">❤️</div>
            <h1 className="text-2xl font-bold text-red-600">Qbom Doceria</h1>
            <p className="text-gray-600 mt-2">Painel Administrativo</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Senha de Acesso</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                autoComplete="off"
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
              <Button onClick={() => { setShowAddForm(true); setEditingProductId(null); setFormData({ name: '', description: '', price: '', imageUrl: '' }); setImagePreview(''); }} className="bg-red-600 hover:bg-red-700">
                + Novo Produto
              </Button>
            </div>

            {showAddForm && editingProductId === null && (
              <Card className="p-6 mb-6">
                <h3 className="text-lg font-bold mb-4">Novo Produto</h3>
                <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome do produto"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição do produto"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Imagem</label>
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setImageMode('upload')}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                        imageMode === 'upload'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode('url')}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                        imageMode === 'url'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      URL
                    </button>
                  </div>

                  {imageMode === 'url' ? (
                    <input
                      type="url"
                      value={formData.imageUrl}
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
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}

                  {imagePreview && (
                    <div className="mt-3 relative">
                      <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setFormData({ ...formData, imageUrl: '' });
                        }}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700">
                    Salvar
                  </Button>
                  <Button type="button" onClick={() => setShowAddForm(false)} variant="outline" className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </form>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id} id={`product-${product.id}`} className={`p-0 flex flex-col transition-all overflow-hidden ${
                editingProductId === product.id ? 'ring-2 ring-red-600 shadow-lg' : ''
              }`}>
                {editingProductId !== product.id && product.imageUrl && (
                  <div className="relative w-full bg-gray-200 overflow-hidden" style={{ height: '384px' }}>
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4 flex flex-col flex-1">
                  {editingProductId !== product.id && (
                    <>
                      <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-3 flex-1">{product.description}</p>
                      <p className="text-red-600 font-bold text-lg">R$ {(product.price / 100).toFixed(2)}</p>
                    </>
                  )}

                  {editingProductId === product.id && (
                    <div className="mb-4 pt-4 border-t-2 border-red-200 space-y-3">
                      <div className="bg-red-50 p-3 rounded-lg">
                        <label className="block text-sm font-medium mb-2">Imagem Atual</label>
                        {product.imageUrl ? (
                          <div className="mb-3">
                            {/* Carousel de imagens */}
                            <div className="relative w-full bg-gray-200 rounded-lg overflow-hidden" style={{ height: '384px' }}>
                              {photoIndex[product.id] === undefined && (setPhotoIndex({ ...photoIndex, [product.id]: 0 }), null)}
                              {[
                                product.imageUrl,
                                product.imageUrl2,
                                product.imageUrl3
                              ].filter((url): url is string => url !== null && url !== undefined).map((url, idx) => (
                                <img
                                  key={idx}
                                  src={url}
                                  alt={`${product.name} - ${idx + 1}`}
                                  className={`w-full h-full object-cover transition-opacity duration-300 absolute top-0 left-0 ${
                                    idx === (photoIndex[product.id] ?? 0) ? 'opacity-100 relative' : 'opacity-0'
                                  }`}
                                />
                              ))}
                              
                              {/* Setas de navegação */}
                              {[
                                product.imageUrl,
                                product.imageUrl2,
                                product.imageUrl3
                              ].filter(Boolean).length > 1 && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const images = [product.imageUrl, product.imageUrl2, product.imageUrl3].filter(Boolean);
                                      const currentIndex = photoIndex[product.id] ?? 0;
                                      setPhotoIndex({ ...photoIndex, [product.id]: (currentIndex - 1 + images.length) % images.length });
                                    }}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition"
                                  >
                                    <ChevronLeft className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const images = [product.imageUrl, product.imageUrl2, product.imageUrl3].filter(Boolean);
                                      const currentIndex = photoIndex[product.id] ?? 0;
                                      setPhotoIndex({ ...photoIndex, [product.id]: (currentIndex + 1) % images.length });
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition"
                                  >
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              
                              {/* Badge com número da imagem */}
                              {[
                                product.imageUrl,
                                product.imageUrl2,
                                product.imageUrl3
                              ].filter(Boolean).length > 1 && (
                                <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                  {(photoIndex[product.id] ?? 0) + 1}
                                </div>
                              )}
                              
                              {/* Indicadores (dots) */}
                              {[
                                product.imageUrl,
                                product.imageUrl2,
                                product.imageUrl3
                              ].filter(Boolean).length > 1 && (
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                  {[
                                    product.imageUrl,
                                    product.imageUrl2,
                                    product.imageUrl3
                                  ].filter(Boolean).map((_, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => setPhotoIndex({ ...photoIndex, [product.id]: idx })}
                                      className={`w-2 h-2 rounded-full transition ${
                                        idx === (photoIndex[product.id] ?? 0)
                                          ? 'bg-white'
                                          : 'bg-white/50 hover:bg-white/75'
                                      }`}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            {/* Contador de imagens */}
                            {[
                              product.imageUrl,
                              product.imageUrl2,
                              product.imageUrl3
                            ].filter(Boolean).length > 1 && (
                              <p className="text-xs text-gray-600 mt-2 text-center">
                                Imagem {(photoIndex[product.id] ?? 0) + 1} de {[
                                  product.imageUrl,
                                  product.imageUrl2,
                                  product.imageUrl3
                                ].filter(Boolean).length}
                              </p>
                            )}
                            
                            {/* Botões de ação */}
                            <div className="flex gap-2 mt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setImageEditMode('replace');
                                  setEditingImageIndex((photoIndex[product.id] ?? 0) as 0 | 1 | 2);
                                }}
                                className="flex-1 px-2 py-1 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-700"
                                translate="no"
                              >
                                Substituir
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-gray-500 text-sm mb-3">Nenhuma imagem adicionada</p>
                            <button
                              type="button"
                              onClick={() => {
                                setImageEditMode('add');
                                setEditingImageIndex(0);
                              }}
                              className="w-full px-3 py-2 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                              translate="no"
                            >
                              Adicionar Imagem
                            </button>
                          </div>
                        )}
                      </div>

                      {(imageEditMode === 'replace' || imageEditMode === 'add') && (
                        <div className="bg-red-50 p-3 rounded-lg">
                          <label className="block text-sm font-medium mb-2" translate="no">{imageEditMode === 'replace' ? 'Substituir Imagem' : 'Adicionar Nova Imagem'}</label>
                          <div className="flex gap-2 mb-2">
                            <button
                              type="button"
                              onClick={() => setImageMode('upload')}
                              className={`flex-1 px-2 py-1 rounded text-xs font-medium transition ${
                                imageMode === 'upload'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              Upload
                            </button>
                            <button
                              type="button"
                              onClick={() => setImageMode('url')}
                              className={`flex-1 px-2 py-1 rounded text-xs font-medium transition ${
                                imageMode === 'url'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              URL
                            </button>
                          </div>
                          {imageMode === 'url' ? (
                            <input
                              type="url"
                              value={formData.imageUrl}
                              onChange={(e) => handleImageUrl(e.target.value)}
                              placeholder="https://exemplo.com/imagem.jpg"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-sm"
                            />
                          ) : (
                            <label className="flex items-center justify-center w-full px-3 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-600 transition text-xs">
                              <span className="text-gray-600">Clique para upload</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                            </label>
                          )}
                          {imagePreview && (
                            <div className="mt-2 relative">
                              <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded" />
                              <button
                                type="button"
                                onClick={() => {
                                  setImagePreview('');
                                  setFormData({ ...formData, imageUrl: '' });
                                }}
                                className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => setImageEditMode('view')}
                            className="w-full mt-2 px-2 py-1 rounded text-xs font-medium bg-gray-300 text-gray-700 hover:bg-gray-400"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                      <div className="bg-red-50 p-3 rounded-lg">
                        <label className="block text-sm font-medium mb-1">Nome</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-sm"
                        />
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg">
                        <label className="block text-sm font-medium mb-1">Descrição</label>
                        <input
                          type="text"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-sm"
                        />
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg">
                        <label className="block text-sm font-medium mb-1">Preço</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleAddProduct} className="flex-1 bg-red-600 hover:bg-red-700 text-sm py-1 h-auto">
                          Salvar
                        </Button>
                        <Button onClick={() => setEditingProductId(null)} variant="outline" className="flex-1 text-sm py-1 h-auto">
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}

                  {!editingProductId && (
                    <div className="flex gap-2">
                      <Button onClick={() => handleEditProduct(product)} variant="outline" className="flex-1 text-sm">
                        Editar
                      </Button>
                      <Button onClick={() => handleDeleteProduct(product.id)} variant="destructive" className="flex-1 text-sm">
                        Deletar
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
