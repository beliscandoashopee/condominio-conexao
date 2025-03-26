
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useCredits } from "@/contexts/credits";
import { toast } from "sonner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const PurchaseSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const { fetchCredits, credits, isLoading, error } = useCredits();
  const [retryCount, setRetryCount] = useState(0);
  const [showRetryButton, setShowRetryButton] = useState(false);

  useEffect(() => {
    const handleSuccessfulPurchase = async () => {
      if (!user) {
        navigate("/auth");
        return;
      }

      try {
        // Get session_id from URL query parameters
        const query = new URLSearchParams(location.search);
        const sessionId = query.get("session_id");
        
        if (sessionId) {
          // Fetch the latest credits
          await fetchCredits(user.id);
          
          // If we still don't have credits after first attempt, wait and try again
          if (!credits) {
            setTimeout(async () => {
              await fetchCredits(user.id);
              
              // Set retry button if we still have issues
              setTimeout(() => {
                if (!credits || error) {
                  setShowRetryButton(true);
                }
              }, 2000);
            }, 2000);
          }
          
          // Clear the URL params
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (error) {
        console.error("Error fetching credits:", error);
        toast.error("Erro ao atualizar seus créditos. Por favor, entre em contato com o suporte.");
        setShowRetryButton(true);
      }
    };

    handleSuccessfulPurchase();
  }, [user, fetchCredits, navigate, location.search, retryCount]);

  const handleRetry = async () => {
    if (user) {
      setRetryCount(prev => prev + 1);
      setShowRetryButton(false);
      await fetchCredits(user.id);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
        <div className="container max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold mb-4">Pagamento realizado com sucesso!</h1>
            
            <p className="text-muted-foreground mb-6">
              Seus créditos foram adicionados à sua conta e já estão disponíveis para uso no marketplace.
            </p>
            
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>
                  {error}
                  {showRetryButton && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRetry}
                      className="ml-2"
                    >
                      Tentar novamente
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="bg-muted rounded-md p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-1">Seu saldo atual</p>
              {isLoading ? (
                <div className="flex justify-center items-center py-2">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <p className="text-3xl font-bold">{credits?.balance || 0} créditos</p>
              )}
            </div>
            
            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => navigate("/marketplace")}
              >
                Ir para o Marketplace
                <ArrowRight size={16} className="ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => navigate("/purchase-credits")}
              >
                Comprar mais créditos
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PurchaseSuccess;
