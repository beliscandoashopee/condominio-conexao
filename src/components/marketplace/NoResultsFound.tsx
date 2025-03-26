
import React from "react";
import { Button } from "@/components/ui/button";

interface NoResultsFoundProps {
  onClearFilters: () => void;
}

const NoResultsFound: React.FC<NoResultsFoundProps> = ({ onClearFilters }) => {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-xl font-semibold mb-2">Nenhum anúncio encontrado</h3>
      <p className="text-muted-foreground mb-6">
        Não encontramos nenhum anúncio com os filtros aplicados.
      </p>
      <Button onClick={onClearFilters} variant="outline">
        Limpar filtros
      </Button>
    </div>
  );
};

export default NoResultsFound;
