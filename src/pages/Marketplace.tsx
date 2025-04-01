import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useUser } from "@/contexts/user/UserContext";
import { useCredits } from "@/contexts/credits";
import MarketplaceHeader from "@/components/marketplace/MarketplaceHeader";
import AdList from "@/components/marketplace/AdList";
import SearchBar from "@/components/marketplace/SearchBar";
import FilterSheet from "@/components/marketplace/FilterSheet";
import CreateAdDialog from "@/components/marketplace/CreateAdDialog";
import { CreditsDialog } from "@/components/marketplace/CreditsDialog";
import NoResultsFound from "@/components/marketplace/NoResultsFound";

const Marketplace = () => {
  const [ads, setAds] = useState([
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
    },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAds, setFilteredAds] = useState(ads);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    location: "",
  });

  const { user } = useUser();
  const { fetchCredits } = useCredits();

  useEffect(() => {
    if (user) {
      fetchCredits(user.id);
    }
  }, [user, fetchCredits]);

  useEffect(() => {
    applyFilters();
  }, [ads, searchTerm, filters]);

  const applyFilters = () => {
    let newFilteredAds = [...ads];

    if (searchTerm) {
      newFilteredAds = newFilteredAds.filter((ad) =>
        ad.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.category) {
      newFilteredAds = newFilteredAds.filter(
        (ad) => ad.category === filters.category
      );
    }

    if (filters.minPrice) {
      const minPrice = parseFloat(filters.minPrice);
      newFilteredAds = newFilteredAds.filter((ad) => ad.price >= minPrice);
    }

    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice);
      newFilteredAds = newFilteredAds.filter((ad) => ad.price <= maxPrice);
    }

    if (filters.location) {
      newFilteredAds = newFilteredAds.filter((ad) =>
        ad.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    setFilteredAds(newFilteredAds);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const [showCreateAd, setShowCreateAd] = useState(false);
  const [showCreditsDialog, setShowCreditsDialog] = useState(false);
  
  return (
    <div className="container mx-auto px-4 pt-24 pb-16">
      <MarketplaceHeader onNewAdClick={() => setShowCreateAd(true)} />
      
      <div className="my-6">
        <SearchBar
          value={searchTerm}
          onChange={handleSearchChange}
          onOpenFilters={() => setShowFilters(true)}
        />
      </div>

      {filteredAds.length > 0 ? (
        <AdList ads={filteredAds} />
      ) : (
        <NoResultsFound searchTerm={searchTerm} />
      )}

      <CreateAdDialog open={showCreateAd} onOpenChange={setShowCreateAd} />
      <CreditsDialog open={showCreditsDialog} onOpenChange={setShowCreditsDialog} />
      <FilterSheet open={showFilters} onOpenChange={setShowFilters} />
    </div>
  );
};

export default Marketplace;
