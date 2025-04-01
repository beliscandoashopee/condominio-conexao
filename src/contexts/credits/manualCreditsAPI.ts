
import { supabase } from '@/integrations/supabase/client';
import { ManualCreditRequest } from './types';

export const createManualCreditRequest = async (
  userId: string,
  amount: number,
  paymentMethod: string,
  paymentDetails: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('manual_credit_requests')
      .insert([
        {
          user_id: userId,
          amount,
          status: 'pending',
          payment_method: paymentMethod,
          payment_details: paymentDetails,
        },
      ]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao criar solicitação de créditos:', error);
    return false;
  }
};

export const fetchManualRequests = async (): Promise<ManualCreditRequest[]> => {
  try {
    const { data, error } = await supabase
      .from('manual_credit_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar solicitações de créditos:', error);
    return [];
  }
};

export const updateManualRequestStatus = async (
  requestId: string,
  status: 'approved' | 'rejected'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('manual_credit_requests')
      .update({ status })
      .eq('id', requestId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao atualizar status da solicitação:', error);
    return false;
  }
};

export const addCreditsToUser = async (userId: string, amount: number): Promise<boolean> => {
  try {
    // Primeiro, buscar o saldo atual
    const { data: currentCredits, error: fetchError } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    const newBalance = (currentCredits?.balance || 0) + amount;

    // Atualizar o saldo
    const { error: updateError } = await supabase
      .from('user_credits')
      .upsert([
        {
          user_id: userId,
          balance: newBalance,
        },
      ]);

    if (updateError) throw updateError;
    return true;
  } catch (error) {
    console.error('Erro ao adicionar créditos ao usuário:', error);
    return false;
  }
};
