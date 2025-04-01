import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CreditCard, ShoppingCart, ChevronLeft, AlertCircle, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { useCredits } from "@/contexts/credits";
import { useCheckout } from "@/contexts/checkout/CheckoutContext";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

const PurchaseCredits = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { creditPackages, fetchCredits } = useCredits();
  const { settings } = useCheckout();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  React.useEffect(() => {
    if (!user) {
      toast.error("Você precisa estar logado para comprar créditos");
      navigate("/auth");
    }
  }, [user, navigate]);

  const handlePurchase = async (packageId: string) => {
    if (!user) {
      toast.error("Você precisa estar logado para comprar créditos");
      navigate("/auth");
      return;
    }

    setIsLoading(packageId);
    setError(null);
    
    // Show toast immediately to provide feedback
    const loadingToastId = toast.loading("Preparando checkout...");

    try {
      const selectedPackage = creditPackages.find(pkg => pkg.id === packageId);
      if (!selectedPackage) {
        throw new Error("Pacote não encontrado");
      }

      console.log("Iniciando checkout para pacote:", selectedPackage.name);

      // Set timeout to ensure we don't wait forever - increased to 15 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Tempo de espera excedido. Tente novamente.")), 15000);
      });

      // Create checkout session with timeout
      const checkoutPromise = supabase.functions.invoke("stripe-checkout", {
        body: {
          packageId: selectedPackage.id,
          userId: user.id,
          amount: selectedPackage.credits,
          price: selectedPackage.price,
          name: selectedPackage.name
        }
      });

      // Race between checkout and timeout
      const { data, error: functionError } = await Promise.race([
        checkoutPromise,
        timeoutPromise.then(() => { throw new Error("Tempo de espera excedido. Tente novamente."); })
      ]) as any;

      toast.dismiss(loadingToastId);

      if (functionError) {
        console.error("Erro na função de checkout:", functionError);
        throw new Error(functionError.message || "Erro ao processar o pagamento");
      }

      if (!data?.url) {
        console.error("URL de checkout não retornada:", data);
        throw new Error("Não foi possível criar a sessão de pagamento");
      }

      console.log("Redirecionando para URL de checkout:", data.url);
      toast.success("Redirecionando para o checkout...");
      
      // Add a small delay before redirect to ensure toast is visible
      setTimeout(() => {
        // Use window.location.href for a full page redirect
        window.location.href = data.url;
      }, 500);
      
    } catch (err: any) {
      toast.dismiss(loadingToastId);
      console.error("Erro ao processar pagamento:", err);
      
      // Check if it's a network error
      if (err.message?.includes("Failed to fetch") || err.message?.includes("Network Error")) {
        setError("Erro de conexão. Verifique sua internet e tente novamente.");
      } else if (err.message?.includes("tempo de espera")) {
        setError("O servidor demorou para responder. Tente novamente em alguns instantes.");
      } else if (err.details) {
        // If we have detailed error information from Stripe
        setError(`Erro do Stripe: ${err.details}`);
      } else {
        setError(err.message || "Não foi possível processar o pagamento");
      }
      
      toast.error("Não foi possível processar o pagamento. Tente novamente mais tarde.");
    } finally {
      setIsLoading(null);
    }
  };

  // Function to retry payment if it fails
  const handleRetry = () => {
    setError(null);
    setRetryCount(prev => prev + 1);
  };

  useEffect(() => {
    const handleSuccessfulPurchase = async () => {
      const query = new URLSearchParams(window.location.search);
      const sessionId = query.get("session_id");
      
      if (sessionId && user) {
        toast.success("Pagamento processado com sucesso!");
        await fetchCredits(user.id);
        
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handleSuccessfulPurchase();
  }, [user, fetchCredits]);

  // Verifica se o pagamento com cartão está habilitado
  const isCardPaymentEnabled = settings.find(s => s.type === 'credit_card')?.enabled;
  // Verifica se o pagamento manual está habilitado
  const isManualPaymentEnabled = settings.find(s => s.type === 'manual')?.enabled;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-start mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ChevronLeft size={18} className="mr-2" />
              Voltar
            </Button>
            
            <h1 className="text-3xl font-bold">Comprar Créditos</h1>
            <p className="text-muted-foreground mt-1">
              Escolha um pacote de créditos para utilizar no marketplace
            </p>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetry}
                  className="ml-2"
                >
                  Tentar novamente
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          {isCardPaymentEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {creditPackages.map((pkg) => (
                <Card key={pkg.id} className={`overflow-hidden transition-all duration-200 ${isLoading === pkg.id ? 'opacity-70' : 'hover:shadow-md'}`}>
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                    <CardTitle>{pkg.name}</CardTitle>
                    <CardDescription>
                      Pacote com {pkg.credits} créditos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Quantidade</p>
                        <p className="text-2xl font-bold">{pkg.credits} <span className="text-sm font-normal text-muted-foreground">créditos</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Preço</p>
                        <p className="text-2xl font-bold">R$ {pkg.price.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/30 pt-4">
                    <Button 
                      className="w-full"
                      onClick={() => handlePurchase(pkg.id)}
                      disabled={isLoading !== null}
                    >
                      {isLoading === pkg.id ? (
                        <>
                          <Loader2 size={18} className="mr-2 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <CreditCard size={18} className="mr-2" />
                          Comprar com Cartão
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* Seção de Compra Manual */}
          {isManualPaymentEnabled && (
            <div className="mt-12 bg-muted/50 rounded-lg p-6 max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Compra Manual de Créditos</h2>
                  <p className="text-muted-foreground mt-1">
                    Prefere comprar créditos através de outros métodos de pagamento?
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/manual-credit-request')}
                  className="flex items-center gap-2"
                >
                  <Wallet size={18} />
                  Solicitar Créditos Manualmente
                </Button>
              </div>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Wallet className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Métodos de Pagamento Aceitos</h3>
                    <p className="text-muted-foreground">
                      Aceitamos PIX, transferência bancária e pagamento em dinheiro. 
                      Após o pagamento, um administrador irá aprovar sua solicitação.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-12 bg-muted/50 rounded-lg p-6 max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Informações sobre créditos</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <ShoppingCart className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">Como funcionam os créditos?</h3>
                  <p className="text-muted-foreground">
                    Os créditos são utilizados para criar anúncios e destacar seus produtos no marketplace do condomínio.
                    Diferentes ações no marketplace consomem diferentes quantidades de créditos.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <CreditCard className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">Pagamento seguro</h3>
                  <p className="text-muted-foreground">
                    Todos os pagamentos são processados de forma segura pelo Stripe, uma plataforma 
                    líder mundial em processamento de pagamentos online.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PurchaseCredits;
