
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  MessageSquare, 
  MapPin, 
  Clock, 
  Eye 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import MessageBox from "@/components/MessageBox";
import ProfileCard from "@/components/ProfileCard";
import { 
  getAdById, 
  getUserById, 
  getCategoryById, 
  formatPrice, 
  formatRelativeDate,
  getConversationMessages 
} from "@/data/mockData";
import { useUser } from "@/contexts/UserContext";

const AdDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const [activeImage, setActiveImage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  
  // Get ad details
  const ad = getAdById(id || "");
  const seller = ad ? getUserById(ad.userId) : undefined;
  const category = ad ? getCategoryById(ad.category) : undefined;
  
  // Get conversation messages
  const messages = user && seller 
    ? getConversationMessages(user.id, seller.id) 
    : [];
  
  useEffect(() => {
    if (!ad || !seller) {
      navigate("/marketplace");
      toast.error("Anúncio não encontrado");
    }
  }, [ad, seller, navigate]);

  if (!ad || !seller) {
    return null;
  }
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: ad.title,
        text: `Confira este anúncio: ${ad.title}`,
        url: window.location.href,
      }).catch((error) => {
        console.error('Erro ao compartilhar:', error);
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado para a área de transferência!");
    }
  };
  
  const handleSendMessage = (message: string) => {
    toast.success("Mensagem enviada com sucesso!");
    
    // In a real app, we would send the message to the API
    // For now, we'll just navigate to the messages page
    setTimeout(() => {
      setIsMessageOpen(false);
      navigate("/messages");
    }, 1000);
  };
  
  const handleContactSeller = () => {
    setIsMessageOpen(true);
  };
  
  const isCurrentUser = user?.id === seller.id;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="flex items-center text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft size={16} className="mr-2" />
              Voltar
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images and Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <div className="glass-card rounded-xl overflow-hidden">
                <div className="aspect-[4/3] relative">
                  <img
                    src={ad.images[activeImage]}
                    alt={ad.title}
                    className="w-full h-full object-contain bg-gray-50"
                  />
                  
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button 
                      onClick={() => setLiked(!liked)}
                      className={`w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm transition-colors ${
                        liked ? "text-red-500" : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      <Heart size={20} fill={liked ? "currentColor" : "none"} />
                    </button>
                    <button 
                      onClick={handleShare}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>
                
                {ad.images.length > 1 && (
                  <div className="flex p-2 space-x-2 overflow-x-auto">
                    {ad.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImage(index)}
                        className={`relative rounded-lg overflow-hidden flex-shrink-0 h-16 w-16 border-2 transition-all ${
                          activeImage === index 
                            ? "border-primary" 
                            : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Imagem ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Ad Details */}
              <div className="glass-card rounded-xl p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {category && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-secondary/70 text-foreground">
                          {category.icon} {category.name}
                        </span>
                      )}
                      <span className="text-muted-foreground text-sm flex items-center">
                        <Clock size={14} className="mr-1" />
                        {formatRelativeDate(ad.createdAt)}
                      </span>
                      <span className="text-muted-foreground text-sm flex items-center">
                        <Eye size={14} className="mr-1" />
                        {ad.views} visualizações
                      </span>
                    </div>
                    <h1 className="text-2xl font-bold">{ad.title}</h1>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {formatPrice(ad.price)}
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold mb-2">Descrição</h2>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {ad.description}
                  </p>
                </div>
                
                <div className="flex items-center text-muted-foreground">
                  <MapPin size={16} className="mr-1" />
                  <span className="text-sm">
                    Condomínio Residencial · Apto {seller.apartment} · Bloco {seller.block}
                  </span>
                </div>
                
                {!isCurrentUser && (
                  <div className="pt-4">
                    <Button 
                      onClick={handleContactSeller}
                      className="w-full bg-primary hover:bg-primary/90 text-white"
                    >
                      <MessageSquare size={18} className="mr-2" />
                      Contatar vendedor
                    </Button>
                  </div>
                )}
                
                {isCurrentUser && (
                  <div className="pt-4 flex space-x-4">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => toast.info("Função não implementada ainda.")}
                    >
                      Editar anúncio
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="flex-1"
                      onClick={() => toast.info("Função não implementada ainda.")}
                    >
                      Desativar anúncio
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Right Column - Seller Info */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Informações do vendedor</h2>
              <ProfileCard 
                user={seller} 
                isCurrentUser={isCurrentUser}
                onContactClick={!isCurrentUser ? handleContactSeller : undefined}
              />
              
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Dicas de segurança</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Conheça o vendedor pessoalmente antes de fechar negócio
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Confira o produto antes de efetuar o pagamento
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Prefira locais públicos para encontros
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Desconfie de preços muito abaixo do mercado
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Comunique à administração caso encontre algum problema
                  </li>
                </ul>
              </div>
              
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Mais anúncios</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Veja mais anúncios em nosso marketplace:
                </p>
                <Link to="/marketplace">
                  <Button variant="outline" className="w-full">
                    Ver todos os anúncios
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Message Sheet */}
      <Sheet open={isMessageOpen} onOpenChange={setIsMessageOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0">
          <div className="flex flex-col h-full">
            <MessageBox
              messages={messages}
              recipientId={seller.id}
              adId={ad.id}
              onSendMessage={handleSendMessage}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdDetails;
