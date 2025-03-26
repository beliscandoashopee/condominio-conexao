
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CreditPackage, CreditCost, UserCredits } from "./types";

export const fetchUserCredits = async (userId: string): Promise<UserCredits | null> => {
  try {
    // First, try to get the existing user credits
    const { data, error } = await supabase
      .from("user_credits")
      .select("balance")
      .eq("user_id", userId)
      .single();

    if (error) {
      // If not found, we'll create a new record with admin rights
      if (error.code === 'PGRST116') { // 'PGRST116' is the code for 'not found'
        const { data: insertData, error: insertError } = await supabase.rpc(
          "update_user_credits",
          { 
            p_user_id: userId, 
            p_amount: 0 // Initialize with zero credits
          }
        );

        if (insertError) {
          console.error("Erro ao criar registro de créditos:", insertError.message);
          throw insertError;
        }

        return { balance: 0 };
      } else {
        throw error;
      }
    }

    return data ? { balance: data.balance } : null;
  } catch (error: any) {
    console.error("Erro ao buscar créditos do usuário:", error.message);
    throw error; // Let the caller handle the toast
  }
};

export const fetchAllCreditPackages = async (): Promise<CreditPackage[]> => {
  try {
    const { data, error } = await supabase
      .from("credit_packages")
      .select("*")
      .eq("active", true)
      .order("credits", { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error: any) {
    console.error("Erro ao buscar pacotes de créditos:", error.message);
    return [];
  }
};

export const fetchAllCreditCosts = async (): Promise<CreditCost[]> => {
  try {
    const { data, error } = await supabase
      .from("credit_costs")
      .select("*");

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error: any) {
    console.error("Erro ao buscar custos das ações:", error.message);
    return [];
  }
};

export const purchaseUserCredits = async (
  packageId: string, 
  userId: string, 
  selectedPackage: CreditPackage
): Promise<boolean> => {
  try {
    // Instead of directly inserting, we'll use the RPC function which has more privileges
    // Registrar a transação de compra
    const { data: transaction, error: transactionError } = await supabase
      .from("credit_transactions")
      .insert([{
        user_id: userId,
        package_id: packageId,
        amount: selectedPackage.credits,
        type: "purchase",
        description: `Compra do pacote ${selectedPackage.name}`
      }])
      .select()
      .single();

    if (transactionError) {
      throw transactionError;
    }

    // Atualizar o saldo de créditos do usuário usando a função RPC
    const { data: updatedCredits, error: updateError } = await supabase.rpc(
      "update_user_credits",
      { 
        p_user_id: userId, 
        p_amount: selectedPackage.credits 
      }
    );

    if (updateError) {
      throw updateError;
    }

    toast.success(`Você adquiriu ${selectedPackage.credits} créditos!`);
    return true;
  } catch (error: any) {
    console.error("Erro ao comprar créditos:", error.message);
    toast.error("Não foi possível completar a compra de créditos.");
    return false;
  }
};

export const spendUserCredits = async (
  actionType: string, 
  userId: string, 
  creditsToSpend: number
): Promise<boolean> => {
  try {
    // Registrar a transação de gasto
    const { error: transactionError } = await supabase
      .from("credit_transactions")
      .insert([{
        user_id: userId,
        amount: -creditsToSpend,
        type: "spend",
        description: actionType
      }]);

    if (transactionError) {
      throw transactionError;
    }

    // Atualizar o saldo de créditos do usuário
    const { error: updateError } = await supabase.rpc(
      "update_user_credits",
      { 
        p_user_id: userId, 
        p_amount: -creditsToSpend 
      }
    );

    if (updateError) {
      throw updateError;
    }

    toast.success(`${creditsToSpend} créditos foram utilizados.`);
    return true;
  } catch (error: any) {
    console.error("Erro ao gastar créditos:", error.message);
    toast.error("Não foi possível completar a operação.");
    return false;
  }
};
