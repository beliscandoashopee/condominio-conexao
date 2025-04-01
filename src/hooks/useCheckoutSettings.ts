
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { CheckoutType } from '@/contexts/checkout/types';

interface CheckoutSettings {
  id: string;
  type: CheckoutType;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export function useCheckoutSettings() {
  const [settings, setSettings] = useState<CheckoutSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('checkout_settings')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      setSettings(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load settings');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load checkout settings',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (type: CheckoutType, enabled: boolean) => {
    try {
      // Find the setting by type
      const setting = settings.find(s => s.type === type);
      
      if (!setting) {
        throw new Error(`Setting for type ${type} not found`);
      }
      
      const { data, error } = await supabase
        .from('checkout_settings')
        .update({ enabled })
        .eq('id', setting.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setSettings(settings.map(s => s.type === type ? { ...s, enabled } : s));
      
      toast({
        title: 'Settings Updated',
        description: `${type} payment method has been ${enabled ? 'enabled' : 'disabled'}.`,
      });
      
      return data;
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to update setting',
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Add derived properties for backward compatibility
  const settingsWithCompatProps = settings.map(setting => {
    const compatProps: any = {};
    
    if (setting.type === 'pix') {
      compatProps.pix_enabled = setting.enabled;
    } else if (setting.type === 'credit_card') {
      compatProps.credit_card_enabled = setting.enabled;
    } else if (setting.type === 'manual') {
      compatProps.manual_enabled = setting.enabled;
    }
    
    return { ...setting, ...compatProps };
  });

  return {
    settings: settingsWithCompatProps,
    loading,
    error,
    fetchSettings,
    updateSetting,
  };
}
