import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function LocalAdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', price: '' });

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
    if (password === 'admin123') {
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
    // Aqui você pode carregar produtos da API ou localStorage
    setProducts([
      { id: 1, name: 'Bolo de Pote', description: 'Ninho com brigadeiro', price: 12.00 },
      { id: 2, name: 'Bolo de Pote', description: 'Chocolate com brigadeiro', price: 12.00 },
    ]);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...formData, price: parseFloat(formData.price) } : p));
    } else {
      setProducts([...products, { id: Date.now(), ...formData, price: parseFloat(formData.price) }]);
    }
    setFormData({ name: '', description: '', price: '' });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setFormData({ name: product.name, description: product.description, price: product.price.toString() });
    setShowForm(true);
  };

  const handleDeleteProduct = (id: number) => {
    if (confirm('Deletar este produto?')) {
      setProducts(products.filter(p => p.id !== id));
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

          <p className="text-center text-sm text-gray-600 mt-4">
            Senha padrão: <strong>admin123</strong>
          </p>
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
            <h2 className="text-xl font-bold">Produtos</h2>
            <Button onClick={() => { setShowForm(true); setEditingProduct(null); setFormData({ name: '', description: '', price: '' }); }} className="bg-red-600 hover:bg-red-700">
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
              <Card key={product.id} className="p-4">
                <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{product.description}</p>
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
