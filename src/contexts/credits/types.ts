
export type ManualCreditRequest = {
  id: string;
  user_id: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  payment_method: string;
  payment_details: string;
  created_at: string;
  updated_at: string;
};

export type CreditsContextType = {
  credits: number;
  loading: boolean;
  requestManualCredits: (amount: number, paymentMethod: string, paymentDetails: string) => Promise<boolean>;
  refetchCredits: () => Promise<void>;
};
