
import { ReactNode } from 'react';

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  category: string;
  createdAt: string;
  image: string;
  userId: string;
  images: string[];  // Changed from optional to required to match mockData.ts
  views?: number;
  isAvailable?: boolean;
}

export interface MarketplaceHeaderProps {
  onCreateAdClick: () => void;
  onCreditDialogOpen: () => void;
}

export interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortOption: string;
  setSortOption: (option: string) => void;
  onOpenFilters: () => void;
}

export interface NoResultsFoundProps {
  onClearFilters: () => void;
}

export interface FilterSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  priceRange: [number | null, number | null];
  setPriceRange: (range: [number | null, number | null]) => void;
  sortOption: string;
  setSortOption: (option: string) => void;
  onClearFilters: () => void;
}

export interface CreateAdDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreditDialogOpen: () => void;
}

export interface CreditsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
