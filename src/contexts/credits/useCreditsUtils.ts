
import { CreditCost, UserCredits } from "./types";

export const getCreditCostValue = (actionType: string, creditCosts: CreditCost[]): number => {
  const costEntry = creditCosts.find(cost => cost.action_type === actionType);
  return costEntry ? costEntry.cost : 0;
};

export const hasEnoughCreditsCheck = (actionType: string, credits: UserCredits, creditCosts: CreditCost[]): boolean => {
  if (!credits) return false;
  
  const costEntry = creditCosts.find(cost => cost.action_type === actionType);
  if (!costEntry) return false;
  
  return credits.balance >= costEntry.cost;
};

export const useCreditsUtils = (
  credits: UserCredits | null,
  creditCosts: CreditCost[]
) => {
  // Verifica se o usuário tem créditos suficientes para uma ação
  const hasEnoughCredits = (actionType: string): boolean => {
    if (!credits) return false;
    return hasEnoughCreditsCheck(actionType, credits, creditCosts);
  };

  // Retorna o custo de uma ação
  const getCreditCost = (actionType: string): number => {
    return getCreditCostValue(actionType, creditCosts);
  };

  return {
    hasEnoughCredits,
    getCreditCost
  };
};
