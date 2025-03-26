
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Eye, Heart } from "lucide-react";
import { 
  formatPrice, 
  formatRelativeDate, 
  getCategoryById, 
  getUserById,
  type Advertisement 
} from "@/data/mockData";

interface AdCardProps {
  ad: Advertisement;
}

const AdCard: React.FC<AdCardProps> = ({ ad }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  
  const category = getCategoryById(ad.category);
  const seller = getUserById(ad.userId);
  
  return (
    <div className="group hover-scale transition-all duration-300 h-full">
      <Link 
        to={`/ad/${ad.id}`}
        className="block h-full glass-card rounded-xl overflow-hidden"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <div className={`absolute inset-0 bg-gray-100 ${isLoading ? "animate-pulse" : "hidden"}`} />
          <img
            src={ad.images[0]}
            alt={ad.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onLoad={() => setIsLoading(false)}
          />
          
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-foreground shadow-sm">
              {category?.icon} {category?.name}
            </span>
          </div>
          
          <button 
            onClick={(e) => {
              e.preventDefault();
              setLiked(!liked);
            }}
            className={`absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-colors ${
              liked ? "text-red-500" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Heart size={16} fill={liked ? "currentColor" : "none"} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {ad.title}
            </h3>
            <span className="font-bold text-lg text-primary">
              {formatPrice(ad.price)}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 min-h-[2.5rem]">
            {ad.description}
          </p>
          
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/30">
            <div className="flex items-center">
              <div className="h-6 w-6 rounded-full overflow-hidden mr-2">
                <img 
                  src={seller?.avatar} 
                  alt={seller?.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-xs text-muted-foreground">
                Apto {seller?.apartment} · Bloco {seller?.block}
              </span>
            </div>
            
            <div className="flex items-center text-muted-foreground">
              <div className="flex items-center mr-2 text-xs">
                <Eye size={14} className="mr-1" /> 
                {ad.views}
              </div>
              <div className="text-xs">
                {formatRelativeDate(ad.createdAt)}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default AdCard;
