import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Plus, Edit, Trash2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ProductManager() {
  const { data: allProducts = [], refetch: refetchAllProducts } = trpc.products.listAll.useQuery();
  const createProductMutation = trpc.products.create.useMutation();
  const updateProductMutation = trpc.products.update.useMutation();
  const deleteProductMutation = trpc.products.delete.useMutation();
  const toggleAvailabilityMutation = trpc.products.toggleAvailability.useMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageUrl2, setImageUrl2] = useState("");

  const resetForm = () => {
    setEditingProduct(null);
    setName("");
    setDescription("");
    setPrice("");
    setImageUrl("");
    setImageUrl2("");
  };

  const handleOpenDialog = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setName(product.name);
      setDescription(product.description || "");
      setPrice((product.price / 100).toString());
      setImageUrl(product.imageUrl || "");
      setImageUrl2(product.imageUrl2 || "");
    } else {
      resetForm();
    }
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!name || !price) {
      toast.error("Nome e preço são obrigatórios");
      return;
    }

    try {
      if (editingProduct) {
        await updateProductMutation.mutateAsync({
          id: editingProduct.id,
          name,
          description,
          price: Math.round(parseFloat(price) * 100),
          imageUrl,
          imageUrl2,
        });
        toast.success("Produto atualizado com sucesso");
      } else {
        await createProductMutation.mutateAsync({
          name,
          description,
          price: Math.round(parseFloat(price) * 100),
          imageUrl,
          imageUrl2,
        });
        toast.success("Produto criado com sucesso");
      }
      refetchAllProducts();
      setIsOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Erro ao salvar produto");
    }
  };

  const handleToggleAvailability = async (id: number, isAvailable: boolean) => {
    try {
      await toggleAvailabilityMutation.mutateAsync({ id, isAvailable });
      toast.success(isAvailable ? "Produto habilitado" : "Produto desabilitado");
      refetchAllProducts();
    } catch (error) {
      toast.error("Erro ao atualizar disponibilidade");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este produto?")) {
      try {
        await deleteProductMutation.mutateAsync({ id });
        toast.success("Produto deletado com sucesso");
        refetchAllProducts();
      } catch (error) {
        toast.error("Erro ao deletar produto");
      }
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header com botão de novo produto - Mobile Optimized */}
      <div className="sticky top-0 bg-white z-10 p-4 -mx-4 border-b">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <h2 className="text-lg font-bold text-gray-900">Gerenciar Produtos</h2>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-3 sm:py-2"
                onClick={() => handleOpenDialog()}
              >
                <Plus className="w-5 h-5 mr-2" />
                Novo Produto
              </Button>
            </DialogTrigger>
            {/* Modal otimizado para mobile */}
            <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg">
                  {editingProduct ? "Editar Produto" : "Novo Produto"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label className="text-base font-semibold">Nome do Produto *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Bolo de Chocolate"
                    className="mt-2 h-12 text-base"
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold">Descrição</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Bolo caseiro com chocolate belga"
                    className="mt-2 text-base min-h-20"
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold">Preço (R$) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="mt-2 h-12 text-base"
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold">URL da Primeira Imagem</Label>
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="mt-2 h-12 text-base"
                  />
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt="Preview 1"
                      className="mt-3 w-full h-40 object-cover rounded-lg"
                    />
                  )}
                </div>

                <div>
                  <Label className="text-base font-semibold">URL da Segunda Imagem (Opcional)</Label>
                  <Input
                    value={imageUrl2}
                    onChange={(e) => setImageUrl2(e.target.value)}
                    placeholder="https://..."
                    className="mt-2 h-12 text-base"
                  />
                  {imageUrl2 && (
                    <img
                      src={imageUrl2}
                      alt="Preview 2"
                      className="mt-3 w-full h-40 object-cover rounded-lg"
                    />
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsOpen(false);
                      resetForm();
                    }}
                    className="flex-1 h-12 text-base"
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700 h-12 text-base font-semibold"
                    onClick={handleSave}
                  >
                    {editingProduct ? "Atualizar" : "Criar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lista de produtos - Mobile Optimized */}
      <div className="space-y-3">
        {allProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-center text-gray-500 text-base">Nenhum produto cadastrado</p>
            <p className="text-center text-gray-400 text-sm mt-1">Clique em "Novo Produto" para começar</p>
          </div>
        ) : (
          allProducts.map((product: any) => (
            <Card key={product.id} className="p-4 border-l-4 border-l-red-600">
              <div className="space-y-3">
                {/* Imagem e info principal */}
                <div className="flex gap-3">
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-gray-900 truncate">{product.name}</h3>
                    {product.description && (
                      <p className="text-gray-600 text-sm line-clamp-2 mt-1">{product.description}</p>
                    )}
                    <p className="text-red-600 font-bold text-lg mt-2">R$ {(product.price / 100).toFixed(2)}</p>
                  </div>
                </div>

                {/* Status e botões */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      product.isAvailable 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.isAvailable ? '✓ Disponível' : '✗ Esgotado'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={product.isAvailable ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleToggleAvailability(product.id, !product.isAvailable)}
                      className={`h-10 text-xs font-semibold ${!product.isAvailable ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
                    >
                      {product.isAvailable ? "Desabilitar" : "Habilitar"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(product)}
                      className="h-10"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      className="h-10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
