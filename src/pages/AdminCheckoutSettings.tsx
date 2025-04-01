import React from 'react';
import { useCheckout } from '@/contexts/checkout/CheckoutContext';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Wallet, QrCode } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const checkoutTypeInfo = {
  credit_card: {
    title: 'Cartão de Crédito',
    description: 'Pagamentos via Stripe',
    icon: CreditCard,
  },
  manual: {
    title: 'Pagamento Manual',
    description: 'PIX, transferência bancária e dinheiro',
    icon: Wallet,
  },
  pix: {
    title: 'PIX',
    description: 'Pagamento instantâneo',
    icon: QrCode,
  },
};

const AdminCheckoutSettings = () => {
  const { settings, isLoading, error, updateSetting } = useCheckout();

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Configurações de Checkout</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie os métodos de pagamento disponíveis no sistema
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {settings.map((setting) => {
          const info = checkoutTypeInfo[setting.type];
          const Icon = info.icon;

          return (
            <Card key={setting.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <CardTitle>{info.title}</CardTitle>
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-6 w-10" />
                  ) : (
                    <Switch
                      checked={setting.enabled}
                      onCheckedChange={(checked) => updateSetting(setting.type, checked)}
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{info.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminCheckoutSettings; 