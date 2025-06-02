
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { categories } from "@/data/mockData";
import { useUser } from "@/contexts/user/UserContext";
import { useCredits } from "@/contexts/credits";

const NewAd = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { spendCredits, hasEnoughCredits, getCreditCost, fetchCredits } = useCredits();
  
  const [adTitle, setAdTitle] = useState("");
  const [adDescription, setAdDescription] = useState("");
  const [adPrice, setAdPrice] = useState("");
  const [adCategory, setAdCategory] = useState("");
  const [adHighlighted, setAdHighlighted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchCredits(user.id);
  }, [user, navigate, fetchCredits]);

  const handleCreateAd = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para criar um anúncio.");
      navigate("/auth");
      return;
    }

    if (!adTitle || !adDescription || !adCategory) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setIsLoading(true);
    
    try {
      const canCreateAd = await spendCredits("create_ad", user.id);
      if (!canCreateAd) {
        toast.error("Você não tem créditos suficientes para criar um anúncio.");
        setIsLoading(false);
        return;
      }

      if (adHighlighted) {
        const canHighlightAd = await spendCredits("highlight_ad", user.id);
        if (!canHighlightAd) {
          toast.error("Você não tem créditos suficientes para destacar o anúncio.");
          setIsLoading(false);
          return;
        }
      }
      
      toast.success("Anúncio criado com sucesso!");
      navigate("/marketplace");
    } catch (error) {
      toast.error("Erro ao criar anúncio. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-2xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/marketplace")}
            className="mb-4 -ml-4"
          >
            <ArrowLeft size={18} className="mr-2" />
            Voltar ao Marketplace
          </Button>
          
          <h1 className="text-3xl font-bold">Criar novo anúncio</h1>
          <p className="text-muted-foreground mt-1">
            Preencha as informações para criar seu anúncio no marketplace do condomínio.
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título do anúncio *</Label>
            <Input
              id="title"
              placeholder="Ex: iPhone 13 128GB"
              value={adTitle}
              onChange={(e) => setAdTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              placeholder="Descreva o produto ou serviço..."
              value={adDescription}
              onChange={(e) => setAdDescription(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                placeholder="0.00"
                value={adPrice}
                onChange={(e) => setAdPrice(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Deixe em branco para indicar "A combinar"
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select value={adCategory} onValueChange={setAdCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="highlight" className="font-medium">Destacar anúncio</Label>
                <p className="text-sm text-muted-foreground">
                  Seu anúncio aparecerá no topo da lista por 7 dias
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {getCreditCost("highlight_ad")} créditos
                </span>
                <Button
                  type="button"
                  variant={adHighlighted ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (!hasEnoughCredits("highlight_ad") && !adHighlighted) {
                      toast.error("Você não tem créditos suficientes para destacar o anúncio.");
                      return;
                    }
                    setAdHighlighted(!adHighlighted);
                  }}
                >
                  {adHighlighted ? (
                    <>
                      <Sparkles size={14} className="mr-1" /> Ativo
                    </>
                  ) : "Ativar"}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Imagens</Label>
            <div className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center">
              <Button type="button" variant="outline" className="mb-2">
                Adicionar imagens
              </Button>
              <p className="text-xs text-muted-foreground">
                Arraste e solte ou clique para selecionar (máx. 5 imagens)
              </p>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Custo</AlertTitle>
            <AlertDescription>
              Publicar este anúncio custará {getCreditCost("create_ad")} créditos
              {adHighlighted ? ` + ${getCreditCost("highlight_ad")} créditos para destacá-lo` : ""}.
            </AlertDescription>
          </Alert>
          
          <div className="flex gap-4 pt-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/marketplace")}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateAd}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "Criando..." : "Publicar anúncio"}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NewAd;
