
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
  user_id: string;
  balance: number;
};

export type ManualCreditRequest = {
  id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  payment_method: string;
  payment_details: string;
};

export type CreditsContextType = {
  credits: UserCredits | null;
  creditPackages: CreditPackage[];
  creditCosts: CreditCost[];
  manualRequests: ManualCreditRequest[];
  fetchCredits: (userId: string) => Promise<void>;
  fetchCreditPackages: () => Promise<void>;
  fetchCreditCosts: () => Promise<void>;
  fetchManualRequests: () => Promise<void>;
  purchaseCredits: (packageId: string, userId: string) => Promise<boolean>;
  requestManualCredits: (amount: number, paymentMethod: string, paymentDetails: string) => Promise<boolean>;
  approveManualRequest: (requestId: string) => Promise<boolean>;
  rejectManualRequest: (requestId: string) => Promise<boolean>;
  spendCredits: (actionType: string, userId: string, amount?: number) => Promise<boolean>;
  hasEnoughCredits: (actionType: string) => boolean;
  getCreditCost: (actionType: string) => number;
  loading: boolean;
  error: string | null;
};
