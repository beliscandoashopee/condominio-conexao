
import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/user/UserContext";
import { useCheckoutSettings } from "@/hooks/useCheckoutSettings";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const CheckoutSettings = () => {
  const { user, isAdmin } = useUser();
  const navigate = useNavigate();
  const { settings, loading, updateSettings } = useCheckoutSettings();

  React.useEffect(() => {
    if (!user || !isAdmin) {
      navigate("/");
      return;
    }
  }, [user, isAdmin, navigate]);

  const handleToggle = async (setting: string) => {
    if (!settings) return;

    try {
      const updateData: any = {};
      
      if (setting === "pix_enabled" || setting === "credit_card_enabled" || setting === "manual_enabled") {
        // Determine which setting type we're updating
        let type: string = '';
        if (setting === "pix_enabled") type = "pix";
        else if (setting === "credit_card_enabled") type = "credit_card";
        else if (setting === "manual_enabled") type = "manual";
        
        updateData.type = type;
        updateData.enabled = !settings[setting as keyof typeof settings];
      }
      
      await updateSettings(updateData);
      toast.success("Configurações atualizadas com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar configurações:", error);
      toast.error("Erro ao atualizar configurações");
    }
  };

  if (loading) {
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Configurações de Checkout</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Métodos de Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>PIX</Label>
                <p className="text-sm text-gray-500">
                  Permitir pagamentos via PIX
                </p>
              </div>
              <Switch
                checked={!!settings.pix_enabled}
                onCheckedChange={() => handleToggle("pix_enabled")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Cartão de Crédito</Label>
                <p className="text-sm text-gray-500">
                  Permitir pagamentos com cartão de crédito
                </p>
              </div>
              <Switch
                checked={!!settings.credit_card_enabled}
                onCheckedChange={() => handleToggle("credit_card_enabled")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Créditos Manuais</Label>
                <p className="text-sm text-gray-500">
                  Permitir solicitação de créditos manuais
                </p>
              </div>
              <Switch
                checked={!!settings.manual_enabled}
                onCheckedChange={() => handleToggle("manual_enabled")}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutSettings;
