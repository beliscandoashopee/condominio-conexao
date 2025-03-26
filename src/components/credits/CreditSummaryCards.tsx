
import React from "react";
import CreditBalanceCard from "./CreditBalanceCard";
import CreditTransactionCard from "./CreditTransactionCard";
import { UserCredits } from "@/contexts/credits/types";

type Transaction = {
  id: string;
  amount: number;
  created_at: string;
  description: string | null;
  type: string;
  package_name?: string;
};

type CreditSummaryCardsProps = {
  credits: UserCredits | null;
  transactions: Transaction[];
  isLoadingCredits: boolean;
  isLoadingTransactions: boolean;
};

const CreditSummaryCards = ({
  credits,
  transactions,
  isLoadingCredits,
  isLoadingTransactions
}: CreditSummaryCardsProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
      <CreditBalanceCard credits={credits} isLoading={isLoadingCredits} />
      
      <CreditTransactionCard
        title="Última compra"
        type="purchase"
        transactions={transactions}
        isLoading={isLoadingTransactions}
      />
      
      <CreditTransactionCard
        title="Último gasto"
        type="spend"
        transactions={transactions}
        isLoading={isLoadingTransactions}
      />
    </div>
  );
};

export default CreditSummaryCards;
