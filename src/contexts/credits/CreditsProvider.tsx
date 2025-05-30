import React, { useState, useEffect, useContext } from "react";
import { useUser } from "@/contexts/user/UserContext";
import { ManualCreditRequest, CreditPackage, CreditCost, UserCredits, CreditsContextType } from "./types";
import { fetchUserCredits, fetchAllCreditPackages as fetchPackages, fetchAllCreditCosts as fetchCosts, purchaseUserCredits, spendUserCredits } from "./creditsAPI";
import { fetchManualRequests as fetchRequests, createManualCreditRequest, updateManualRequestStatus, addCreditsToUser } from "./manualCreditsAPI";
import { useCreditsUtils } from "./useCreditsUtils";
import CreditsContext from "./CreditsContext";

export const CreditsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);
  const [creditCosts, setCreditCosts] = useState<CreditCost[]>([]);
  const [manualRequests, setManualRequests] = useState<ManualCreditRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { hasEnoughCredits: checkEnoughCredits, getCreditCost: getActionCost } = useCreditsUtils(credits, creditCosts);

  useEffect(() => {
    if (user?.id) {
      fetchCredits(user.id);
      fetchCreditPackages();
      fetchCreditCosts();
      fetchManualRequests();
    }
  }, [user?.id]);

  const fetchCredits = async (userId: string) => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const userCredits = await fetchUserCredits(userId);
      setCredits(userCredits);
      setError(null);
    } catch (err) {
      setError("Falha ao carregar os créditos");
      console.error("Error fetching credits:", err);
    } finally {
      setLoading(false);
    }
  };

  const refetchCredits = async () => {
    if (!user?.id) return;
    await fetchCredits(user.id);
  };

  const fetchCreditPackages = async () => {
    setLoading(true);
    try {
      const packages = await fetchPackages();
      setCreditPackages(packages);
      setError(null);
    } catch (err) {
      setError("Falha ao carregar os pacotes de créditos");
      console.error("Error fetching credit packages:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCreditCosts = async () => {
    setLoading(true);
    try {
      const costs = await fetchCosts();
      setCreditCosts(costs);
      setError(null);
    } catch (err) {
      setError("Falha ao carregar os custos de créditos");
      console.error("Error fetching credit costs:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchManualRequests = async () => {
    setLoading(true);
    try {
      const requests = await fetchRequests();
      setManualRequests(requests);
      setError(null);
    } catch (err) {
      setError("Falha ao carregar as solicitações manuais");
      console.error("Error fetching manual requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const purchaseCredits = async (packageId: string, userId: string) => {
    setLoading(true);
    try {
      const packageInfo = creditPackages.find(p => p.id === packageId);
      if (!packageInfo) {
        throw new Error("Package not found");
      }
      
      await purchaseUserCredits(packageId, userId, packageInfo);
      await fetchCredits(userId);
      setError(null);
      return true;
    } catch (err) {
      setError("Falha ao comprar créditos");
      console.error("Error purchasing credits:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const requestManualCredits = async (
    amount: number,
    paymentMethod: string,
    paymentDetails: string
  ) => {
    if (!user?.id) return false;
    
    setLoading(true);
    try {
      await createManualCreditRequest(user.id, amount, paymentMethod, paymentDetails);
      setError(null);
      return true;
    } catch (err) {
      setError("Falha ao solicitar créditos");
      console.error("Error requesting credits:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const approveManualRequest = async (requestId: string) => {
    setLoading(true);
    try {
      const request = manualRequests.find(req => req.id === requestId);
      if (!request) {
        throw new Error("Request not found");
      }
      
      await updateManualRequestStatus(requestId, "approved");
      
      await addCreditsToUser(request.user_id, request.amount);
      
      await fetchManualRequests();
      
      if (user?.id === request.user_id) {
        await fetchCredits(user.id);
      }
      
      setError(null);
      return true;
    } catch (err) {
      setError("Falha ao aprovar solicitação");
      console.error("Error approving request:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const rejectManualRequest = async (requestId: string) => {
    setLoading(true);
    try {
      await updateManualRequestStatus(requestId, "rejected");
      await fetchManualRequests();
      setError(null);
      return true;
    } catch (err) {
      setError("Falha ao rejeitar solicitação");
      console.error("Error rejecting request:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const spendCredits = async (actionType: string, userId: string, amount?: number) => {
    setLoading(true);
    try {
      const cost = amount || getCreditCost(actionType);
      await spendUserCredits(actionType, userId, cost);
      await fetchCredits(userId);
      setError(null);
      return true;
    } catch (err) {
      setError("Falha ao gastar créditos");
      console.error("Error spending credits:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getCreditCost = (actionType: string): number => {
    return getActionCost(actionType);
  };

  const hasEnoughCredits = (actionType: string): boolean => {
    return checkEnoughCredits(actionType);
  };

  return (
    <CreditsContext.Provider
      value={{
        credits,
        loading,
        error,
        fetchCredits,
        refetchCredits,
        creditPackages,
        creditCosts,
        manualRequests,
        fetchCreditPackages,
        fetchCreditCosts,
        fetchManualRequests,
        purchaseCredits,
        requestManualCredits,
        approveManualRequest,
        rejectManualRequest,
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
