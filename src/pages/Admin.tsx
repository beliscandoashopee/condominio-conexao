
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";

// Schemas de validação
const packageSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  credits: z.coerce.number().int().positive("Valor deve ser positivo"),
  price: z.coerce.number().positive("Preço deve ser positivo"),
});

const costSchema = z.object({
  action_type: z.string().min(3, "Tipo deve ter pelo menos 3 caracteres"),
  cost: z.coerce.number().int().positive("Custo deve ser positivo"),
  description: z.string().min(3, "Descrição deve ter pelo menos 3 caracteres"),
});

type PackageFormData = z.infer<typeof packageSchema>;
type CostFormData = z.infer<typeof costSchema>;

const AdminPage = () => {
  const { user, profile } = useUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("packages");
  const [isPackageDialogOpen, setIsPackageDialogOpen] = useState(false);
  const [isCostDialogOpen, setIsCostDialogOpen] = useState(false);
  
  // Redirecionar se não for admin
  React.useEffect(() => {
    if (profile && profile.role !== "admin") {
      toast.error("Acesso negado: apenas administradores podem acessar esta página");
      navigate("/");
    }
  }, [profile, navigate]);

  // Formulários
  const packageForm = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: "",
      credits: 0,
      price: 0,
    },
  });

  const costForm = useForm<CostFormData>({
    resolver: zodResolver(costSchema),
    defaultValues: {
      action_type: "",
      cost: 0,
      description: "",
    },
  });

  // Queries para buscar pacotes e custos
  const { data: packages = [], isLoading: isLoadingPackages } = useQuery({
    queryKey: ["creditPackages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("credit_packages")
        .select("*")
        .order("credits", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: costs = [], isLoading: isLoadingCosts } = useQuery({
    queryKey: ["creditCosts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("credit_costs")
        .select("*")
        .order("action_type", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  // Mutations para gerenciar pacotes
  const createPackageMutation = useMutation({
    mutationFn: async (newPackage: PackageFormData) => {
      const { data, error } = await supabase
        .from("credit_packages")
        .insert([{ ...newPackage, active: true }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creditPackages"] });
      toast.success("Pacote criado com sucesso!");
      setIsPackageDialogOpen(false);
      packageForm.reset();
    },
    onError: (error) => {
      toast.error(`Erro ao criar pacote: ${error.message}`);
    },
  });

  const togglePackageActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { data, error } = await supabase
        .from("credit_packages")
        .update({ active: !active })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creditPackages"] });
      toast.success("Status do pacote atualizado!");
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar pacote: ${error.message}`);
    },
  });

  // Mutations para gerenciar custos
  const createCostMutation = useMutation({
    mutationFn: async (newCost: CostFormData) => {
      const { data, error } = await supabase
        .from("credit_costs")
        .insert([newCost])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creditCosts"] });
      toast.success("Custo de ação criado com sucesso!");
      setIsCostDialogOpen(false);
      costForm.reset();
    },
    onError: (error) => {
      toast.error(`Erro ao criar custo: ${error.message}`);
    },
  });

  const updateCostMutation = useMutation({
    mutationFn: async (cost: CostFormData & { id: string }) => {
      const { id, ...data } = cost;
      const { error } = await supabase
        .from("credit_costs")
        .update(data)
        .eq("id", id);

      if (error) throw error;
      return cost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creditCosts"] });
      toast.success("Custo atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar custo: ${error.message}`);
    },
  });

  // Handlers
  const onSubmitPackage = (data: PackageFormData) => {
    createPackageMutation.mutate(data);
  };

  const onSubmitCost = (data: CostFormData) => {
    createCostMutation.mutate(data);
  };

  if (!profile || profile.role !== "admin") {
    return (
      <div className="min-h-screen flex-col items-center justify-center">
        <Navbar />
        <div className="flex-1 flex items-center justify-center mt-20">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold">Verificando permissões...</h1>
            <Loader2 className="h-8 w-8 animate-spin mx-auto mt-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Painel de Administração</h1>
          <p className="text-muted-foreground mb-6">
            Gerencie pacotes de créditos e custos de ações
          </p>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="packages">Pacotes de Créditos</TabsTrigger>
              <TabsTrigger value="costs">Custos de Ações</TabsTrigger>
            </TabsList>
            
            {/* Pacotes de Créditos */}
            <TabsContent value="packages" className="space-y-4">
              <div className="flex justify-end mb-4">
                <Dialog open={isPackageDialogOpen} onOpenChange={setIsPackageDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Pacote
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Novo Pacote de Créditos</DialogTitle>
                    </DialogHeader>
                    
                    <Form {...packageForm}>
                      <form onSubmit={packageForm.handleSubmit(onSubmitPackage)} className="space-y-4 mt-4">
                        <FormField
                          control={packageForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome do Pacote</FormLabel>
                              <FormControl>
                                <Input placeholder="Pacote Básico" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={packageForm.control}
                          name="credits"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantidade de Créditos</FormLabel>
                              <FormControl>
                                <Input type="number" min="1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={packageForm.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preço (R$)</FormLabel>
                              <FormControl>
                                <Input type="number" min="0" step="0.01" {...field} />
                              </FormControl>
                              <FormDescription>
                                Valor em reais, ex: 19.90
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button type="button" variant="outline">Cancelar</Button>
                          </DialogClose>
                          <Button 
                            type="submit" 
                            disabled={createPackageMutation.isPending}
                          >
                            {createPackageMutation.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Salvar Pacote
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
              
              {isLoadingPackages ? (
                <div className="w-full flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableCaption>Lista de pacotes de créditos disponíveis</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Créditos</TableHead>
                      <TableHead>Preço (R$)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {packages.map((pkg) => (
                      <TableRow key={pkg.id} className={!pkg.active ? "opacity-60" : ""}>
                        <TableCell className="font-medium">{pkg.name}</TableCell>
                        <TableCell>{pkg.credits}</TableCell>
                        <TableCell>R$ {pkg.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${pkg.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {pkg.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => togglePackageActiveMutation.mutate({ id: pkg.id, active: pkg.active })}
                          >
                            {pkg.active ? 'Desativar' : 'Ativar'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {packages.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          Nenhum pacote cadastrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
            
            {/* Custos de Ações */}
            <TabsContent value="costs" className="space-y-4">
              <div className="flex justify-end mb-4">
                <Dialog open={isCostDialogOpen} onOpenChange={setIsCostDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Custo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Definir Novo Custo de Ação</DialogTitle>
                    </DialogHeader>
                    
                    <Form {...costForm}>
                      <form onSubmit={costForm.handleSubmit(onSubmitCost)} className="space-y-4 mt-4">
                        <FormField
                          control={costForm.control}
                          name="action_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Ação</FormLabel>
                              <FormControl>
                                <Input placeholder="create_ad" {...field} />
                              </FormControl>
                              <FormDescription>
                                Identificador único para a ação (ex: create_ad, feature_ad)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={costForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descrição</FormLabel>
                              <FormControl>
                                <Input placeholder="Criar anúncio" {...field} />
                              </FormControl>
                              <FormDescription>
                                Descrição amigável da ação
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={costForm.control}
                          name="cost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Custo em Créditos</FormLabel>
                              <FormControl>
                                <Input type="number" min="1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button type="button" variant="outline">Cancelar</Button>
                          </DialogClose>
                          <Button 
                            type="submit" 
                            disabled={createCostMutation.isPending}
                          >
                            {createCostMutation.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Salvar Custo
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
              
              {isLoadingCosts ? (
                <div className="w-full flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableCaption>Lista de custos de ações no sistema</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo de Ação</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Custo (créditos)</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {costs.map((cost) => (
                      <TableRow key={cost.id}>
                        <TableCell className="font-medium">{cost.action_type}</TableCell>
                        <TableCell>{cost.description}</TableCell>
                        <TableCell>{cost.cost}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              costForm.reset({
                                action_type: cost.action_type,
                                description: cost.description || "",
                                cost: cost.cost,
                              });
                              // Implementar edição
                            }}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {costs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          Nenhum custo cadastrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
