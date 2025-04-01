
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CheckoutType } from "@/contexts/checkout/types";

// Define a simpler type for checkout settings
type CheckoutSettings = {
  id: string;
  type: CheckoutType;
  enabled: boolean | null;
  created_at: string;
  updated_at: string;
  
  // Add these properties to support the existing code
  pix_enabled?: boolean;
  credit_card_enabled?: boolean;
  manual_enabled?: boolean;
};

export const useCheckoutSettings = () => {
  const [settings, setSettings] = useState<CheckoutSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("checkout_settings")
        .select("*")
        .single();

      if (error) throw error;

      if (data) {
        // Create a settings object with both the standard fields and the legacy fields
        const settingsData = data as CheckoutSettings;
        
        // Add compatibility properties for existing code
        if (settingsData.type === 'pix') {
          settingsData.pix_enabled = settingsData.enabled;
        } else if (settingsData.type === 'credit_card') {
          settingsData.credit_card_enabled = settingsData.enabled;
        } else if (settingsData.type === 'manual') {
          settingsData.manual_enabled = settingsData.enabled;
        }
        
        setSettings(settingsData);
      }
    } catch (error) {
      console.error("Erro ao buscar configurações:", error);
      setError("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<CheckoutSettings>) => {
    try {
      // Make sure we're including a valid type
      const updateData = { ...newSettings };
      if (!updateData.type && settings?.type) {
        updateData.type = settings.type;
      }
      
      const { error } = await supabase
        .from("checkout_settings")
        .upsert(updateData as any);

      if (error) throw error;

      // Update the local state with both standard and legacy properties
      setSettings((prev) => {
        if (!prev) return null;
        const updated = { ...prev, ...newSettings };
        
        // Update compatibility properties
        if (updated.type === 'pix') {
          updated.pix_enabled = updated.enabled;
        } else if (updated.type === 'credit_card') {
          updated.credit_card_enabled = updated.enabled;
        } else if (updated.type === 'manual') {
          updated.manual_enabled = updated.enabled;
        }
        
        return updated;
      });
    } catch (error) {
      console.error("Erro ao atualizar configurações:", error);
      throw new Error("Erro ao atualizar configurações");
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    updateSettings,
  };
};
