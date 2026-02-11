import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const adminLoginMutation = trpc.auth.adminLogin.useMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Preencha todos os campos");
      return;
    }

    try {
      await adminLoginMutation.mutateAsync({ username, password });
      toast.success("Login realizado com sucesso!");
      window.location.href = "/admin";
    } catch (err) {
      setError("Usuário ou senha incorretos");
      toast.error("Falha no login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-red-600 mb-2">Qbom Doceria</h1>
          <p className="text-gray-600">Painel Administrativo</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <Label htmlFor="username" className="text-gray-700">
              Usuário
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu usuário"
              className="mt-2"
              disabled={adminLoginMutation.isPending}
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-gray-700">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              className="mt-2"
              disabled={adminLoginMutation.isPending}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            disabled={adminLoginMutation.isPending}
          >
            {adminLoginMutation.isPending ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Acesso restrito ao administrador
        </p>
      </Card>
    </div>
  );
}
