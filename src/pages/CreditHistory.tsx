
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useUser } from "@/contexts/UserContext";
import { useCredits } from "@/contexts/credits/CreditsContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import CreditHistoryHeader from "@/components/credits/CreditHistoryHeader";
import CreditSummaryCards from "@/components/credits/CreditSummaryCards";
import CreditTransactionTable from "@/components/credits/CreditTransactionTable";

// Define the transaction type
interface CreditTransaction {
  id: string;
  amount: number;
  created_at: string;
  description: string | null;
  type: string;
  package_name?: string;
}

const CreditHistory = () => {
  const { user } = useUser();
  const { credits, loading: creditsLoading } = useCredits();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        // Fetch credit transactions with package details if available
        const { data, error } = await supabase
          .from("credit_transactions")
          .select(`
            *,
            credit_packages(name)
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Transform the data to include package name if available
        const transformedData = data.map((transaction) => ({
          ...transaction,
          package_name: transaction.credit_packages?.name,
        }));

        setTransactions(transformedData);
      } catch (err: any) {
        console.error("Error fetching transactions:", err.message);
        setError("Não foi possível carregar o histórico de transações.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <CreditHistoryHeader />
          
          <CreditSummaryCards 
            credits={credits}
            transactions={transactions}
            isLoadingCredits={creditsLoading}
            isLoadingTransactions={isLoading}
          />
          
          <CreditTransactionTable 
            transactions={transactions}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </main>
    </div>
  );
};

export default CreditHistory;
