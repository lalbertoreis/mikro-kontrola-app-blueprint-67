
"use client"

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FcGoogle } from "react-icons/fc";

const RegisterForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
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

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard'
        }
      });
      
      if (error) {
        toast.error("Erro ao cadastrar com Google: " + error.message);
      }
    } catch (error) {
      toast.error("Falha ao conectar com Google");
      console.error("Google registration error:", error);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("A senha precisa ter pelo menos 6 caracteres");
      return;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.name.split(' ')[0],
            last_name: formData.name.split(' ').slice(1).join(' ')
          },
        },
      });
      
      if (error) {
        toast.error("Erro ao criar conta: " + error.message);
        return;
      }
      
      toast.success("Conta criada com sucesso! Redirecionando...");
      
      // In a real app, we would redirect to dashboard after successful registration
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
      
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
        <p className="text-gray-500 dark:text-gray-400">
          Preencha os dados abaixo para começar a usar o KontrolaApp
        </p>
      </div>
      
      <div className="space-y-4">
        <Button 
          type="button" 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
        >
          <FcGoogle className="h-5 w-5" />
          {googleLoading ? "Conectando..." : "Continuar com Google"}
        </Button>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-background px-2 text-gray-500 dark:text-gray-400">
              Ou continue com email
            </span>
          </div>
        </div>
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
            className="dark:bg-gray-900 dark:border-gray-700"
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
            className="dark:bg-gray-900 dark:border-gray-700"
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
            className="dark:bg-gray-900 dark:border-gray-700"
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
            className="dark:bg-gray-900 dark:border-gray-700"
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
        <Link to="/login" className="font-medium text-kontrola-600 hover:text-kontrola-700 dark:text-kontrola-400 dark:hover:text-kontrola-300">
          Entrar
        </Link>
      </div>
    </div>
  );
};

export default RegisterForm;
