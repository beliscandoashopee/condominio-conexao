
import React, { createContext, useState, useContext, useEffect } from "react";
import { CreditsContextType, CreditPackage, CreditCost, UserCredits } from "./types";
import { 
  fetchUserCredits,
  fetchAllCreditPackages, 
  fetchAllCreditCosts,
  purchaseUserCredits,
  spendUserCredits
} from "./creditsAPI";
import { useCreditsUtils } from "./useCreditsUtils";

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

export const CreditsProvider = ({ children }: { children: React.ReactNode }) => {
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);
  const [creditCosts, setCreditCosts] = useState<CreditCost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { hasEnoughCredits, getCreditCost } = useCreditsUtils(credits, creditCosts);

  useEffect(() => {
    // Buscar pacotes de créditos e custos das ações (não dependem do usuário)
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchCreditPackages(),
          fetchCreditCosts()
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  const fetchCredits = async (userId: string) => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const userCredits = await fetchUserCredits(userId);
      if (userCredits) {
        setCredits(userCredits);
      } else {
        // Se não retornou créditos mas também não deu erro, provavelmente é um novo usuário
        setCredits({ balance: 0 });
      }
    } catch (err: any) {
      console.error("Erro ao buscar créditos:", err?.message);
      setError("Não foi possível carregar seus créditos.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCreditPackages = async () => {
    try {
      const packages = await fetchAllCreditPackages();
      setCreditPackages(packages);
      return packages;
    } catch (err: any) {
      console.error("Erro ao buscar pacotes de crédito:", err?.message);
      return [];
    }
  };

  const fetchCreditCosts = async () => {
    try {
      const costs = await fetchAllCreditCosts();
      setCreditCosts(costs);
      return costs;
    } catch (err: any) {
      console.error("Erro ao buscar custos das ações:", err?.message);
      return [];
    }
  };

  const purchaseCredits = async (packageId: string, userId: string): Promise<boolean> => {
    if (!userId) {
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Buscar o pacote selecionado
      const selectedPackage = creditPackages.find(pkg => pkg.id === packageId);
      if (!selectedPackage) {
        throw new Error("Pacote não encontrado.");
      }

      // Processar a compra
      const success = await purchaseUserCredits(packageId, userId, selectedPackage);
      
      // Atualizar o saldo se a compra foi bem-sucedida
      if (success) {
        await fetchCredits(userId);
      }
      
      return success;
    } catch (err: any) {
      console.error("Erro ao comprar créditos:", err?.message);
      setError("Não foi possível completar a compra de créditos.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const spendCredits = async (actionType: string, userId: string, amount?: number): Promise<boolean> => {
    if (!userId) {
      return false;
    }

    if (!credits) {
      await fetchCredits(userId);
      if (!credits) {
        return false;
      }
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Buscar o custo da ação
      const costEntry = creditCosts.find(cost => cost.action_type === actionType);
      if (!costEntry) {
        throw new Error("Tipo de ação não encontrado.");
      }

      // Usar o valor específico se fornecido, ou o custo padrão da ação
      const creditsToSpend = amount || costEntry.cost;
      
      // Verificar se o usuário tem créditos suficientes
      if (credits.balance < creditsToSpend) {
        return false;
      }

      // Processar o gasto
      const success = await spendUserCredits(actionType, userId, creditsToSpend);
      
      // Atualizar o saldo se o gasto foi bem-sucedido
      if (success) {
        await fetchCredits(userId);
      }
      
      return success;
    } catch (err: any) {
      console.error("Erro ao gastar créditos:", err?.message);
      setError("Não foi possível completar a operação.");
      return false;
    } finally {
      setIsLoading(false);
    }
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
        getCreditCost,
        isLoading,
        error
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
