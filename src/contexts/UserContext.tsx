
import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";

type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  apartment: string;
  block: string;
};

type UserContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem("condominio-user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse saved user:", error);
        localStorage.removeItem("condominio-user");
      }
    }
    
    // Mock user for demo purposes - remove in production
    if (!savedUser) {
      const mockUser = {
        id: "1",
        name: "João Silva",
        email: "joao@example.com",
        avatar: "https://i.pravatar.cc/300?img=68",
        apartment: "301",
        block: "A",
      };
      setUser(mockUser);
      localStorage.setItem("condominio-user", JSON.stringify(mockUser));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Mock login - replace with actual authentication in production
      if (email && password) {
        const mockUser = {
          id: "1",
          name: "João Silva",
          email,
          avatar: "https://i.pravatar.cc/300?img=68",
          apartment: "301",
          block: "A",
        };
        
        setUser(mockUser);
        localStorage.setItem("condominio-user", JSON.stringify(mockUser));
        toast.success("Login realizado com sucesso!");
      } else {
        throw new Error("Email e senha são obrigatórios");
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Falha no login. Verifique suas credenciais.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("condominio-user");
    toast.success("Logout realizado com sucesso!");
  };

  return (
    <UserContext.Provider value={{ user, isLoading, login, logout }}>
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
