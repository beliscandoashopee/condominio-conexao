import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useUser } from "@/contexts/user/UserContext";
import { useCredits } from "@/contexts/credits";
import MarketplaceHeader from "@/components/marketplace/MarketplaceHeader";
import AdList from "@/components/marketplace/AdList";
import SearchBar from "@/components/marketplace/SearchBar";
import FilterSheet from "@/components/marketplace/FilterSheet";
import CreateAdDialog from "@/components/marketplace/CreateAdDialog";
import { CreditsDialog } from "@/components/marketplace/CreditsDialog";
import NoResultsFound from "@/components/marketplace/NoResultsFound";
import { Advertisement } from "@/components/marketplace/interfaces";

const Marketplace = () => {
  const [ads, setAds] = useState<Advertisement[]>([
    {
      id: "1",
      title: "Guitarra Fender Stratocaster",
      description: "Em perfeito estado, pouco usada.",
      price: 2500,
      location: "São Paulo, SP",
      category: "Instrumentos Musicais",
      createdAt: "2024-08-01T10:00:00",
      image: "https://picsum.photos/400/300",
      userId: "user123",
      images: ["https://picsum.photos/400/300"],
      views: 0,
      isAvailable: true
    },
    {
      id: "2",
      title: "iPhone 13 Pro Max",
      description: "128GB, bateria 100%.",
      price: 5000,
      location: "Rio de Janeiro, RJ",
      category: "Eletrônicos",
      createdAt: "2024-08-05T15:30:00",
      image: "https://picsum.photos/400/300",
      userId: "user456",
      images: ["https://picsum.photos/400/300"],
      views: 0,
      isAvailable: true
    },
    {
      id: "3",
      title: "Tênis Nike Air Max",
      description: "Novo, nunca usado, tamanho 42.",
      price: 800,
      location: "Belo Horizonte, MG",
      category: "Vestuário",
      createdAt: "2024-08-10T08:45:00",
      image: "https://picsum.photos/400/300",
      userId: "user789",
      images: ["https://picsum.photos/400/300"],
      views: 0,
      isAvailable: true
    },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAds, setFilteredAds] = useState(ads);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState("recent");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number | null, number | null]>([null, null]);

  const { user } = useUser();
  const { fetchCredits } = useCredits();

  useEffect(() => {
    if (user) {
      fetchCredits(user.id);
    }
  }, [user, fetchCredits]);

  useEffect(() => {
    applyFilters();
  }, [ads, searchTerm, selectedCategory, priceRange, sortOption]);

  const applyFilters = () => {
    let newFilteredAds = [...ads];

    if (searchTerm) {
      newFilteredAds = newFilteredAds.filter((ad) =>
        ad.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      newFilteredAds = newFilteredAds.filter(
        (ad) => ad.category === selectedCategory
      );
    }

    if (priceRange[0] !== null) {
      newFilteredAds = newFilteredAds.filter((ad) => ad.price >= (priceRange[0] || 0));
    }

    if (priceRange[1] !== null) {
      newFilteredAds = newFilteredAds.filter((ad) => ad.price <= (priceRange[1] || Infinity));
    }

    // Apply sorting
    switch (sortOption) {
      case 'recent':
        newFilteredAds.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'priceAsc':
        newFilteredAds.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        newFilteredAds.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        newFilteredAds.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
    }

    setFilteredAds(newFilteredAds);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory(null);
    setPriceRange([null, null]);
    setSortOption("recent");
  };

  const [showCreateAd, setShowCreateAd] = useState(false);
  const [showCreditsDialog, setShowCreditsDialog] = useState(false);
  
  return (
    <Layout>
      <div className="container mx-auto px-4 pt-24 pb-16">
        <MarketplaceHeader 
          onCreateAdClick={() => setShowCreateAd(true)}
          onCreditDialogOpen={() => setShowCreditsDialog(true)}
        />
        
        <div className="my-6">
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortOption={sortOption}
            setSortOption={setSortOption}
            onOpenFilters={() => setShowFilters(true)}
          />
        </div>

        {filteredAds.length > 0 ? (
          <AdList ads={filteredAds} onClearFilters={clearFilters} />
        ) : (
          <NoResultsFound onClearFilters={clearFilters} />
        )}

        <CreateAdDialog 
          isOpen={showCreateAd} 
          onOpenChange={setShowCreateAd}
          onCreditDialogOpen={() => setShowCreditsDialog(true)}
        />
        
        <CreditsDialog 
          open={showCreditsDialog} 
          onOpenChange={setShowCreditsDialog} 
        />
        
        <FilterSheet 
          isOpen={showFilters} 
          onOpenChange={setShowFilters}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          sortOption={sortOption}
          setSortOption={setSortOption}
          onClearFilters={clearFilters}
        />
      </div>
    </Layout>
  );
};

export default Marketplace;
