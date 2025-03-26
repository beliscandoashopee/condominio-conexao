
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "@/data/mockData";

interface FilterSheetProps {
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

const FilterSheet: React.FC<FilterSheetProps> = ({
  isOpen,
  onOpenChange,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  sortOption,
  setSortOption,
  onClearFilters,
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
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
          <Button variant="outline" onClick={onClearFilters}>
            Limpar filtros
          </Button>
          <SheetClose asChild>
            <Button>Aplicar filtros</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default FilterSheet;
