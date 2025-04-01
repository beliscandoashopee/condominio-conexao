
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CreditCard, Receipt, ArrowLeft, Landmark } from "lucide-react";
import { useUser } from "@/contexts/user/UserContext";
import { useCredits } from "@/contexts/credits";
import { useCheckoutSettings } from "@/hooks/useCheckoutSettings";
import { useToast } from "@/components/ui/use-toast";

const PurchaseCredits = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { creditPackages, purchaseCredits } = useCredits();
  const { settings, loading: loadingSettings } = useCheckoutSettings();
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("credit_card");
  
  // Find enabled payment methods
  const findSetting = (type: 'pix' | 'credit_card' | 'manual') => {
    return settings.find(s => s.type === type);
  };

  const pixEnabled = findSetting('pix')?.enabled || false;
  const creditCardEnabled = findSetting('credit_card')?.enabled || false;
  const manualEnabled = findSetting('manual')?.enabled || false;

  // Set default payment method to the first enabled one
  useEffect(() => {
    if (creditCardEnabled) {
      setPaymentMethod("credit_card");
    } else if (pixEnabled) {
      setPaymentMethod("pix");
    } else if (manualEnabled) {
      setPaymentMethod("manual");
    }
  }, [creditCardEnabled, pixEnabled, manualEnabled]);

  const handlePurchase = async () => {
    if (!selectedPackage || !user?.id) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Selecione um pacote de créditos para continuar.",
      });
      return;
    }

    if (paymentMethod === "manual") {
      navigate("/manual-credit-request");
      return;
    }

    const success = await purchaseCredits(selectedPackage, user.id);
    
    if (success) {
      const packageData = creditPackages.find(p => p.id === selectedPackage);
      navigate("/purchase-success", { 
        state: { 
          packageData,
          paymentMethod: paymentMethod === "credit_card" ? "Cartão de Crédito" : "PIX"
        } 
      });
    } else {
      toast({
        variant: "destructive",
        title: "Erro na compra",
        description: "Não foi possível processar sua compra. Tente novamente.",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 mt-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">Comprar Créditos</h1>
          <p className="text-muted-foreground mt-2">
            Escolha um pacote de créditos e a forma de pagamento
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {creditPackages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedPackage === pkg.id ? "border-primary ring-2 ring-primary ring-opacity-50" : ""
              }`}
              onClick={() => setSelectedPackage(pkg.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle>{pkg.name}</CardTitle>
                <CardDescription>
                  {pkg.credits} créditos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(pkg.price)}
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant={selectedPackage === pkg.id ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setSelectedPackage(pkg.id)}
                >
                  {selectedPackage === pkg.id ? "Selecionado" : "Selecionar"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {selectedPackage && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Método de Pagamento</CardTitle>
              <CardDescription>
                Escolha como deseja pagar pelos seus créditos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={paymentMethod} onValueChange={setPaymentMethod}>
                <TabsList className="grid w-full grid-cols-3">
                  {creditCardEnabled && (
                    <TabsTrigger value="credit_card" disabled={!creditCardEnabled}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Cartão
                    </TabsTrigger>
                  )}
                  {pixEnabled && (
                    <TabsTrigger value="pix" disabled={!pixEnabled}>
                      <Landmark className="h-4 w-4 mr-2" />
                      PIX
                    </TabsTrigger>
                  )}
                  {manualEnabled && (
                    <TabsTrigger value="manual" disabled={!manualEnabled}>
                      <Receipt className="h-4 w-4 mr-2" />
                      Manual
                    </TabsTrigger>
                  )}
                </TabsList>
                
                <TabsContent value="credit_card" className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Seu pagamento será processado de forma segura com cartão de crédito.
                  </p>
                </TabsContent>
                
                <TabsContent value="pix" className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Pague instantaneamente usando o PIX.
                  </p>
                </TabsContent>
                
                <TabsContent value="manual" className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Envie uma solicitação manual que será revisada por nossa equipe.
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button onClick={handlePurchase} className="w-full">
                {paymentMethod === "manual" 
                  ? "Ir para Solicitação Manual" 
                  : "Finalizar Compra"}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PurchaseCredits;
