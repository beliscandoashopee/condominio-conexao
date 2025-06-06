
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useUser } from "@/contexts/user/UserContext";

const Auth = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [apartment, setApartment] = useState("");
  const [block, setBlock] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }
    
    try {
      setIsSubmitting(true);
      await login(email, password);
      navigate("/");
    } catch (error: any) {
      console.error("Erro ao fazer login:", error.message);
      toast.error(error.message === "Invalid login credentials"
        ? "Credenciais inválidas. Verifique seu email e senha."
        : `Erro ao fazer login: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !name) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    
    try {
      setIsSubmitting(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            apartment,
            block,
          },
        },
      });
      
      if (error) throw error;
      
      toast.success("Cadastro realizado com sucesso! Verifique seu email para confirmar sua conta.");
      setActiveTab("login");
    } catch (error: any) {
      console.error("Erro ao fazer cadastro:", error.message);
      toast.error(`Erro ao fazer cadastro: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast.error("Por favor, insira seu email.");
      return;
    }
    
    try {
      setIsSubmitting(true);
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth?tab=reset-password`,
      });
      
      if (error) throw error;
      
      toast.success("Link de recuperação enviado! Verifique seu email.");
      setResetEmail("");
    } catch (error: any) {
      console.error("Erro ao enviar email de recuperação:", error.message);
      toast.error(`Erro ao enviar email de recuperação: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            ConexãoCondomínio
          </h1>
          <p className="text-muted-foreground mt-2">
            Conectando moradores, fortalecendo comunidades
          </p>
        </div>

        <Card className="border-none shadow-lg">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup" | "reset")}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              <TabsTrigger value="reset">Recuperar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardHeader>
                  <CardTitle>Bem-vindo de volta!</CardTitle>
                  <CardDescription>
                    Entre com sua conta para acessar o aplicativo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Senha</Label>
                      <button 
                        type="button"
                        className="text-sm text-primary hover:underline"
                        onClick={() => setActiveTab("reset")}
                      >
                        Esqueceu a senha?
                      </button>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Entrando..." : "Entrar"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp}>
                <CardHeader>
                  <CardTitle>Crie sua conta</CardTitle>
                  <CardDescription>
                    Junte-se à comunidade do seu condomínio
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nome completo</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Crie uma senha forte"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="apartment">Apartamento</Label>
                      <Input
                        id="apartment"
                        type="text"
                        placeholder="Ex: 101"
                        value={apartment}
                        onChange={(e) => setApartment(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="block">Bloco</Label>
                      <Input
                        id="block"
                        type="text"
                        placeholder="Ex: A"
                        value={block}
                        onChange={(e) => setBlock(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Cadastrando..." : "Cadastrar"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="reset">
              <form onSubmit={handlePasswordReset}>
                <CardHeader>
                  <CardTitle>Recuperar senha</CardTitle>
                  <CardDescription>
                    Digite seu email para receber um link de recuperação
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Enviando..." : "Enviar link de recuperação"}
                  </Button>
                  <Button 
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setActiveTab("login")}
                  >
                    Voltar ao login
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
