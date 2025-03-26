
export type CreditPackage = {
  id: string;
  name: string;
  credits: number;
  price: number;
  active: boolean;
};

export type CreditCost = {
  id: string;
  action_type: string;
  cost: number;
  description: string | null;
};

export type UserCredits = {
  balance: number;
};

export type CreditsContextType = {
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
  isLoading: boolean;
  error: string | null;
};
