
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      // Here we'd normally handle the login with a real authentication service
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Login realizado com sucesso! Redirecionando...");
      
      // In a real app, we would redirect to dashboard after successful login
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
      
    } catch (error) {
      toast.error("Email ou senha inválidos");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Entrar</h1>
        <p className="text-gray-500">
          Entre com seu email e senha para acessar sua conta
        </p>
      </div>
      
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            placeholder="seu@email.com"
            required
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link
              to="/forgot-password"
              className="text-sm text-kontrola-600 hover:text-kontrola-700"
            >
              Esqueceu a senha?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            placeholder="Sua senha"
            required
            type="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        
        <Button
          className="w-full bg-kontrola-600 hover:bg-kontrola-700"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </Button>
      </form>
      
      <div className="text-center text-sm">
        Não tem uma conta?{" "}
        <Link to="/register" className="font-medium text-kontrola-600 hover:text-kontrola-700">
          Registre-se
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;
