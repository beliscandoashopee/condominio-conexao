
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, PackageCheck, CreditCard, Home, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCredits } from '@/contexts/credits/CreditsContext';
import { Layout } from '@/components/Layout';

interface LocationState {
  packageName?: string;
  credits?: number;
  price?: number;
}

export default function PurchaseSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refetchCredits, credits, loading } = useCredits();
  const [countdown, setCountdown] = useState(10);
  
  // Get purchase details from location state
  const state = location.state as LocationState | null;
  const packageName = state?.packageName || 'Pacote de Créditos';
  const packageCredits = state?.credits || 0;
  const packagePrice = state?.price || 0;

  useEffect(() => {
    // Refresh credits after successful purchase
    refetchCredits();
    
    // Set up countdown for auto-redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [refetchCredits, navigate]);

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 pt-20 pb-12">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-4">
            <CheckCircle2 className="h-20 w-20 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Compra Realizada com Sucesso!</h1>
          <p className="text-gray-600 max-w-md">
            Seus créditos foram adicionados à sua conta e já estão disponíveis para uso.
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Detalhes da Compra</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-500">Pacote</p>
                    <p className="font-medium">{packageName}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <PackageCheck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-500">Créditos Adquiridos</p>
                    <p className="font-medium">{packageCredits} créditos</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-500">Valor Pago</p>
                    <p className="font-medium">R$ {packagePrice.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Saldo Atual</h3>
                {loading ? (
                  <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <p className="text-2xl font-bold text-primary">{credits} créditos</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Você pode usar seus créditos para publicar anúncios e utilizar outros recursos do marketplace.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => navigate('/')} className="gap-2">
            <Home className="h-4 w-4" />
            Ir para a Página Inicial
          </Button>
          
          <Button 
            onClick={() => navigate('/marketplace')}
            variant="outline"
            className="gap-2"
          >
            <Package className="h-4 w-4" />
            Explorar Marketplace
          </Button>
        </div>
        
        <p className="text-center text-sm text-gray-500 mt-6">
          Redirecionando para a página inicial em {countdown} segundos...
        </p>
      </div>
    </Layout>
  );
}
