import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag, MessageSquare, User, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { 
  advertisements, 
  categories, 
  users, 
  formatRelativeDate 
} from "@/data/mockData";
import { useUser } from "@/contexts/user/UserContext";

const Index = () => {
  const { user } = useUser();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Get only the first 3 ads for preview
  const recentAds = [...advertisements]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 opacity-50"
          style={{
            transform: `translateY(${scrollY * 0.4}px)`,
            transition: "transform 0.1s ease-out"
          }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-appear"
              style={{ animationDelay: "0.1s" }}
            >
              Conecte-se aos seus vizinhos e descubra produtos e serviços locais
            </h1>
            <p 
              className="text-xl text-muted-foreground mb-8 animate-appear"
              style={{ animationDelay: "0.3s" }}
            >
              O Conexão Condomínio permite que você anuncie e encontre produtos e serviços oferecidos pelos moradores do seu condomínio.
            </p>
            <div 
              className="flex flex-col sm:flex-row gap-4 justify-center animate-appear"
              style={{ animationDelay: "0.5s" }}
            >
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white">
                <Link to="/marketplace">
                  <ShoppingBag size={18} className="mr-2" />
                  Ver anúncios
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/marketplace?new=true">
                  Criar anúncio
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        <div 
          className="absolute -bottom-10 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent"
          style={{
            transform: `translateY(${scrollY * 0.1}px)`,
          }}
        />
      </section>
      
      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Categorias</h2>
            <Link 
              to="/marketplace" 
              className="flex items-center text-primary hover:text-primary/80 transition-colors"
            >
              Ver todas
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map((category) => (
              <Link 
                key={category.id}
                to={`/marketplace?category=${category.id}`}
                className="glass-card rounded-xl p-4 text-center hover-scale"
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <h3 className="font-medium">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Recent Ads Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Anúncios recentes</h2>
            <Link 
              to="/marketplace" 
              className="flex items-center text-primary hover:text-primary/80 transition-colors"
            >
              Ver todos
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentAds.map((ad) => {
              const seller = users.find(u => u.id === ad.userId);
              const category = categories.find(c => c.id === ad.category);
              
              return (
                <Link 
                  key={ad.id}
                  to={`/ad/${ad.id}`}
                  className="glass-card rounded-xl overflow-hidden hover-scale"
                >
                  <div className="aspect-[3/2] relative">
                    <img 
                      src={ad.images[0]} 
                      alt={ad.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-foreground shadow-sm">
                        {category?.icon} {category?.name}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{ad.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {ad.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full overflow-hidden mr-2">
                          <img 
                            src={seller?.avatar} 
                            alt={seller?.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{seller?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatRelativeDate(ad.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      {ad.price === 0 ? (
                        <span className="text-sm font-medium text-green-600">
                          Gratuito
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-primary">
                          R$ {ad.price.toFixed(2).replace(".", ",")}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">Como funciona</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Anuncie seus produtos ou serviços</h3>
              <p className="text-muted-foreground">
                Crie anúncios para vender produtos que não usa mais ou ofereça seus serviços para outros moradores.
              </p>
            </div>
            
            <div className="glass-card rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Negocie diretamente</h3>
              <p className="text-muted-foreground">
                Entre em contato com os anunciantes através do nosso sistema de mensagens para negociar valores e condições.
              </p>
            </div>
            
            <div className="glass-card rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Avalie as transações</h3>
              <p className="text-muted-foreground">
                Após a conclusão da negociação, você pode avaliar o vendedor ou comprador para ajudar a comunidade.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Comece a se conectar agora</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Junte-se a outros moradores do seu condomínio e comece a anunciar seus produtos e serviços ou encontre o que está procurando.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
              <Link to="/marketplace">
                <ShoppingBag size={18} className="mr-2" />
                Explorar anúncios
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
              <Link to="/profile">
                <User size={18} className="mr-2" />
                Ver meu perfil
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-xl font-bold">ConexãoCondomínio</h2>
              <p className="text-gray-400 mt-2">
                © {new Date().getFullYear()} Todos os direitos reservados
              </p>
            </div>
            
            <div className="flex space-x-6">
              <Link to="/marketplace" className="text-gray-400 hover:text-white transition-colors">
                Marketplace
              </Link>
              <Link to="/messages" className="text-gray-400 hover:text-white transition-colors">
                Mensagens
              </Link>
              <Link to="/profile" className="text-gray-400 hover:text-white transition-colors">
                Perfil
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
