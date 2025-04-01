
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useCheckoutSettings } from "@/hooks/useCheckoutSettings";
import { Loader2, CreditCard, Banknote, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";

const CheckoutSettings = () => {
  const { settings, loading, updateSetting } = useCheckoutSettings();

  const handleToggle = async (type: 'pix' | 'credit_card' | 'manual', enabled: boolean) => {
    try {
      await updateSetting(type, enabled);
    } catch (error) {
      console.error("Failed to update setting:", error);
    }
  };

  // Find settings by type
  const findSetting = (type: 'pix' | 'credit_card' | 'manual') => {
    return settings.find(s => s.type === type);
  };

  const pixSetting = findSetting('pix');
  const creditCardSetting = findSetting('credit_card');
  const manualSetting = findSetting('manual');

  if (loading) {
    return (
      <div className="container mx-auto p-6 pt-24 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 pt-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Configurações de Checkout</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* PIX Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Landmark className="h-5 w-5 text-primary" />
                Pagamento via PIX
              </CardTitle>
              <CardDescription>
                Habilite ou desabilite pagamentos via PIX.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <span className={`font-medium ${pixSetting?.enabled ? 'text-green-600' : 'text-red-500'}`}>
                  {pixSetting?.enabled ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-muted-foreground">Ativar/Desativar</span>
                <Switch 
                  checked={pixSetting?.enabled || false}
                  onCheckedChange={(checked) => handleToggle('pix', checked)}
                />
              </div>
            </CardFooter>
          </Card>

          {/* Credit Card Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Cartão de Crédito
              </CardTitle>
              <CardDescription>
                Habilite ou desabilite pagamentos com cartão de crédito.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <span className={`font-medium ${creditCardSetting?.enabled ? 'text-green-600' : 'text-red-500'}`}>
                  {creditCardSetting?.enabled ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-muted-foreground">Ativar/Desativar</span>
                <Switch 
                  checked={creditCardSetting?.enabled || false}
                  onCheckedChange={(checked) => handleToggle('credit_card', checked)}
                />
              </div>
            </CardFooter>
          </Card>

          {/* Manual Payment Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5 text-primary" />
                Pagamento Manual
              </CardTitle>
              <CardDescription>
                Habilite ou desabilite solicitações de crédito manuais.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <span className={`font-medium ${manualSetting?.enabled ? 'text-green-600' : 'text-red-500'}`}>
                  {manualSetting?.enabled ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-muted-foreground">Ativar/Desativar</span>
                <Switch 
                  checked={manualSetting?.enabled || false}
                  onCheckedChange={(checked) => handleToggle('manual', checked)}
                />
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-8">
          <Button variant="outline" onClick={() => window.history.back()}>
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSettings;
