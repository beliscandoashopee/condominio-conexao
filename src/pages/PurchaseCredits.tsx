import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/user/UserContext";
import { useCredits } from "@/contexts/credits/CreditsProvider";
import { useCheckoutSettings } from "@/hooks/useCheckoutSettings";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const PurchaseCredits = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { creditPackages, loading: packagesLoading, purchaseCredits } = useCredits();
  const { settings, loading: settingsLoading } = useCheckoutSettings();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
  }, [user, navigate]);

  const handlePurchase = async (packageId: string) => {
    if (!user || !settings) return;

    setProcessing(true);
    try {
      const success = await purchaseCredits(packageId);
      if (success) {
        toast.success("Créditos comprados com sucesso!");
        navigate("/purchase-success");
      } else {
        toast.error("Erro ao comprar créditos. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao comprar créditos:", error);
      toast.error("Erro ao processar pagamento");
    } finally {
      setProcessing(false);
    }
  };

  if (packagesLoading || settingsLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">
            Erro ao carregar configurações
          </h2>
          <p className="text-gray-500 mt-2">
            Não foi possível carregar as configurações de checkout.
          </p>
        </div>
      </div>
    );
  }

  const availablePaymentMethods = [
    settings.pix_enabled && "PIX",
    settings.credit_card_enabled && "Cartão de Crédito",
    settings.manual_enabled && "Créditos Manuais",
  ].filter(Boolean);

  if (availablePaymentMethods.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">
            Pagamentos Temporariamente Desativados
          </h2>
          <p className="text-gray-500 mt-2">
            Todos os métodos de pagamento estão temporariamente desativados.
            Por favor, tente novamente mais tarde.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Comprar Créditos</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {creditPackages.map((pkg) => (
          <Card key={pkg.id}>
            <CardHeader>
              <CardTitle>{pkg.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">
                R$ {pkg.price.toFixed(2)}
              </div>
              <div className="text-gray-500 mb-6">
                {pkg.credits} créditos
              </div>
              <Button
                className="w-full"
                onClick={() => handlePurchase(pkg.id)}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Comprar"
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {settings.manual_enabled && (
        <div className="mt-8 text-center">
          <p className="text-gray-500 mb-4">
            Prefere solicitar créditos manualmente?
          </p>
          <Button
            variant="outline"
            onClick={() => navigate("/manual-credit-request")}
          >
            Solicitar Créditos Manualmente
          </Button>
        </div>
      )}
    </div>
  );
};

export default PurchaseCredits;
