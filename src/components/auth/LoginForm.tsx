
"use client"

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FcGoogle } from "react-icons/fc";

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) {
        toast.error("Erro ao fazer login com Google: " + error.message);
      }
    } catch (error) {
      toast.error("Falha ao conectar com Google");
      console.error("Google login error:", error);
    } finally {
      setGoogleLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {
      email: "",
      password: "",
    };
    let isValid = true;
    
    if (!formData.email) {
      newErrors.email = "Email é obrigatório";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
      isValid = false;
    }
    
    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Email ou senha incorretos");
        } else {
          toast.error("Erro ao fazer login: " + error.message);
        }
        console.error("Login error:", error);
        return;
      }
      
      toast.success("Login realizado com sucesso! Redirecionando...");
      
      // Redirect to dashboard after successful login
      navigate("/dashboard");
      
    } catch (error) {
      toast.error("Ocorreu um erro ao tentar fazer login");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Entrar</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Entre com seu email e senha para acessar sua conta
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
            <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
              Ou continue com email
            </span>
          </div>
        </div>
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
            className="dark:bg-gray-800 dark:border-gray-700"
          />
          {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link
              to="/forgot-password"
              className="text-sm text-kontrola-600 hover:text-kontrola-700 dark:text-kontrola-400 dark:hover:text-kontrola-300"
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
            className="dark:bg-gray-800 dark:border-gray-700"
          />
          {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
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
        <Link to="/register" className="font-medium text-kontrola-600 hover:text-kontrola-700 dark:text-kontrola-400 dark:hover:text-kontrola-300">
          Registre-se
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;
