
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCredits } from "@/contexts/credits/types";
import { CreditBalanceSkeleton } from "./CreditTransactionSkeleton";

type CreditBalanceCardProps = {
  credits: UserCredits | null;
  isLoading: boolean;
};

const CreditBalanceCard = ({ credits, isLoading }: CreditBalanceCardProps) => {
  if (isLoading) {
    return <CreditBalanceSkeleton />;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Saldo atual
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {credits?.balance || 0} créditos
        </div>
      </CardContent>
    </Card>
  );
};

export default CreditBalanceCard;
