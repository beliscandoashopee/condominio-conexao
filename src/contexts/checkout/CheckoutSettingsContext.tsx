
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Define a simple type for checkout settings
type CheckoutSettings = {
  id: string;
  type: 'manual' | 'credit_card' | 'pix';
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

interface CheckoutSettingsContextType {
  settings: CheckoutSettings | null;
  loading: boolean;
  error: string | null;
  updateSettings: (newSettings: Partial<CheckoutSettings>) => Promise<void>;
}

const CheckoutSettingsContext = createContext<CheckoutSettingsContextType | undefined>(undefined);

export const CheckoutSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<CheckoutSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('checkout_settings')
        .select('*')
        .single();

      if (error) throw error;
      setSettings(data as CheckoutSettings);
    } catch (err) {
      console.error('Erro ao buscar configurações de checkout:', err);
      setError('Falha ao carregar configurações de checkout');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<CheckoutSettings>) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('checkout_settings')
        .upsert({ ...newSettings });

      if (error) throw error;
      
      // Refetch to make sure we have the latest data
      await fetchSettings();
    } catch (err) {
      console.error('Erro ao atualizar configurações de checkout:', err);
      setError('Falha ao atualizar configurações de checkout');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <CheckoutSettingsContext.Provider value={{ settings, loading, error, updateSettings }}>
      {children}
    </CheckoutSettingsContext.Provider>
  );
};

export const useCheckoutSettings = () => {
  const context = useContext(CheckoutSettingsContext);
  if (context === undefined) {
    throw new Error('useCheckoutSettings must be used within a CheckoutSettingsProvider');
  }
  return context;
};
