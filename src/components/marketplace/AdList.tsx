
import React from "react";
import AdCard from "@/components/AdCard";
import NoResultsFound from "./NoResultsFound";
import { Advertisement } from "@/components/marketplace/interfaces";

interface AdListProps {
  ads: Advertisement[];
  onClearFilters: () => void;
}

const AdList: React.FC<AdListProps> = ({ ads, onClearFilters }) => {
  if (ads.length === 0) {
    return <NoResultsFound onClearFilters={onClearFilters} />;
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {ads.map((ad) => (
        <AdCard key={ad.id} ad={ad} />
      ))}
    </div>
  );
};

export default AdList;
