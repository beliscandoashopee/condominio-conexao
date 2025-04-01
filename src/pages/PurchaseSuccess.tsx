
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ArrowRight, CreditCard, ShoppingBag } from "lucide-react";
import { useCredits } from "@/contexts/credits";
import { useUser } from "@/contexts/user/UserContext";

const PurchaseSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();
  const { refetchCredits, credits } = useCredits();

  // Get the package data from location state
  const packageData = location.state?.packageData;
  const paymentMethod = location.state?.paymentMethod;

  useEffect(() => {
    if (!packageData) {
      navigate("/purchase-credits");
      return;
    }

    // Refetch credits to get updated balance
    if (user?.id) {
      refetchCredits();
    }

    // Show success toast
    toast({
      title: "Compra realizada com sucesso!",
      description: `Você adquiriu ${packageData.credits} créditos.`,
      variant: "default",
    });
  }, [packageData, user?.id, toast, navigate, refetchCredits]);

  if (!packageData) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-16 mt-8">
      <div className="max-w-md mx-auto">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-center">Pagamento Confirmado!</h1>
          <p className="text-muted-foreground text-center mt-2">
            Sua compra de créditos foi processada com sucesso.
          </p>
        </div>

        <Card className="mb-8 border-green-200 shadow-md">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-muted-foreground">Pacote</span>
                <span className="font-medium">{packageData.name}</span>
              </div>
              
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-muted-foreground">Valor</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(packageData.price)}
                </span>
              </div>
              
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-muted-foreground">Método</span>
                <span className="font-medium flex items-center">
                  <CreditCard className="h-4 w-4 mr-1" />
                  {paymentMethod || "Cartão de Crédito"}
                </span>
              </div>
              
              <div className="flex justify-between items-center pb-4">
                <span className="text-muted-foreground">Créditos adicionados</span>
                <span className="font-bold text-primary">{packageData.credits}</span>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <span className="text-muted-foreground">Seu saldo atual</span>
                <span className="font-bold text-lg text-primary">
                  {credits?.balance || 0} créditos
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <Button
            className="w-full"
            onClick={() => navigate("/marketplace")}
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Ir para o Marketplace
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/credit-history")}
          >
            Ver Histórico de Créditos
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccess;
