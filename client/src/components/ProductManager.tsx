import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Plus, Edit, Trash2 } from "lucide-react";
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
      toast.error("Nome e preco sao obrigatorios");
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
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Gerenciar Produtos</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={() => handleOpenDialog()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Editar Produto" : "Novo Produto"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome do produto"
                />
              </div>
              <div>
                <Label>Descricao</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descricao do produto"
                  rows={3}
                />
              </div>
              <div>
                <Label>Preco (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>URL da Primeira Imagem</Label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                />
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Preview 1"
                    className="mt-2 h-32 object-cover rounded"
                  />
                )}
              </div>
              <div>
                <Label>URL da Segunda Imagem (Opcional)</Label>
                <Input
                  value={imageUrl2}
                  onChange={(e) => setImageUrl2(e.target.value)}
                  placeholder="https://..."
                />
                {imageUrl2 && (
                  <img
                    src={imageUrl2}
                    alt="Preview 2"
                    className="mt-2 h-32 object-cover rounded"
                  />
                )}
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleSave}
                >
                  {editingProduct ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {allProducts.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Nenhum produto cadastrado</p>
        ) : (
          allProducts.map((product: any) => (
            <Card key={product.id} className="p-6">
              <div className="flex items-start gap-4">
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{product.name}</h3>
                  {product.description && (
                    <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                  )}
                  <p className="text-red-600 font-bold">R$ {(product.price / 100).toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Status: {product.isAvailable ? "Disponivel" : "Esgotado"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={product.isAvailable ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleToggleAvailability(product.id, !product.isAvailable)}
                    className={!product.isAvailable ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    {product.isAvailable ? "Desabilitar" : "Habilitar"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(product)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
