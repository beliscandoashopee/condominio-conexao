
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import ProfileCard from "@/components/ProfileCard";
import AdCard from "@/components/AdCard";
import { useUser } from "@/contexts/UserContext";
import { getAdsByUserId, users } from "@/data/mockData";
import { LogOut, Settings } from "lucide-react";

const Profile = () => {
  const { user, logout } = useUser();
  const [activeTab, setActiveTab] = useState("ads");
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Você precisa estar logado para acessar esta página.</p>
          <Button>Fazer login</Button>
        </div>
      </div>
    );
  }
  
  const userDetail = users.find(u => u.id === user.id);
  const userAds = getAdsByUserId(user.id);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Meu Perfil</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie seus anúncios e informações pessoais
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Settings size={16} />
                Configurações
              </Button>
              <Button 
                variant="outline" 
                className="gap-2 text-destructive hover:text-destructive"
                onClick={logout}
              >
                <LogOut size={16} />
                Sair
              </Button>
            </div>
          </div>
          
          {userDetail && (
            <ProfileCard user={userDetail} isCurrentUser={true} />
          )}
          
          <div className="mt-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="ads">Meus Anúncios</TabsTrigger>
                <TabsTrigger value="saved">Anúncios Salvos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="ads" className="mt-0">
                {userAds.length === 0 ? (
                  <div className="text-center py-16 glass-card rounded-xl">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-xl font-semibold mb-2">Você ainda não possui anúncios</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Comece a anunciar seus produtos ou serviços para os outros moradores do condomínio.
                    </p>
                    <Button className="bg-primary hover:bg-primary/90 text-white">
                      Criar anúncio
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userAds.map((ad) => (
                      <AdCard key={ad.id} ad={ad} />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="saved" className="mt-0">
                <div className="text-center py-16 glass-card rounded-xl">
                  <div className="text-6xl mb-4">❤️</div>
                  <h3 className="text-xl font-semibold mb-2">Nenhum anúncio salvo</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Favorite os anúncios que você gostou para acessá-los rapidamente.
                  </p>
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    Explorar anúncios
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
