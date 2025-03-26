
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CreditPackage, CreditCost, UserCredits } from "./types";

export const fetchUserCredits = async (userId: string): Promise<UserCredits | null> => {
  try {
    const { data, error } = await supabase
      .from("user_credits")
      .select("balance")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 é o código para 'não encontrado'
      throw error;
    }

    if (data) {
      return { balance: data.balance };
    } else {
      // Se o usuário não tem um registro de créditos, cria um com saldo zero
      const { data: newCredits, error: insertError } = await supabase
        .from("user_credits")
        .insert([{ user_id: userId, balance: 0 }])
        .select("balance")
        .single();

      if (insertError) {
        throw insertError;
      }

      if (newCredits) {
        return { balance: newCredits.balance };
      }
    }
    
    return null;
  } catch (error: any) {
    console.error("Erro ao buscar créditos do usuário:", error.message);
    toast.error("Não foi possível carregar seus créditos.");
    return null;
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

    // Atualizar o saldo de créditos do usuário
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
