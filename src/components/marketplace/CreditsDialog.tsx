
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCredits } from '@/contexts/credits/CreditsContext';
import { CreditCard, DollarSign, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CreditsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreditsDialog({ open, onOpenChange }: CreditsDialogProps) {
  const [option, setOption] = useState<'buy' | 'manual' | null>(null);
  const { credits, loading } = useCredits();
  const navigate = useNavigate();

  const handleBuyCredits = () => {
    onOpenChange(false);
    navigate('/purchase-credits');
  };

  const handleManualRequest = () => {
    onOpenChange(false);
    navigate('/manual-credit-request');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adquirir Créditos</DialogTitle>
          <DialogDescription>
            Escolha como deseja obter mais créditos para usar no marketplace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">Seu saldo atual:</span>
            {loading ? (
              <div className="h-6 w-16 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <span className="text-lg font-bold">{credits} créditos</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${option === 'buy' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
              onClick={() => setOption('buy')}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium text-center">Comprar com Cartão</h3>
                <p className="text-sm text-center text-gray-500">
                  Adquira créditos rapidamente usando cartão de crédito
                </p>
              </div>
            </div>

            <div 
              className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${option === 'manual' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
              onClick={() => setOption('manual')}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium text-center">Solicitação Manual</h3>
                <p className="text-sm text-center text-gray-500">
                  Solicite créditos via PIX, transferência ou dinheiro
                </p>
              </div>
            </div>
          </div>

          {credits <= 0 && (
            <div className="flex items-center gap-2 p-3 border border-yellow-300 bg-yellow-50 rounded-md">
              <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
              <p className="text-sm text-yellow-700">
                Você não tem créditos suficientes para usar todas as funcionalidades do app.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          
          {option === 'buy' && (
            <Button onClick={handleBuyCredits} disabled={loading}>
              {loading ? 'Carregando...' : 'Continuar para pagamento'}
            </Button>
          )}
          
          {option === 'manual' && (
            <Button onClick={handleManualRequest} disabled={loading}>
              {loading ? 'Carregando...' : 'Fazer solicitação'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
