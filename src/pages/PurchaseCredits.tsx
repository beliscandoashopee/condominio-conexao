
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CreditCard, ShoppingCart, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { useCredits } from "@/contexts/credits";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertCircle } from "@/components/ui/alert";

const PurchaseCredits = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { creditPackages, fetchCredits } = useCredits();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not logged in
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

    try {
      const selectedPackage = creditPackages.find(pkg => pkg.id === packageId);
      if (!selectedPackage) {
        throw new Error("Pacote não encontrado");
      }

      console.log("Iniciando checkout para pacote:", selectedPackage.name);

      // Call the Stripe checkout edge function
      const { data, error: functionError } = await supabase.functions.invoke("stripe-checkout", {
        body: {
          packageId: selectedPackage.id,
          userId: user.id,
          amount: selectedPackage.credits,
          price: selectedPackage.price,
          name: selectedPackage.name
        }
      });

      if (functionError) {
        console.error("Erro na função de checkout:", functionError);
        throw new Error(functionError.message || "Erro ao processar o pagamento");
      }

      if (!data?.url) {
        console.error("URL de checkout não retornada:", data);
        throw new Error("Não foi possível criar a sessão de pagamento");
      }

      console.log("Redirecionando para URL de checkout:", data.url);
      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (err: any) {
      console.error("Erro ao processar pagamento:", err);
      setError(err.message || "Não foi possível processar o pagamento");
      toast.error("Não foi possível processar o pagamento. Tente novamente mais tarde.");
    } finally {
      setIsLoading(null);
    }
  };

  // If user came back from successful purchase
  React.useEffect(() => {
    const handleSuccessfulPurchase = async () => {
      const query = new URLSearchParams(window.location.search);
      const sessionId = query.get("session_id");
      
      if (sessionId && user) {
        toast.success("Pagamento processado com sucesso!");
        await fetchCredits(user.id);
        
        // Clear the URL params
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handleSuccessfulPurchase();
  }, [user, fetchCredits]);

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
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
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
