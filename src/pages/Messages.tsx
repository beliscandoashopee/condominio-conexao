
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import MessageBox from "@/components/MessageBox";
import { 
  getUserConversations, 
  getConversationMessages, 
  getUserById, 
  formatRelativeDate 
} from "@/data/mockData";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Messages = () => {
  const location = useLocation();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [isMobileViewMessage, setIsMobileViewMessage] = useState(false);
  
  // Get all user conversations
  const conversations = user 
    ? getUserConversations(user.id) 
    : [];
  
  // Filter conversations based on search term
  const filteredConversations = searchTerm === ""
    ? conversations
    : conversations.filter((conv) => {
        const partner = getUserById(conv.userId);
        if (!partner) return false;
        
        return partner.name.toLowerCase().includes(searchTerm.toLowerCase());
      });
  
  // Get messages for active conversation
  const activeMessages = user && activeConversation 
    ? getConversationMessages(user.id, activeConversation) 
    : [];
  
  // Check if we should open a specific conversation
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userId = params.get("user");
    
    if (userId) {
      setActiveConversation(userId);
      setIsMobileViewMessage(true);
    }
  }, [location.search]);
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileViewMessage(false);
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  const handleSendMessage = (message: string) => {
    toast.success("Mensagem enviada com sucesso!");
  };
  
  const handleBackToConversations = () => {
    setIsMobileViewMessage(false);
  };
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Você precisa estar logado para acessar esta página.</p>
          <button className="bg-primary text-white px-4 py-2 rounded-md">
            Fazer login
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Mensagens</h1>
            <p className="text-muted-foreground mt-1">
              Converse com outros moradores do condomínio
            </p>
          </div>
          
          <div className="glass-card rounded-xl overflow-hidden flex h-[600px]">
            {/* Conversations List - will be hidden on mobile when viewing a message */}
            <div 
              className={cn(
                "w-full md:w-1/3 border-r border-border/30 flex flex-col",
                isMobileViewMessage ? "hidden md:flex" : "flex"
              )}
            >
              <div className="p-3 border-b border-border/30">
                <div className="relative">
                  <Input
                    placeholder="Buscar conversas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      {searchTerm 
                        ? "Nenhuma conversa encontrada" 
                        : "Você ainda não tem nenhuma conversa"}
                    </p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const partner = getUserById(conv.userId);
                    if (!partner) return null;
                    
                    const isActive = activeConversation === partner.id;
                    const message = conv.lastMessage;
                    const isUnread = message.receiverId === user.id && !message.isRead;
                    
                    return (
                      <button
                        key={partner.id}
                        className={`w-full text-left p-4 border-b border-border/30 hover:bg-gray-50 transition-colors ${
                          isActive ? "bg-gray-50" : ""
                        }`}
                        onClick={() => {
                          setActiveConversation(partner.id);
                          setIsMobileViewMessage(true);
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="h-12 w-12 rounded-full overflow-hidden">
                              <img
                                src={partner.avatar}
                                alt={partner.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            {isUnread && (
                              <span className="absolute top-0 right-0 h-3 w-3 bg-primary rounded-full" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <h3 className={`font-medium truncate ${isUnread ? "font-semibold" : ""}`}>
                                {partner.name}
                              </h3>
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                {formatRelativeDate(message.timestamp)}
                              </span>
                            </div>
                            
                            <p className={`text-sm truncate ${
                              isUnread 
                                ? "text-foreground font-medium" 
                                : "text-muted-foreground"
                            }`}>
                              {message.senderId === user.id ? "Você: " : ""}
                              {message.content}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
            
            {/* Messages View - will take full width on mobile when viewing a message */}
            <div 
              className={cn(
                "w-full md:w-2/3 flex flex-col",
                !isMobileViewMessage && !activeConversation ? "hidden md:flex" : "flex",
                !activeConversation && "items-center justify-center"
              )}
            >
              {activeConversation ? (
                <MessageBox
                  messages={activeMessages}
                  recipientId={activeConversation}
                  onSendMessage={handleSendMessage}
                />
              ) : (
                <div className="text-center p-10">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-xl font-medium mb-2">Suas mensagens</h3>
                  <p className="text-muted-foreground mb-4 max-w-xs mx-auto">
                    Selecione uma conversa para ver as mensagens ou inicie uma nova conversa.
                  </p>
                </div>
              )}
            </div>
            
            {/* Mobile Back Button */}
            {isMobileViewMessage && activeConversation && (
              <button
                className="md:hidden fixed bottom-6 right-6 bg-primary text-white h-12 w-12 rounded-full flex items-center justify-center shadow-lg"
                onClick={handleBackToConversations}
              >
                <X size={24} />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;
