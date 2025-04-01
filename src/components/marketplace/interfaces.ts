
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
  images?: string[];
  views?: number;
  isAvailable?: boolean;
}

export interface MarketplaceHeaderProps {
  onNewAdClick: () => void;
}

export interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenFilters: () => void;
}

export interface NoResultsFoundProps {
  searchTerm: string;
}

export interface FilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface CreateAdDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreditDialogOpen: () => void;
}
