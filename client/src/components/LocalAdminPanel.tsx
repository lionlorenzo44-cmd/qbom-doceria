import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, X } from 'lucide-react';

export default function LocalAdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', image: '' });
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    // Verificar se já está logado
    const token = localStorage.getItem('adminLocalToken');
    if (token === 'true') {
      setIsLoggedIn(true);
      loadProducts();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Aqua1048') {
      localStorage.setItem('adminLocalToken', 'true');
      setIsLoggedIn(true);
      setPassword('');
      loadProducts();
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

  const loadProducts = () => {
    const saved = localStorage.getItem('adminProducts');
    if (saved) {
      setProducts(JSON.parse(saved));
    } else {
      // Produtos padrão
      const defaultProducts = [
        { id: 1, name: 'Bolo de Pote', description: 'Ninho com brigadeiro', price: 12.00, image: '' },
        { id: 2, name: 'Bolo de Pote', description: 'Chocolate com brigadeiro e doce de leite', price: 12.00, image: '' },
        { id: 3, name: 'Doce de leite 200ml', description: 'Doce de leite artesanal cremoso', price: 10.00, image: '' },
        { id: 4, name: 'Surpresa de uva', description: 'Doce com uva e cobertura de chocolate', price: 12.00, image: '' },
        { id: 5, name: 'Surpresa de Morango', description: 'Doce com morango fresco e chocolate', price: 12.00, image: '' },
        { id: 6, name: 'Brownie', description: 'Brownie de chocolate caseiro', price: 8.00, image: '' }
      ];
      setProducts(defaultProducts);
      localStorage.setItem('adminProducts', JSON.stringify(defaultProducts));
    }
  };

  const saveProducts = (updatedProducts: any[]) => {
    setProducts(updatedProducts);
    localStorage.setItem('adminProducts', JSON.stringify(updatedProducts));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setFormData({ ...formData, image: base64 });
        setImagePreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrl = (url: string) => {
    setFormData({ ...formData, image: url });
    setImagePreview(url);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      saveProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...formData, price: parseFloat(formData.price) } : p));
    } else {
      const newId = Math.max(...products.map(p => p.id), 0) + 1;
      saveProducts([...products, { id: newId, ...formData, price: parseFloat(formData.price) }]);
    }
    setFormData({ name: '', description: '', price: '', image: '' });
    setImagePreview('');
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setFormData({ name: product.name, description: product.description, price: product.price.toString(), image: product.image });
    setImagePreview(product.image);
    setShowForm(true);
  };

  const handleDeleteProduct = (id: number) => {
    if (confirm('Deletar este produto?')) {
      saveProducts(products.filter(p => p.id !== id));
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-600 to-red-800 p-4">
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-red-600">Admin Panel</h1>
          <Button onClick={handleLogout} variant="destructive">
            Sair
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Produtos ({products.length})</h2>
            <Button onClick={() => { setShowForm(true); setEditingProduct(null); setFormData({ name: '', description: '', price: '', image: '' }); setImagePreview(''); }} className="bg-red-600 hover:bg-red-700">
              + Novo Produto
            </Button>
          </div>

          {/* Product Form */}
          {showForm && (
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h3>
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

                {/* Image Section */}
                <div>
                  <label className="block text-sm font-medium mb-2">Imagem</label>
                  <div className="flex gap-2 mb-3">
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
                  </div>

                  {imageMode === 'url' ? (
                    <input
                      type="url"
                      value={formData.image}
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
                          setFormData({ ...formData, image: '' });
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
                  <Button type="button" onClick={() => setShowForm(false)} variant="outline" className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Products List */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id} className="p-4 flex flex-col">
                {product.image && (
                  <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded-lg mb-3" />
                )}
                <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-2 flex-1">{product.description}</p>
                <p className="text-red-600 font-bold text-lg mb-4">R$ {product.price.toFixed(2)}</p>
                <div className="flex gap-2">
                  <Button onClick={() => handleEditProduct(product)} variant="outline" className="flex-1 text-sm">
                    Editar
                  </Button>
                  <Button onClick={() => handleDeleteProduct(product.id)} variant="destructive" className="flex-1 text-sm">
                    Deletar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
