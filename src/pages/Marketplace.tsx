
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import AdCard from "@/components/AdCard";
import CategoryFilter from "@/components/CategoryFilter";
import { advertisements, categories } from "@/data/mockData";
import { useUser } from "@/contexts/UserContext";

const Marketplace = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number | null, number | null]>([null, null]);
  const [sortOption, setSortOption] = useState("recent");
  
  // New ad form state
  const [adTitle, setAdTitle] = useState("");
  const [adDescription, setAdDescription] = useState("");
  const [adPrice, setAdPrice] = useState("");
  const [adCategory, setAdCategory] = useState("");
  
  useEffect(() => {
    // Check URL parameters
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get("category");
    const newParam = params.get("new");
    
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    
    if (newParam === "true" && user) {
      setIsCreateDialogOpen(true);
    }
  }, [location.search, user]);
  
  // Filter ads based on search term, category and price range
  const filteredAds = advertisements.filter((ad) => {
    // Filter by search term
    const matchesSearch = searchTerm === "" || 
      ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by category
    const matchesCategory = selectedCategory === null || ad.category === selectedCategory;
    
    // Filter by price range
    const matchesMinPrice = priceRange[0] === null || ad.price >= priceRange[0];
    const matchesMaxPrice = priceRange[1] === null || ad.price <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice;
  });
  
  // Sort ads
  const sortedAds = [...filteredAds].sort((a, b) => {
    switch (sortOption) {
      case "recent":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "priceAsc":
        return a.price - b.price;
      case "priceDesc":
        return b.price - a.price;
      case "popular":
        return b.views - a.views;
      default:
        return 0;
    }
  });
  
  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    
    // Update URL parameter
    const params = new URLSearchParams(location.search);
    if (categoryId === null) {
      params.delete("category");
    } else {
      params.set("category", categoryId);
    }
    
    navigate({
      pathname: location.pathname,
      search: params.toString()
    });
  };
  
  const handleCreateAd = () => {
    if (!adTitle || !adDescription || !adCategory) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    
    toast.success("Anúncio criado com sucesso!");
    setIsCreateDialogOpen(false);
    
    // Reset form
    setAdTitle("");
    setAdDescription("");
    setAdPrice("");
    setAdCategory("");
    
    // Remove new=true from URL
    const params = new URLSearchParams(location.search);
    params.delete("new");
    navigate({
      pathname: location.pathname,
      search: params.toString()
    });
  };
  
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory(null);
    setPriceRange([null, null]);
    setSortOption("recent");
    
    // Update URL
    navigate("/marketplace");
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">Marketplace</h1>
              <p className="text-muted-foreground mt-1">
                Encontre produtos e serviços oferecidos pelos moradores do seu condomínio
              </p>
            </div>
            
            <Button 
              onClick={() => setIsCreateDialogOpen(true)} 
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Plus size={16} className="mr-2" />
              Criar anúncio
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Input
                placeholder="Buscar produtos ou serviços..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 h-12"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:w-auto w-full h-12">
                  <SlidersHorizontal size={16} className="mr-2" />
                  Filtros
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                  <SheetDescription>
                    Ajuste os filtros para encontrar exatamente o que você procura.
                  </SheetDescription>
                </SheetHeader>
                
                <div className="py-6 space-y-6">
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select
                      value={selectedCategory || ""}
                      onValueChange={(value) => setSelectedCategory(value === "" ? null : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as categorias" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todas as categorias</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.icon} {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Faixa de preço</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Mínimo"
                        value={priceRange[0] === null ? "" : priceRange[0]}
                        onChange={(e) => {
                          const value = e.target.value === "" ? null : Number(e.target.value);
                          setPriceRange([value, priceRange[1]]);
                        }}
                      />
                      <span>-</span>
                      <Input
                        type="number"
                        placeholder="Máximo"
                        value={priceRange[1] === null ? "" : priceRange[1]}
                        onChange={(e) => {
                          const value = e.target.value === "" ? null : Number(e.target.value);
                          setPriceRange([priceRange[0], value]);
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Ordenar por</Label>
                    <Select value={sortOption} onValueChange={setSortOption}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma opção" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Mais recentes</SelectItem>
                        <SelectItem value="priceAsc">Menor preço</SelectItem>
                        <SelectItem value="priceDesc">Maior preço</SelectItem>
                        <SelectItem value="popular">Mais populares</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <SheetFooter className="sm:justify-between">
                  <Button variant="outline" onClick={clearFilters}>
                    Limpar filtros
                  </Button>
                  <SheetClose asChild>
                    <Button>Aplicar filtros</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
            
            <Select value={sortOption} onValueChange={setSortOption} className="md:w-48 h-12">
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mais recentes</SelectItem>
                <SelectItem value="priceAsc">Menor preço</SelectItem>
                <SelectItem value="priceDesc">Maior preço</SelectItem>
                <SelectItem value="popular">Mais populares</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
          
          {sortedAds.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Nenhum anúncio encontrado</h3>
              <p className="text-muted-foreground mb-6">
                Não encontramos nenhum anúncio com os filtros aplicados.
              </p>
              <Button onClick={clearFilters} variant="outline">
                Limpar filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedAds.map((ad) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
          )}
        </div>
      </main>
      
      {/* Create Ad Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Criar novo anúncio</DialogTitle>
            <DialogDescription>
              Preencha as informações para criar seu anúncio no marketplace do condomínio.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
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
            
            <div className="grid grid-cols-2 gap-4">
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
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateAd}>Publicar anúncio</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Marketplace;
