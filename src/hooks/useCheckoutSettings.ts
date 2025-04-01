import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Database } from "@/integrations/supabase/types";

type CheckoutSettings = Database["public"]["Tables"]["checkout_settings"]["Row"];

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
        setSettings(data);
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
      const { error } = await supabase
        .from("checkout_settings")
        .upsert(newSettings);

      if (error) throw error;

      setSettings((prev) => prev ? { ...prev, ...newSettings } : null);
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