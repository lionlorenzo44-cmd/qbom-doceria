import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Edit2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface WebhookForm {
  name: string;
  url: string;
  method: "GET" | "POST" | "PUT";
}

export default function WebhooksPanel() {
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<WebhookForm>({
    name: "",
    url: "",
    method: "POST",
  });

  const webhooksQuery = trpc.webhooks.list.useQuery();
  const createMutation = trpc.webhooks.create.useMutation();
  const deleteMutation = trpc.webhooks.delete.useMutation();

  const handleCreate = async () => {
    if (!formData.name || !formData.url) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      await createMutation.mutateAsync(formData);
      toast.success("Webhook criado com sucesso");
      setFormData({ name: "", url: "", method: "POST" });
      setShowForm(false);
      webhooksQuery.refetch();
    } catch (error) {
      toast.error("Erro ao criar webhook");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Webhook deletado");
      webhooksQuery.refetch();
    } catch (error) {
      toast.error("Erro ao deletar webhook");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Webhooks de Recuperação</h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Novo Webhook
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold mb-4">Adicionar Webhook</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <Input
                placeholder="ex: Limpar Cache"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <Input
                placeholder="https://seu-servidor.com/webhook"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método HTTP
              </label>
              <select
                value={formData.method}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    method: e.target.value as "GET" | "POST" | "PUT",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCreate}
                className="bg-green-600 hover:bg-green-700"
              >
                Criar
              </Button>
              <Button
                onClick={() => setShowForm(false)}
                variant="outline"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {webhooksQuery.data && webhooksQuery.data.length === 0 ? (
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            Nenhum webhook configurado. Crie um para executar ações automáticas quando o site voltar online.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {webhooksQuery.data?.map((webhook: any) => (
            <Card key={webhook.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-800">
                      {webhook.name}
                    </h3>
                    {webhook.isActive === 1 ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-2 break-all">
                    <strong>URL:</strong> {webhook.url}
                  </p>

                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Método:</strong> {webhook.method}
                  </p>

                  {webhook.lastExecuted && (
                    <p className="text-xs text-gray-500">
                      <strong>Última execução:</strong>{" "}
                      {new Date(webhook.lastExecuted).toLocaleString("pt-BR")}
                      {webhook.lastStatus && ` (Status: ${webhook.lastStatus})`}
                    </p>
                  )}

                  {webhook.failureCount > 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      <strong>Falhas:</strong> {webhook.failureCount}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:bg-blue-50"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(webhook.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-4 bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">Como funciona:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • Quando o site volta online após uma queda, todos os webhooks ativos são executados
          </li>
          <li>
            • Use webhooks para limpar cache, reiniciar serviços ou executar tarefas de recuperação
          </li>
          <li>
            • Cada webhook será chamado com uma requisição HTTP no método especificado
          </li>
        </ul>
      </Card>
    </div>
  );
}
