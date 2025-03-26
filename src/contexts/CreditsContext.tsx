
import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type CreditPackage = {
  id: string;
  name: string;
  credits: number;
  price: number;
  active: boolean;
};

type CreditCost = {
  id: string;
  action_type: string;
  cost: number;
  description: string | null;
};

type UserCredits = {
  balance: number;
};

type CreditsContextType = {
  credits: UserCredits | null;
  creditPackages: CreditPackage[];
  creditCosts: CreditCost[];
  fetchCredits: (userId: string) => Promise<void>;
  fetchCreditPackages: () => Promise<void>;
  fetchCreditCosts: () => Promise<void>;
  purchaseCredits: (packageId: string, userId: string) => Promise<boolean>;
  spendCredits: (actionType: string, userId: string, amount?: number) => Promise<boolean>;
  hasEnoughCredits: (actionType: string) => boolean;
  getCreditCost: (actionType: string) => number;
};

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

export const CreditsProvider = ({ children }: { children: React.ReactNode }) => {
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);
  const [creditCosts, setCreditCosts] = useState<CreditCost[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Buscar pacotes de créditos e custos das ações (não dependem do usuário)
    fetchCreditPackages();
    fetchCreditCosts();
  }, []);

  const fetchCredits = async (userId: string) => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from("user_credits")
        .select("balance")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 é o código para 'não encontrado'
        throw error;
      }

      if (data) {
        setCredits({ balance: data.balance });
      } else {
        // Se o usuário não tem um registro de créditos, cria um com saldo zero
        const { data: newCredits, error: insertError } = await supabase
          .from("user_credits")
          .insert([{ user_id: userId, balance: 0 }])
          .select("balance")
          .single();

        if (insertError) {
          throw insertError;
        }

        if (newCredits) {
          setCredits({ balance: newCredits.balance });
        }
      }
    } catch (error: any) {
      console.error("Erro ao buscar créditos do usuário:", error.message);
      toast.error("Não foi possível carregar seus créditos.");
    }
  };

  const fetchCreditPackages = async () => {
    try {
      const { data, error } = await supabase
        .from("credit_packages")
        .select("*")
        .eq("active", true)
        .order("credits", { ascending: true });

      if (error) {
        throw error;
      }

      setCreditPackages(data || []);
    } catch (error: any) {
      console.error("Erro ao buscar pacotes de créditos:", error.message);
    }
  };

  const fetchCreditCosts = async () => {
    try {
      const { data, error } = await supabase
        .from("credit_costs")
        .select("*");

      if (error) {
        throw error;
      }

      setCreditCosts(data || []);
    } catch (error: any) {
      console.error("Erro ao buscar custos das ações:", error.message);
    }
  };

  const purchaseCredits = async (packageId: string, userId: string): Promise<boolean> => {
    if (!userId) {
      toast.error("Você precisa estar logado para comprar créditos.");
      return false;
    }

    try {
      setIsLoading(true);
      
      // Buscar o pacote selecionado
      const selectedPackage = creditPackages.find(pkg => pkg.id === packageId);
      if (!selectedPackage) {
        throw new Error("Pacote não encontrado.");
      }

      // Simular uma transação de pagamento (aqui seria integrado com gateway de pagamento)
      // Para simulação, vamos considerar que o pagamento foi aprovado

      // Iniciar uma transação no banco de dados
      const { data: transaction, error: transactionError } = await supabase
        .from("credit_transactions")
        .insert([{
          user_id: userId,
          package_id: packageId,
          amount: selectedPackage.credits,
          type: "purchase",
          description: `Compra do pacote ${selectedPackage.name}`
        }])
        .select()
        .single();

      if (transactionError) {
        throw transactionError;
      }

      // Atualizar o saldo de créditos do usuário
      const { data: updatedCredits, error: updateError } = await supabase.rpc(
        "update_user_credits",
        { 
          p_user_id: userId, 
          p_amount: selectedPackage.credits 
        }
      );

      if (updateError) {
        throw updateError;
      }

      // Buscar o saldo atualizado
      await fetchCredits(userId);
      
      toast.success(`Você adquiriu ${selectedPackage.credits} créditos!`);
      return true;
    } catch (error: any) {
      console.error("Erro ao comprar créditos:", error.message);
      toast.error("Não foi possível completar a compra de créditos.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const spendCredits = async (actionType: string, userId: string, amount?: number): Promise<boolean> => {
    if (!userId) {
      toast.error("Você precisa estar logado para realizar esta ação.");
      return false;
    }

    if (!credits) {
      await fetchCredits(userId);
      if (!credits) {
        toast.error("Não foi possível verificar seu saldo de créditos.");
        return false;
      }
    }

    try {
      setIsLoading(true);
      
      // Buscar o custo da ação
      const costEntry = creditCosts.find(cost => cost.action_type === actionType);
      if (!costEntry) {
        throw new Error("Tipo de ação não encontrado.");
      }

      // Usar o valor específico se fornecido, ou o custo padrão da ação
      const creditsToSpend = amount || costEntry.cost;
      
      // Verificar se o usuário tem créditos suficientes
      if (credits.balance < creditsToSpend) {
        toast.error(`Você não tem créditos suficientes. Necessários: ${creditsToSpend}`);
        return false;
      }

      // Registrar a transação de gasto
      const { error: transactionError } = await supabase
        .from("credit_transactions")
        .insert([{
          user_id: userId,
          amount: -creditsToSpend,
          type: "spend",
          description: `${costEntry.description || actionType}`
        }]);

      if (transactionError) {
        throw transactionError;
      }

      // Atualizar o saldo de créditos do usuário
      const { error: updateError } = await supabase.rpc(
        "update_user_credits",
        { 
          p_user_id: userId, 
          p_amount: -creditsToSpend 
        }
      );

      if (updateError) {
        throw updateError;
      }

      // Buscar o saldo atualizado
      await fetchCredits(userId);
      
      toast.success(`${creditsToSpend} créditos foram utilizados.`);
      return true;
    } catch (error: any) {
      console.error("Erro ao gastar créditos:", error.message);
      toast.error("Não foi possível completar a operação.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const hasEnoughCredits = (actionType: string): boolean => {
    if (!credits) return false;
    
    const costEntry = creditCosts.find(cost => cost.action_type === actionType);
    if (!costEntry) return false;
    
    return credits.balance >= costEntry.cost;
  };

  const getCreditCost = (actionType: string): number => {
    const costEntry = creditCosts.find(cost => cost.action_type === actionType);
    return costEntry ? costEntry.cost : 0;
  };

  return (
    <CreditsContext.Provider 
      value={{ 
        credits, 
        creditPackages, 
        creditCosts, 
        fetchCredits, 
        fetchCreditPackages, 
        fetchCreditCosts, 
        purchaseCredits, 
        spendCredits, 
        hasEnoughCredits, 
        getCreditCost 
      }}
    >
      {children}
    </CreditsContext.Provider>
  );
};

export const useCredits = (): CreditsContextType => {
  const context = useContext(CreditsContext);
  if (context === undefined) {
    throw new Error("useCredits must be used within a CreditsProvider");
  }
  return context;
};
