
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { useCredits } from "@/contexts/CreditsContext";

interface CreditsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: string;
}

const CreditsDialog: React.FC<CreditsDialogProps> = ({
  isOpen,
  onOpenChange,
  defaultTab = "buy"
}) => {
  const { user } = useUser();
  const { credits, creditPackages, creditCosts, purchaseCredits } = useCredits();
  const [selectedTab, setSelectedTab] = React.useState(defaultTab);
  
  const handlePurchaseCredits = async (packageId: string) => {
    if (!user) return;
    const success = await purchaseCredits(packageId, user.id);
    if (success) {
      setSelectedTab("summary");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Créditos</DialogTitle>
          <DialogDescription>
            Gerencie seus créditos para anunciar e destacar produtos no marketplace.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy">Comprar créditos</TabsTrigger>
            <TabsTrigger value="summary">Resumo</TabsTrigger>
          </TabsList>
          
          <TabsContent value="buy" className="mt-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-2">
                Escolha um pacote de créditos para continuar utilizando o marketplace:
              </p>

              <div className="grid gap-4">
                {creditPackages.map((pkg) => (
                  <div key={pkg.id} className="border rounded-lg p-4 hover:border-primary transition-colors">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{pkg.name}</h3>
                        <p className="text-2xl font-bold mt-1">
                          {pkg.credits} <span className="text-sm font-normal text-muted-foreground">créditos</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Preço</p>
                        <p className="text-lg font-semibold">R$ {pkg.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handlePurchaseCredits(pkg.id)} 
                      className="w-full mt-3"
                    >
                      Comprar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="summary" className="mt-4">
            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-lg p-4">
                <h3 className="font-medium mb-2">Seu saldo</h3>
                <p className="text-3xl font-bold">{credits?.balance || 0} créditos</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Custos das ações</h3>
                <div className="space-y-2">
                  {creditCosts.map((cost) => (
                    <div key={cost.id} className="flex justify-between text-sm">
                      <span>{cost.description || cost.action_type}</span>
                      <span className="font-medium">{cost.cost} créditos</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <Button 
                onClick={() => setSelectedTab("buy")} 
                className="w-full"
              >
                Comprar mais créditos
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CreditsDialog;
