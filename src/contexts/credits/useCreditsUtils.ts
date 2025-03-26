
import { CreditCost, UserCredits } from "./types";

export const useCreditsUtils = (
  credits: UserCredits | null,
  creditCosts: CreditCost[]
) => {
  // Verifica se o usuário tem créditos suficientes para uma ação
  const hasEnoughCredits = (actionType: string): boolean => {
    if (!credits) return false;
    
    const costEntry = creditCosts.find(cost => cost.action_type === actionType);
    if (!costEntry) return false;
    
    return credits.balance >= costEntry.cost;
  };

  // Retorna o custo de uma ação
  const getCreditCost = (actionType: string): number => {
    const costEntry = creditCosts.find(cost => cost.action_type === actionType);
    return costEntry ? costEntry.cost : 0;
  };

  return {
    hasEnoughCredits,
    getCreditCost
  };
};
