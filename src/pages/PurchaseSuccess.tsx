
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useCredits } from "@/contexts/credits";

const PurchaseSuccess = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { fetchCredits, credits } = useCredits();

  useEffect(() => {
    if (user) {
      fetchCredits(user.id);
    } else {
      navigate("/auth");
    }
  }, [user, fetchCredits, navigate]);

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
            
            <div className="bg-muted rounded-md p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-1">Seu saldo atual</p>
              <p className="text-3xl font-bold">{credits?.balance || 0} créditos</p>
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
