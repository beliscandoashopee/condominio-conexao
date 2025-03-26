
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useCredits } from "@/contexts/credits";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MarketplaceHeaderProps {
  onCreateAdClick: () => void;
  onCreditDialogOpen: () => void;
}

const MarketplaceHeader: React.FC<MarketplaceHeaderProps> = ({
  onCreateAdClick,
  onCreditDialogOpen,
}) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { credits, hasEnoughCredits, error } = useCredits();

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground mt-1">
            Encontre produtos e serviços oferecidos pelos moradores do seu condomínio
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {user && credits && (
            <div className="bg-secondary rounded-md px-3 py-1.5 text-sm">
              <span className="font-semibold">{credits.balance}</span> créditos disponíveis
            </div>
          )}
          
          <Button 
            onClick={() => {
              if (!user) {
                toast.error("Você precisa estar logado para criar um anúncio.");
                navigate("/auth");
                return;
              }
              
              if (!hasEnoughCredits("create_ad")) {
                onCreditDialogOpen();
                return;
              }
              
              onCreateAdClick();
            }} 
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Plus size={16} className="mr-2" />
            Criar anúncio
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default MarketplaceHeader;
