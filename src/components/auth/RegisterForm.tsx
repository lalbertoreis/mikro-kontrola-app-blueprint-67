
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const RegisterForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    try {
      setIsLoading(true);
      // Here we'd normally handle the registration with a real authentication service
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Conta criada com sucesso! Redirecionando...");
      
      // In a real app, we would redirect to dashboard after successful registration
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
      
    } catch (error) {
      toast.error("Ocorreu um erro ao criar sua conta");
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Crie sua conta</h1>
        <p className="text-gray-500">
          Preencha os dados abaixo para começar a usar o KontrolaApp
        </p>
      </div>
      
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="name">Nome completo</Label>
          <Input
            id="name"
            name="name"
            placeholder="Seu nome"
            required
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        
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
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            placeholder="Crie uma senha"
            required
            type="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirme sua senha</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Digite sua senha novamente"
            required
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </div>
        
        <Button
          className="w-full bg-kontrola-600 hover:bg-kontrola-700"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>
      
      <div className="text-center text-sm">
        Já tem uma conta?{" "}
        <Link to="/login" className="font-medium text-kontrola-600 hover:text-kontrola-700">
          Entrar
        </Link>
      </div>
    </div>
  );
};

export default RegisterForm;
