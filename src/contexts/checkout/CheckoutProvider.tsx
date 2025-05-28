
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

  const initializeSettings = async () => {
    try {
      // Primeiro, verifica se existem configurações
      const { data: existingSettings, error: fetchError } = await supabase
        .from('checkout_settings')
        .select('*');

      if (fetchError) throw fetchError;

      // Se não há configurações, criar as padrão
      if (!existingSettings || existingSettings.length === 0) {
        const defaultSettings = [
          { type: 'credit_card' as CheckoutType, enabled: true },
          { type: 'pix' as CheckoutType, enabled: true },
          { type: 'manual' as CheckoutType, enabled: true }
        ];

        const { data: newSettings, error: insertError } = await supabase
          .from('checkout_settings')
          .insert(defaultSettings)
          .select('*');

        if (insertError) throw insertError;
        setSettings(newSettings || []);
      } else {
        setSettings(existingSettings);
      }
    } catch (err: any) {
      console.error('Error initializing checkout settings:', err);
      setError('Não foi possível inicializar as configurações de checkout');
      toast.error('Erro ao carregar configurações de checkout');
    }
  };

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('checkout_settings')
        .select('*')
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      if (!data || data.length === 0) {
        await initializeSettings();
      } else {
        setSettings(data);
      }
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
