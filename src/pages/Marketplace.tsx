import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import CategoryFilter from "@/components/CategoryFilter";
import { advertisements } from "@/data/mockData";
import { useUser } from "@/contexts/UserContext";
import { useCredits } from "@/contexts/credits";

// Componentes refatorados
import MarketplaceHeader from "@/components/marketplace/MarketplaceHeader";
import SearchBar from "@/components/marketplace/SearchBar";
import FilterSheet from "@/components/marketplace/FilterSheet";
import CreateAdDialog from "@/components/marketplace/CreateAdDialog";
import CreditsDialog from "@/components/marketplace/CreditsDialog";
import AdList from "@/components/marketplace/AdList";

const Marketplace = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const { fetchCredits } = useCredits();
  
  // Estados locais
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number | null, number | null]>([null, null]);
  const [sortOption, setSortOption] = useState("recent");
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get("category");
    const newParam = params.get("new");
    
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    
    if (newParam === "true" && user) {
      setIsCreateDialogOpen(true);
    }

    if (user) {
      fetchCredits(user.id);
    }
  }, [location.search, user, fetchCredits]);
  
  // Filtragem dos anúncios
  const filteredAds = advertisements.filter((ad) => {
    const matchesSearch = searchTerm === "" || 
      ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === null || ad.category === selectedCategory;
    
    const matchesMinPrice = priceRange[0] === null || ad.price >= priceRange[0];
    const matchesMaxPrice = priceRange[1] === null || ad.price <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice;
  });
  
  // Ordenação dos anúncios
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
  
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory(null);
    setPriceRange([null, null]);
    setSortOption("recent");
    
    navigate("/marketplace");
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <MarketplaceHeader 
            onCreateAdClick={() => setIsCreateDialogOpen(true)}
            onCreditDialogOpen={() => setIsCreditDialogOpen(true)}
          />
          
          <SearchBar 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortOption={sortOption}
            setSortOption={setSortOption}
            onOpenFilters={() => setIsFilterOpen(true)}
          />
          
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
          
          <AdList 
            ads={sortedAds} 
            onClearFilters={clearFilters}
          />
        </div>
      </main>
      
      <CreateAdDialog 
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreditDialogOpen={() => setIsCreditDialogOpen(true)}
      />

      <CreditsDialog 
        isOpen={isCreditDialogOpen}
        onOpenChange={setIsCreditDialogOpen}
      />

      <FilterSheet 
        isOpen={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        sortOption={sortOption}
        setSortOption={setSortOption}
        onClearFilters={clearFilters}
      />
    </div>
  );
};

export default Marketplace;
