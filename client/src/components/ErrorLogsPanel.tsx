import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface ErrorLog {
  id: number;
  errorMessage: string;
  errorType: string;
  severity: "low" | "medium" | "high" | "critical";
  isResolved: number;
  createdAt: Date;
  url?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  errorStack?: string | null;
  notes?: string | null;
  resolvedAt?: Date | null;
  updatedAt: Date;
}

export default function ErrorLogsPanel() {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [filter, setFilter] = useState<"all" | "unresolved">("unresolved");

  const errorLogsQuery = trpc.errorLogs.list.useQuery();
  const deleteErrorMutation = trpc.errorLogs.delete.useMutation();

  useEffect(() => {
    if (errorLogsQuery.data) {
      const filtered =
        filter === "unresolved"
          ? errorLogsQuery.data.filter((e: any) => e.isResolved === 0)
          : errorLogsQuery.data;
      setErrors(filtered);
    }
  }, [errorLogsQuery.data, filter]);

  const handleDelete = async (id: number) => {
    try {
      await deleteErrorMutation.mutateAsync({ id });
      setErrors(errors.filter((e) => e.id !== id));
      toast.success("Erro removido");
      errorLogsQuery.refetch();
    } catch (error) {
      toast.error("Erro ao remover");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Monitoramento de Erros</h2>
        <Button
          onClick={() => errorLogsQuery.refetch()}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          variant={filter === "unresolved" ? "default" : "outline"}
          onClick={() => setFilter("unresolved")}
          className="bg-red-600 hover:bg-red-700"
        >
          Não Resolvidos ({errors.filter((e) => e.isResolved === 0).length})
        </Button>
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          Todos ({errors.length})
        </Button>
      </div>

      {errors.length === 0 ? (
        <Card className="p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">Nenhum erro registrado</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {errors.map((error) => (
            <Card key={error.id} className="p-4 border-l-4 border-l-red-500">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold border ${getSeverityColor(error.severity)}`}
                    >
                      {error.severity.toUpperCase()}
                    </span>
                    {error.isResolved === 1 && (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
                        RESOLVIDO
                      </span>
                    )}
                  </div>

                  <p className="font-semibold text-gray-800 mb-1">
                    {error.errorType}
                  </p>
                  <p className="text-sm text-gray-600 mb-2 break-words">
                    {error.errorMessage}
                  </p>

                  {error.url && (
                    <p className="text-xs text-gray-500 mb-2">
                      <strong>URL:</strong> {error.url}
                    </p>
                  )}

                  <p className="text-xs text-gray-400">
                    {new Date(error.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>

                <Button
                  onClick={() => handleDelete(error.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
