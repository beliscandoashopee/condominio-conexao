import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Database } from "@/integrations/supabase/types";

type CheckoutSettings = Database["public"]["Tables"]["checkout_settings"]["Row"];

interface CheckoutSettingsContextType {
  settings: CheckoutSettings | null;
  loading: boolean;
  error: string | null;
  updateSettings: (newSettings: Partial<CheckoutSettings>) => Promise<void>;
}

const CheckoutSettingsContext = createContext<CheckoutSettingsContextType | undefined>(undefined);

export const useCheckoutSettings = () => {
  const context = useContext(CheckoutSettingsContext);
  if (!context) {
    throw new Error("useCheckoutSettings must be used within a CheckoutSettingsProvider");
  }
  return context;
};

export const CheckoutSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  return (
    <CheckoutSettingsContext.Provider
      value={{
        settings,
        loading,
        error,
        updateSettings,
      }}
    >
      {children}
    </CheckoutSettingsContext.Provider>
  );
}; 