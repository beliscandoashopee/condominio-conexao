
export type CheckoutType = 'credit_card' | 'manual' | 'pix';

export interface CheckoutSetting {
  id: string;
  type: CheckoutType;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CheckoutContextType {
  settings: CheckoutSetting[];
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSetting: (type: CheckoutType, enabled: boolean) => Promise<void>;
}
