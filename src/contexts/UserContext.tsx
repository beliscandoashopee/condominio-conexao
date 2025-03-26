
import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  apartment: string;
  block: string;
};

type CreditPackage = {
  id: string;
  name: string;
  credits: number;
  price: number;
  active: boolean;
};

type CreditCost = {
  id: string;
  action_type: string;
  cost: number;
  description: string | null;
};

type UserCredits = {
  balance: number;
};

type UserContextType = {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  credits: UserCredits | null;
  creditPackages: CreditPackage[];
  creditCosts: CreditCost[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchCredits: () => Promise<void>;
  fetchCreditPackages: () => Promise<void>;
  fetchCreditCosts: () => Promise<void>;
  purchaseCredits: (packageId: string) => Promise<boolean>;
  spendCredits: (actionType: string, amount?: number) => Promise<boolean>;
  hasEnoughCredits: (actionType: string) => boolean;
  getCreditCost: (actionType: string) => number;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);
  const [creditCosts, setCreditCosts] = useState<CreditCost[]>([]);

  useEffect(() => {
    // Configurar o listener de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Buscar o perfil do usuário quando o estado de autenticação mudar
        if (currentSession?.user) {
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id);
            fetchCredits();
          }, 0);
        } else {
          setProfile(null);
          setCredits(null);
        }
      }
    );

    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
        fetchCredits();
      }
      
      setIsLoading(false);
    });

    // Buscar pacotes de créditos e custos das ações (não dependem do usuário)
    fetchCreditPackages();
    fetchCreditCosts();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setProfile(data as UserProfile);
      }
    } catch (error: any) {
      console.error("Erro ao buscar perfil do usuário:", error.message);
    }
  };

  const fetchCredits = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("user_credits")
        .select("balance")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 é o código para 'não encontrado'
        throw error;
      }

      if (data) {
        setCredits({ balance: data.balance });
      } else {
        // Se o usuário não tem um registro de créditos, cria um com saldo zero
        const { data: newCredits, error: insertError } = await supabase
          .from("user_credits")
          .insert([{ user_id: user.id, balance: 0 }])
          .select("balance")
          .single();

        if (insertError) {
          throw insertError;
        }

        if (newCredits) {
          setCredits({ balance: newCredits.balance });
        }
      }
    } catch (error: any) {
      console.error("Erro ao buscar créditos do usuário:", error.message);
      toast.error("Não foi possível carregar seus créditos.");
    }
  };

  const fetchCreditPackages = async () => {
    try {
      const { data, error } = await supabase
        .from("credit_packages")
        .select("*")
        .eq("active", true)
        .order("credits", { ascending: true });

      if (error) {
        throw error;
      }

      setCreditPackages(data || []);
    } catch (error: any) {
      console.error("Erro ao buscar pacotes de créditos:", error.message);
    }
  };

  const fetchCreditCosts = async () => {
    try {
      const { data, error } = await supabase
        .from("credit_costs")
        .select("*");

      if (error) {
        throw error;
      }

      setCreditCosts(data || []);
    } catch (error: any) {
      console.error("Erro ao buscar custos das ações:", error.message);
    }
  };

  const purchaseCredits = async (packageId: string): Promise<boolean> => {
    if (!user) {
      toast.error("Você precisa estar logado para comprar créditos.");
      return false;
    }

    try {
      setIsLoading(true);
      
      // Buscar o pacote selecionado
      const selectedPackage = creditPackages.find(pkg => pkg.id === packageId);
      if (!selectedPackage) {
        throw new Error("Pacote não encontrado.");
      }

      // Simular uma transação de pagamento (aqui seria integrado com gateway de pagamento)
      // Para simulação, vamos considerar que o pagamento foi aprovado

      // Iniciar uma transação no banco de dados
      const { data: transaction, error: transactionError } = await supabase
        .from("credit_transactions")
        .insert([{
          user_id: user.id,
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
          p_user_id: user.id, 
          p_amount: selectedPackage.credits 
        }
      );

      if (updateError) {
        throw updateError;
      }

      // Buscar o saldo atualizado
      await fetchCredits();
      
      toast.success(`Você adquiriu ${selectedPackage.credits} créditos!`);
      return true;
    } catch (error: any) {
      console.error("Erro ao comprar créditos:", error.message);
      toast.error("Não foi possível completar a compra de créditos.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const spendCredits = async (actionType: string, amount?: number): Promise<boolean> => {
    if (!user) {
      toast.error("Você precisa estar logado para realizar esta ação.");
      return false;
    }

    if (!credits) {
      await fetchCredits();
      if (!credits) {
        toast.error("Não foi possível verificar seu saldo de créditos.");
        return false;
      }
    }

    try {
      setIsLoading(true);
      
      // Buscar o custo da ação
      const costEntry = creditCosts.find(cost => cost.action_type === actionType);
      if (!costEntry) {
        throw new Error("Tipo de ação não encontrado.");
      }

      // Usar o valor específico se fornecido, ou o custo padrão da ação
      const creditsToSpend = amount || costEntry.cost;
      
      // Verificar se o usuário tem créditos suficientes
      if (credits.balance < creditsToSpend) {
        toast.error(`Você não tem créditos suficientes. Necessários: ${creditsToSpend}`);
        return false;
      }

      // Registrar a transação de gasto
      const { error: transactionError } = await supabase
        .from("credit_transactions")
        .insert([{
          user_id: user.id,
          amount: -creditsToSpend,
          type: "spend",
          description: `${costEntry.description || actionType}`
        }]);

      if (transactionError) {
        throw transactionError;
      }

      // Atualizar o saldo de créditos do usuário
      const { error: updateError } = await supabase.rpc(
        "update_user_credits",
        { 
          p_user_id: user.id, 
          p_amount: -creditsToSpend 
        }
      );

      if (updateError) {
        throw updateError;
      }

      // Buscar o saldo atualizado
      await fetchCredits();
      
      toast.success(`${creditsToSpend} créditos foram utilizados.`);
      return true;
    } catch (error: any) {
      console.error("Erro ao gastar créditos:", error.message);
      toast.error("Não foi possível completar a operação.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const hasEnoughCredits = (actionType: string): boolean => {
    if (!user || !credits) return false;
    
    const costEntry = creditCosts.find(cost => cost.action_type === actionType);
    if (!costEntry) return false;
    
    return credits.balance >= costEntry.cost;
  };

  const getCreditCost = (actionType: string): number => {
    const costEntry = creditCosts.find(cost => cost.action_type === actionType);
    return costEntry ? costEntry.cost : 0;
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Login realizado com sucesso!");
    } catch (error: any) {
      console.error("Login falhou:", error);
      toast.error("Falha no login. Verifique suas credenciais.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast.success("Logout realizado com sucesso!");
    } catch (error: any) {
      console.error("Logout falhou:", error);
      toast.error("Falha ao fazer logout.");
      throw error;
    }
  };

  return (
    <UserContext.Provider 
      value={{ 
        user, 
        profile, 
        session, 
        isLoading, 
        credits, 
        creditPackages, 
        creditCosts, 
        login, 
        logout, 
        fetchCredits, 
        fetchCreditPackages, 
        fetchCreditCosts, 
        purchaseCredits, 
        spendCredits, 
        hasEnoughCredits, 
        getCreditCost 
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
