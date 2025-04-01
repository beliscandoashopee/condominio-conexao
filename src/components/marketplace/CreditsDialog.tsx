
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCredits } from "@/contexts/credits";

export interface CreditsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreditsDialog: React.FC<CreditsDialogProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const { credits, loading } = useCredits();

  const handlePurchaseClick = () => {
    onOpenChange(false);
    navigate('/purchase-credits');
  };

  const handleRequestClick = () => {
    onOpenChange(false);
    navigate('/manual-credit-request');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Créditos Insuficientes
          </DialogTitle>
          <DialogDescription>
            Você não possui créditos suficientes para realizar esta ação.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-sm font-medium">
                Seu saldo atual:&nbsp;
                <span className="text-primary">
                  {loading ? "Carregando..." : `${credits?.balance || 0} créditos`}
                </span>
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Adquira mais créditos para continuar utilizando todas as funcionalidades do marketplace.
          </p>
        </div>

        <DialogFooter className="sm:justify-start gap-2 mt-2">
          <Button type="button" variant="default" onClick={handlePurchaseClick}>
            Comprar Créditos
          </Button>
          <Button type="button" variant="outline" onClick={handleRequestClick}>
            Solicitar Manualmente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreditsDialog;
