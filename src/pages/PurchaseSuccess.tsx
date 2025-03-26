
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Loader2, AlertCircle, RefreshCw } from "lucide-react";
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
  const [processingPayment, setProcessingPayment] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [initialCredits, setInitialCredits] = useState<number | null>(null);

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
          // Store initial credits value to compare later
          if (credits) {
            setInitialCredits(credits.balance);
          }
          
          // Show processing status
          setProcessingPayment(true);
          
          // First attempt after 3 seconds
          setTimeout(async () => {
            await fetchCredits(user.id);
            
            // Check if credits were updated
            if (credits && initialCredits !== null && credits.balance > initialCredits) {
              setProcessingPayment(false);
              setPaymentStatus('success');
            } else {
              // Second attempt after 5 more seconds
              setTimeout(async () => {
                await fetchCredits(user.id);
                
                // Check again if credits were updated
                if (credits && initialCredits !== null && credits.balance > initialCredits) {
                  setProcessingPayment(false);
                  setPaymentStatus('success');
                } else {
                  // Third attempt after 10 more seconds
                  setTimeout(async () => {
                    await fetchCredits(user.id);
                    
                    if (credits && initialCredits !== null && credits.balance > initialCredits) {
                      setProcessingPayment(false);
                      setPaymentStatus('success');
                    } else {
                      // If still no credits, show retry button
                      setProcessingPayment(false);
                      setPaymentStatus('error');
                      setShowRetryButton(true);
                      console.log("Payment webhook may be delayed. Showing retry option.");
                    }
                  }, 10000);
                }
              }, 5000);
            }
          }, 3000);
          
          // Clear the URL params
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (error) {
        console.error("Error fetching credits:", error);
        toast.error("Erro ao atualizar seus créditos. Por favor, entre em contato com o suporte.");
        setProcessingPayment(false);
        setPaymentStatus('error');
        setShowRetryButton(true);
      }
    };

    handleSuccessfulPurchase();
  }, [user, fetchCredits, navigate, location.search, retryCount, initialCredits, credits]);

  const handleRetry = async () => {
    if (user) {
      setRetryCount(prev => prev + 1);
      setShowRetryButton(false);
      setProcessingPayment(true);
      setPaymentStatus('processing');
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
              {processingPayment ? (
                <Loader2 className="h-12 w-12 text-green-600 animate-spin" />
              ) : paymentStatus === 'success' ? (
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              ) : (
                <AlertCircle className="h-12 w-12 text-amber-600" />
              )}
            </div>
            
            <h1 className="text-2xl font-bold mb-4">
              {processingPayment ? "Processando seu pagamento..." : 
               paymentStatus === 'success' ? "Pagamento realizado com sucesso!" :
               "Aguardando confirmação de pagamento"}
            </h1>
            
            <p className="text-muted-foreground mb-6">
              {processingPayment ? 
                "Estamos processando seu pagamento e adicionando créditos à sua conta. Isso pode levar alguns instantes." : 
                paymentStatus === 'success' ? 
                "Seus créditos foram adicionados à sua conta e já estão disponíveis para uso no marketplace." :
                "O pagamento foi iniciado, mas ainda estamos aguardando a confirmação do processamento."}
            </p>
            
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro na confirmação</AlertTitle>
                <AlertDescription>
                  {error}
                  {showRetryButton && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRetry}
                      className="ml-2 mt-2"
                    >
                      <RefreshCw className="mr-2 h-3 w-3" />
                      Verificar novamente
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            {paymentStatus === 'error' && !error && (
              <Alert variant="default" className="mb-6 border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle>Aguardando confirmação</AlertTitle>
                <AlertDescription>
                  O pagamento pode levar alguns minutos para ser processado pelo sistema financeiro.
                  {showRetryButton && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRetry}
                      className="ml-2 mt-2"
                    >
                      <RefreshCw className="mr-2 h-3 w-3" />
                      Verificar novamente
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="bg-muted rounded-md p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-1">Seu saldo atual</p>
              {isLoading || processingPayment ? (
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
                disabled={processingPayment}
              >
                Ir para o Marketplace
                <ArrowRight size={16} className="ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => navigate("/purchase-credits")}
                disabled={processingPayment}
              >
                Comprar mais créditos
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full" 
                onClick={() => navigate("/credit-history")}
                disabled={processingPayment}
              >
                Ver histórico de créditos
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PurchaseSuccess;
