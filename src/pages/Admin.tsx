
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, Package, PlusCircle, Save, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useUser } from "@/contexts/user/UserContext";
import { supabase } from "@/integrations/supabase/client";
import { useCredits } from "@/contexts/credits";
import { CreditPackage, CreditCost } from "@/contexts/credits/types";
import AdminMenu from "@/components/AdminMenu";

const Admin = () => {
  const navigate = useNavigate();
  const { user, profile } = useUser();
  const { fetchCreditPackages, fetchCreditCosts } = useCredits();
  
  // Estados para gerenciamento de pacotes de créditos
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [newPackage, setNewPackage] = useState<CreditPackage>({
    id: "",
    name: "",
    credits: 0,
    price: 0,
    active: true
  });
  const [isAddingPackage, setIsAddingPackage] = useState(false);
  
  // Estados para gerenciamento de custos de ações
  const [costs, setCosts] = useState<CreditCost[]>([]);
  const [newCost, setNewCost] = useState<CreditCost>({
    id: "",
    action_type: "",
    cost: 0,
    description: ""
  });
  const [isAddingCost, setIsAddingCost] = useState(false);
  
  useEffect(() => {
    // Verificar se o usuário é administrador
    if (user && profile && profile.role !== 'admin') {
      toast.error("Acesso restrito a administradores.");
      navigate("/");
      return;
    }
    
    // Carregar pacotes e custos
    loadPackages();
    loadCosts();
  }, [user, profile, navigate]);
  
  const loadPackages = async () => {
    try {
      const { data, error } = await supabase
        .from("credit_packages")
        .select("*")
        .order("credits", { ascending: true });
      
      if (error) throw error;
      setPackages(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar pacotes:", error.message);
      toast.error("Erro ao carregar pacotes de créditos.");
    }
  };
  
  const loadCosts = async () => {
    try {
      const { data, error } = await supabase
        .from("credit_costs")
        .select("*")
        .order("action_type", { ascending: true });
      
      if (error) throw error;
      setCosts(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar custos:", error.message);
      toast.error("Erro ao carregar custos das ações.");
    }
  };
  
  const handleAddPackage = async () => {
    try {
      if (!newPackage.name || !newPackage.credits || !newPackage.price) {
        toast.error("Preencha todos os campos obrigatórios.");
        return;
      }
      
      const { error } = await supabase
        .from("credit_packages")
        .insert([{
          name: newPackage.name,
          credits: newPackage.credits,
          price: newPackage.price,
          active: true
        }]);
      
      if (error) throw error;
      
      toast.success("Pacote adicionado com sucesso!");
      setNewPackage({ id: "", name: "", credits: 0, price: 0, active: true });
      setIsAddingPackage(false);
      loadPackages();
      fetchCreditPackages();
    } catch (error: any) {
      console.error("Erro ao adicionar pacote:", error.message);
      toast.error("Erro ao adicionar pacote.");
    }
  };
  
  const handleUpdatePackage = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from("credit_packages")
        .update({ active })
        .eq("id", id);
      
      if (error) throw error;
      
      toast.success("Pacote atualizado com sucesso!");
      loadPackages();
      fetchCreditPackages();
    } catch (error: any) {
      console.error("Erro ao atualizar pacote:", error.message);
      toast.error("Erro ao atualizar pacote.");
    }
  };
  
  const handleAddCost = async () => {
    try {
      if (!newCost.action_type || newCost.cost === undefined) {
        toast.error("Preencha todos os campos obrigatórios.");
        return;
      }
      
      const { error } = await supabase
        .from("credit_costs")
        .insert([{
          action_type: newCost.action_type,
          cost: newCost.cost,
          description: newCost.description
        }]);
      
      if (error) throw error;
      
      toast.success("Custo adicionado com sucesso!");
      setNewCost({ id: "", action_type: "", cost: 0, description: "" });
      setIsAddingCost(false);
      loadCosts();
      fetchCreditCosts();
    } catch (error: any) {
      console.error("Erro ao adicionar custo:", error.message);
      toast.error("Erro ao adicionar custo.");
    }
  };
  
  const handleUpdateCost = async (id: string, cost: number) => {
    try {
      const { error } = await supabase
        .from("credit_costs")
        .update({ cost })
        .eq("id", id);
      
      if (error) throw error;
      
      toast.success("Custo atualizado com sucesso!");
      loadCosts();
      fetchCreditCosts();
    } catch (error: any) {
      console.error("Erro ao atualizar custo:", error.message);
      toast.error("Erro ao atualizar custo.");
    }
  };
  
  if (!user || !profile) {
    return null; // Não renderizar nada enquanto verifica o usuário
  }
  
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        </div>
        
        {/* Gerenciamento de pacotes de créditos */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <Package className="mr-2" size={20} />
              Pacotes de Créditos
            </h2>
            <Button 
              variant="outline" 
              onClick={() => setIsAddingPackage(!isAddingPackage)}
            >
              {isAddingPackage ? <X size={16} className="mr-2" /> : <PlusCircle size={16} className="mr-2" />}
              {isAddingPackage ? "Cancelar" : "Adicionar pacote"}
            </Button>
          </div>
          
          {isAddingPackage && (
            <div className="bg-card p-4 rounded-lg mb-4 border">
              <h3 className="font-medium mb-3">Novo pacote</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-sm mb-1 block">Nome</label>
                  <Input 
                    value={newPackage.name} 
                    onChange={e => setNewPackage({...newPackage, name: e.target.value})}
                    placeholder="Ex: Pacote Básico"
                  />
                </div>
                <div>
                  <label className="text-sm mb-1 block">Créditos</label>
                  <Input 
                    type="number" 
                    value={newPackage.credits || ''} 
                    onChange={e => setNewPackage({...newPackage, credits: parseInt(e.target.value) || 0})}
                    placeholder="Ex: 100"
                  />
                </div>
                <div>
                  <label className="text-sm mb-1 block">Preço (R$)</label>
                  <Input 
                    type="number" 
                    value={newPackage.price || ''} 
                    onChange={e => setNewPackage({...newPackage, price: parseFloat(e.target.value) || 0})}
                    placeholder="Ex: 19.90"
                    step="0.01"
                  />
                </div>
              </div>
              <Button onClick={handleAddPackage}>
                <Save size={16} className="mr-2" />
                Salvar pacote
              </Button>
            </div>
          )}
          
          <div className="bg-card rounded-lg border overflow-hidden">
            <div className="grid grid-cols-4 gap-4 p-3 bg-secondary/50 font-medium text-sm">
              <div>Nome</div>
              <div>Créditos</div>
              <div>Preço</div>
              <div className="text-right">Ativo</div>
            </div>
            
            <Separator />
            
            {packages.map(pkg => (
              <div key={pkg.id} className="grid grid-cols-4 gap-4 p-3 items-center hover:bg-secondary/20 transition-colors">
                <div>{pkg.name}</div>
                <div>{pkg.credits}</div>
                <div>R$ {pkg.price.toFixed(2)}</div>
                <div className="text-right">
                  <Switch 
                    checked={pkg.active} 
                    onCheckedChange={(checked) => handleUpdatePackage(pkg.id, checked)}
                  />
                </div>
              </div>
            ))}
            
            {packages.length === 0 && (
              <div className="p-6 text-center text-muted-foreground">
                Nenhum pacote cadastrado.
              </div>
            )}
          </div>
        </div>
        
        {/* Gerenciamento de custos de ações */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Custos das Ações</h2>
            <Button 
              variant="outline" 
              onClick={() => setIsAddingCost(!isAddingCost)}
            >
              {isAddingCost ? <X size={16} className="mr-2" /> : <PlusCircle size={16} className="mr-2" />}
              {isAddingCost ? "Cancelar" : "Adicionar custo"}
            </Button>
          </div>
          
          {isAddingCost && (
            <div className="bg-card p-4 rounded-lg mb-4 border">
              <h3 className="font-medium mb-3">Novo custo</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-sm mb-1 block">Tipo de ação</label>
                  <Input 
                    value={newCost.action_type} 
                    onChange={e => setNewCost({...newCost, action_type: e.target.value})}
                    placeholder="Ex: create_ad"
                  />
                </div>
                <div>
                  <label className="text-sm mb-1 block">Custo (créditos)</label>
                  <Input 
                    type="number" 
                    value={newCost.cost || ''} 
                    onChange={e => setNewCost({...newCost, cost: parseInt(e.target.value) || 0})}
                    placeholder="Ex: 10"
                  />
                </div>
                <div>
                  <label className="text-sm mb-1 block">Descrição</label>
                  <Input 
                    value={newCost.description || ''} 
                    onChange={e => setNewCost({...newCost, description: e.target.value})}
                    placeholder="Ex: Criar um anúncio"
                  />
                </div>
              </div>
              <Button onClick={handleAddCost}>
                <Save size={16} className="mr-2" />
                Salvar custo
              </Button>
            </div>
          )}
          
          <div className="bg-card rounded-lg border overflow-hidden">
            <div className="grid grid-cols-3 gap-4 p-3 bg-secondary/50 font-medium text-sm">
              <div>Tipo de ação</div>
              <div>Descrição</div>
              <div className="text-right">Custo</div>
            </div>
            
            <Separator />
            
            {costs.map(cost => (
              <div key={cost.id} className="grid grid-cols-3 gap-4 p-3 items-center hover:bg-secondary/20 transition-colors">
                <div>{cost.action_type}</div>
                <div>{cost.description}</div>
                <div className="flex items-center justify-end">
                  <Input 
                    type="number" 
                    value={cost.cost} 
                    onChange={e => {
                      const newCosts = costs.map(c => 
                        c.id === cost.id ? {...c, cost: parseInt(e.target.value) || 0} : c
                      );
                      setCosts(newCosts);
                    }}
                    className="w-20 text-right"
                    min="0"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleUpdateCost(cost.id, cost.cost)}
                  >
                    <Save size={16} />
                  </Button>
                </div>
              </div>
            ))}
            
            {costs.length === 0 && (
              <div className="p-6 text-center text-muted-foreground">
                Nenhum custo cadastrado.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
