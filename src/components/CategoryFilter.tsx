
import React from "react";
import { categories } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  selectedCategory, 
  onSelectCategory 
}) => {
  return (
    <div className="w-full glass-card rounded-xl p-2 mb-6">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-2 p-1">
          <button
            onClick={() => onSelectCategory(null)}
            className={cn(
              "flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
              selectedCategory === null
                ? "bg-primary text-white shadow-sm"
                : "bg-secondary/50 hover:bg-secondary text-foreground/80"
            )}
          >
            Todos
          </button>
          
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={cn(
                "flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                selectedCategory === category.id
                  ? "bg-primary text-white shadow-sm"
                  : "bg-secondary/50 hover:bg-secondary text-foreground/80"
              )}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="h-2" />
      </ScrollArea>
    </div>
  );
};

export default CategoryFilter;
