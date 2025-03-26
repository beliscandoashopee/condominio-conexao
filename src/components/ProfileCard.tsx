
import React from "react";
import { Star, MapPin, Calendar, ShoppingBag } from "lucide-react";
import { formatDate, User } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ProfileCardProps {
  user: User;
  isCurrentUser?: boolean;
  onContactClick?: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ 
  user, 
  isCurrentUser = false,
  onContactClick
}) => {
  const handleContactClick = () => {
    if (onContactClick) {
      onContactClick();
    } else {
      toast.info("Função de contato será implementada em breve!");
    }
  };

  const handleEditClick = () => {
    toast.info("Função de edição será implementada em breve!");
  };

  return (
    <div className="glass-card rounded-xl p-6 animate-appear">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
          
          <div className="flex items-center justify-center sm:justify-start mb-3">
            <div className="flex items-center text-amber-500 mr-3">
              <Star size={16} className="fill-current" />
              <span className="ml-1 font-medium">{user.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <MapPin size={14} className="mr-1" />
              <span className="text-sm">Apto {user.apartment} · Bloco {user.block}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center text-muted-foreground text-sm">
              <Calendar size={14} className="mr-2 text-primary" />
              <div>
                <p className="font-medium text-foreground">Membro desde</p>
                <p>{formatDate(user.joinedAt)}</p>
              </div>
            </div>
            <div className="flex items-center text-muted-foreground text-sm">
              <ShoppingBag size={14} className="mr-2 text-primary" />
              <div>
                <p className="font-medium text-foreground">Anúncios ativos</p>
                <p>{user.adCount} anúncios</p>
              </div>
            </div>
          </div>
          
          {isCurrentUser ? (
            <Button 
              onClick={handleEditClick}
              variant="outline" 
              className="w-full sm:w-auto"
            >
              Editar perfil
            </Button>
          ) : (
            <Button 
              onClick={handleContactClick}
              className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90"
            >
              Entrar em contato
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
