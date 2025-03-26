
import React from "react";
import { Link } from "react-router-dom";
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
import { AlertCircle, Loader2, History } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useCredits } from "@/contexts/credits";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const { credits, creditPackages, creditCosts, isLoading, error } = useCredits();
  const [selectedTab, setSelectedTab] = React.useState(defaultTab);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Créditos</DialogTitle>
          <DialogDescription>
            Gerencie seus créditos para anunciar e destacar produtos no marketplace.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

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

              <div className="text-center py-4 px-5 border rounded-lg bg-muted/50">
                <p className="mb-4">
                  Para uma experiência melhor de compra, acesse nossa página dedicada de créditos.
                </p>
                <Button asChild className="w-full">
                  <Link to="/purchase-credits" onClick={() => onOpenChange(false)}>
                    Comprar créditos com cartão
                  </Link>
                </Button>
              </div>

              <div className="grid gap-4">
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  creditPackages.slice(0, 2).map((pkg) => (
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
                        asChild
                        className="w-full mt-3"
                      >
                        <Link to="/purchase-credits" onClick={() => onOpenChange(false)}>
                          Comprar
                        </Link>
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="summary" className="mt-4">
            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-lg p-4">
                <h3 className="font-medium mb-2">Seu saldo</h3>
                {isLoading ? (
                  <div className="flex justify-center py-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <p className="text-3xl font-bold">{credits?.balance || 0} créditos</p>
                )}
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
              
              <div className="space-y-3">
                <Button 
                  asChild
                  className="w-full"
                >
                  <Link to="/purchase-credits" onClick={() => onOpenChange(false)}>
                    Comprar mais créditos
                  </Link>
                </Button>
                
                <Button 
                  asChild
                  variant="outline"
                  className="w-full"
                >
                  <Link to="/credit-history" onClick={() => onOpenChange(false)}>
                    <History className="mr-2 h-4 w-4" />
                    Ver histórico completo
                  </Link>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CreditsDialog;
