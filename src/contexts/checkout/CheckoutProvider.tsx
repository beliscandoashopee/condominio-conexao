
import React, { useState, useEffect } from 'react';
import { CheckoutContext } from './CheckoutContext';
import { CheckoutSetting, CheckoutType } from './types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CheckoutProviderProps {
  children: React.ReactNode;
}

export const CheckoutProvider = ({ children }: CheckoutProviderProps) => {
  const [settings, setSettings] = useState<CheckoutSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('checkout_settings')
        .select('*')
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      // Convert the data to match our CheckoutSetting interface
      const typedSettings: CheckoutSetting[] = (data || []).map(setting => ({
        ...setting,
        type: setting.type as CheckoutType // Cast to CheckoutType since we know the DB constraint ensures valid values
      }));

      setSettings(typedSettings);
    } catch (err: any) {
      console.error('Error fetching checkout settings:', err);
      setError('Não foi possível carregar as configurações de checkout');
      toast.error('Erro ao carregar configurações de checkout');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (type: CheckoutType, enabled: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from('checkout_settings')
        .update({ enabled })
        .eq('type', type);

      if (updateError) throw updateError;

      // Atualiza o estado local
      setSettings(prev => 
        prev.map(setting => 
          setting.type === type ? { ...setting, enabled } : setting
        )
      );

      toast.success(`Método de pagamento ${enabled ? 'habilitado' : 'desabilitado'} com sucesso`);
    } catch (err: any) {
      console.error('Error updating checkout setting:', err);
      toast.error('Erro ao atualizar configuração de checkout');
      throw err;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <CheckoutContext.Provider
      value={{
        settings,
        isLoading,
        error,
        fetchSettings,
        updateSetting,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};
