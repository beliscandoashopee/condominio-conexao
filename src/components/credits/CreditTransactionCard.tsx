
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CreditTransactionItemSkeleton } from "./CreditTransactionSkeleton";

type Transaction = {
  id: string;
  amount: number;
  created_at: string;
  description: string | null;
  type: string;
  package_name?: string;
};

type CreditTransactionCardProps = {
  title: string;
  type: "purchase" | "spend";
  transactions: Transaction[];
  isLoading: boolean;
};

const CreditTransactionCard = ({ 
  title, 
  type, 
  transactions, 
  isLoading 
}: CreditTransactionCardProps) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR });
  };

  const transaction = transactions.filter(t => t.type === type)[0];

  if (isLoading) {
    return <CreditTransactionItemSkeleton />;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          {transaction ? (
            <>
              <div className={`text-2xl font-bold ${type === "spend" ? "text-destructive" : ""}`}>
                {type === "purchase" ? "+" : ""}{transaction.amount} créditos
              </div>
              <div className="text-sm text-muted-foreground mt-1 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {formatDate(transaction.created_at)}
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              Nenhum{type === "purchase" ? "a compra" : " gasto"} realizado
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CreditTransactionCard;
