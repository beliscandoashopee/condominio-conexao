import React, { useState, useEffect } from "react";
import { UserCredits, CreditPackage, CreditCost, ManualCreditRequest } from "./types";
import { 
  fetchUserCredits,
  fetchAllCreditPackages, 
  fetchAllCreditCosts,
  purchaseUserCredits,
  spendUserCredits
} from "./creditsAPI";
import {
  createManualCreditRequest,
  fetchManualRequests,
  updateManualRequestStatus,
  addCreditsToUser
} from "./manualCreditsAPI";
import { useCreditsUtils } from "./useCreditsUtils";
import CreditsContext from "./CreditsContext";
import { supabase } from "@/integrations/supabase/client";

export const CreditsProvider = ({ children }: { children: React.ReactNode }) => {
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);
  const [creditCosts, setCreditCosts] = useState<CreditCost[]>([]);
  const [manualRequests, setManualRequests] = useState<ManualCreditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { hasEnoughCredits, getCreditCost } = useCreditsUtils(credits, creditCosts);

  useEffect(() => {
    // Buscar pacotes de créditos e custos das ações (não dependem do usuário)
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchCreditPackages(),
          fetchCreditCosts(),
          fetchManualRequests()
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Listener para mudanças na autenticação
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          fetchCredits(session.user.id);
        } else {
          setCredits(null);
        }
      }
    );

    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchCredits(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchCredits = async (userId: string) => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const userCredits = await fetchUserCredits(userId);
      if (userCredits) {
        setCredits({ ...userCredits, user_id: userId });
      } else {
        // Se não retornou créditos mas também não deu erro, provavelmente é um novo usuário
        setCredits({ user_id: userId, balance: 0 });
      }
    } catch (err: any) {
      console.error("Erro ao buscar créditos:", err?.message);
      setError("Não foi possível carregar seus créditos.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCreditPackages = async () => {
    try {
      const packages = await fetchAllCreditPackages();
      setCreditPackages(packages);
    } catch (err: any) {
      console.error("Erro ao buscar pacotes de crédito:", err?.message);
    }
  };

  const fetchCreditCosts = async () => {
    try {
      const costs = await fetchAllCreditCosts();
      setCreditCosts(costs);
    } catch (err: any) {
      console.error("Erro ao buscar custos das ações:", err?.message);
    }
  };

  const fetchManualRequests = async () => {
    try {
      const requests = await fetchManualRequests();
      if (Array.isArray(requests)) {
        setManualRequests(requests);
      } else {
        setManualRequests([]);
      }
    } catch (err: any) {
      console.error("Erro ao buscar solicitações de créditos:", err?.message);
      setManualRequests([]);
    }
  };

  const requestManualCredits = async (
    amount: number,
    paymentMethod: string,
    paymentDetails: string
  ): Promise<boolean> => {
    if (!credits?.user_id) return false;

    try {
      setLoading(true);
      setError(null);
      
      const success = await createManualCreditRequest(
        credits.user_id,
        amount,
        paymentMethod,
        paymentDetails
      );

      if (success) {
        await fetchManualRequests();
      }

      return success;
    } catch (err: any) {
      console.error("Erro ao solicitar créditos:", err?.message);
      setError("Não foi possível criar a solicitação de créditos.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const approveManualRequest = async (requestId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Buscar a solicitação
      const request = manualRequests.find(r => r.id === requestId);
      if (!request) {
        throw new Error("Solicitação não encontrada.");
      }

      // Atualizar o status da solicitação
      const statusUpdated = await updateManualRequestStatus(requestId, 'approved');
      if (!statusUpdated) {
        throw new Error("Não foi possível atualizar o status da solicitação.");
      }

      // Adicionar os créditos ao usuário
      const creditsAdded = await addCreditsToUser(request.user_id, request.amount);
      if (!creditsAdded) {
        throw new Error("Não foi possível adicionar os créditos ao usuário.");
      }

      // Atualizar os dados
      await Promise.all([
        fetchManualRequests(),
        fetchCredits(request.user_id)
      ]);

      return true;
    } catch (err: any) {
      console.error("Erro ao aprovar solicitação:", err?.message);
      setError("Não foi possível aprovar a solicitação.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const rejectManualRequest = async (requestId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const success = await updateManualRequestStatus(requestId, 'rejected');
      if (success) {
        await fetchManualRequests();
      }

      return success;
    } catch (err: any) {
      console.error("Erro ao rejeitar solicitação:", err?.message);
      setError("Não foi possível rejeitar a solicitação.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const purchaseCredits = async (packageId: string, userId: string): Promise<boolean> => {
    if (!userId) {
      return false;
    }

    try {
      setLoading(true);
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
      setLoading(false);
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
      setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <CreditsContext.Provider 
      value={{ 
        credits, 
        creditPackages, 
        creditCosts,
        manualRequests,
        fetchCredits, 
        fetchCreditPackages, 
        fetchCreditCosts,
        fetchManualRequests,
        purchaseCredits,
        requestManualCredits,
        approveManualRequest,
        rejectManualRequest,
        spendCredits, 
        hasEnoughCredits, 
        getCreditCost,
        loading,
        error
      }}
    >
      {children}
    </CreditsContext.Provider>
  );
};
