
import React from "react";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CreditHistoryHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold">Meus Créditos</h1>
        <p className="text-muted-foreground mt-1">
          Consulte seu saldo e histórico de transações
        </p>
      </div>

      <Button onClick={() => navigate("/purchase-credits")}>
        <CreditCard className="mr-2 h-4 w-4" />
        Comprar créditos
      </Button>
    </div>
  );
};

export default CreditHistoryHeader;
