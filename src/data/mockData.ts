
export type Category = {
  id: string;
  name: string;
  icon: string;
};

export type Advertisement = {
  id: string;
  userId: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  createdAt: string;
  views: number;
  isAvailable: boolean;
};

export type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  adId: string | null;
  content: string;
  timestamp: string;
  isRead: boolean;
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  apartment: string;
  block: string;
  rating: number;
  joinedAt: string;
  adCount: number;
};

export const categories: Category[] = [
  { id: "1", name: "Serviços", icon: "🛠️" },
  { id: "2", name: "Produtos", icon: "🛍️" },
  { id: "3", name: "Alimentos", icon: "🍲" },
  { id: "4", name: "Móveis", icon: "🪑" },
  { id: "5", name: "Eletrônicos", icon: "📱" },
  { id: "6", name: "Aulas", icon: "📚" },
  { id: "7", name: "Outros", icon: "🔖" },
];

export const users: User[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao@example.com",
    avatar: "https://i.pravatar.cc/300?img=68",
    apartment: "301",
    block: "A",
    rating: 4.8,
    joinedAt: "2022-01-15",
    adCount: 5,
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria@example.com",
    avatar: "https://i.pravatar.cc/300?img=5",
    apartment: "102",
    block: "B",
    rating: 4.6,
    joinedAt: "2021-11-27",
    adCount: 3,
  },
  {
    id: "3",
    name: "Carlos Oliveira",
    email: "carlos@example.com",
    avatar: "https://i.pravatar.cc/300?img=12",
    apartment: "501",
    block: "A",
    rating: 4.9,
    joinedAt: "2022-03-10",
    adCount: 8,
  },
  {
    id: "4",
    name: "Ana Ferreira",
    email: "ana@example.com",
    avatar: "https://i.pravatar.cc/300?img=9",
    apartment: "203",
    block: "C",
    rating: 4.7,
    joinedAt: "2021-09-05",
    adCount: 6,
  },
];

export const advertisements: Advertisement[] = [
  {
    id: "1",
    userId: "3",
    title: "Conserto de computadores e notebooks",
    description: "Ofereço serviços técnicos para reparo de computadores, notebooks e instalação de softwares. Atendimento no seu apartamento.",
    price: 100,
    category: "1", // Serviços
    images: ["https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?q=80&w=2670&auto=format&fit=crop"],
    createdAt: "2023-05-15T14:30:00Z",
    views: 45,
    isAvailable: true,
  },
  {
    id: "2",
    userId: "2",
    title: "Bolos caseiros por encomenda",
    description: "Faço bolos deliciosos para aniversários, festas ou qualquer ocasião. Sabores variados e entrega no seu apartamento.",
    price: 50,
    category: "3", // Alimentos
    images: ["https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=2689&auto=format&fit=crop"],
    createdAt: "2023-05-17T09:45:00Z",
    views: 38,
    isAvailable: true,
  },
  {
    id: "3",
    userId: "4",
    title: "Aulas de matemática",
    description: "Professora formada oferece aulas particulares de matemática para ensino fundamental e médio. Ajudo com dever de casa e preparação para provas.",
    price: 80,
    category: "6", // Aulas
    images: ["https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2670&auto=format&fit=crop"],
    createdAt: "2023-05-18T16:20:00Z",
    views: 22,
    isAvailable: true,
  },
  {
    id: "4",
    userId: "1",
    title: "iPhone 13 - 128GB",
    description: "Vendo iPhone 13 com 128GB de armazenamento, comprado há 6 meses. Em perfeito estado, com todos os acessórios originais e nota fiscal.",
    price: 3800,
    category: "5", // Eletrônicos
    images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=2680&auto=format&fit=crop"],
    createdAt: "2023-05-20T10:15:00Z",
    views: 56,
    isAvailable: true,
  },
  {
    id: "5",
    userId: "2",
    title: "Sofá de 3 lugares",
    description: "Vendo sofá de 3 lugares em excelente estado. Cor cinza, tecido suede, super confortável. Preciso vender para comprar um novo modelo.",
    price: 900,
    category: "4", // Móveis
    images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2670&auto=format&fit=crop"],
    createdAt: "2023-05-21T11:30:00Z",
    views: 29,
    isAvailable: true,
  },
  {
    id: "6",
    userId: "3",
    title: "Serviços de pintura residencial",
    description: "Pintor profissional oferece serviços de pintura para apartamentos. Trabalho limpo e de qualidade, com referências de outros moradores.",
    price: 0,
    category: "1", // Serviços
    images: ["https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=2670&auto=format&fit=crop"],
    createdAt: "2023-05-22T14:45:00Z",
    views: 32,
    isAvailable: true,
  },
];

export const messages: Message[] = [
  {
    id: "1",
    senderId: "2",
    receiverId: "1",
    adId: "4",
    content: "Olá! O iPhone ainda está disponível?",
    timestamp: "2023-05-22T15:30:00Z",
    isRead: true,
  },
  {
    id: "2",
    senderId: "1",
    receiverId: "2",
    adId: "4",
    content: "Oi Maria! Sim, ainda está disponível. Tem interesse?",
    timestamp: "2023-05-22T15:45:00Z",
    isRead: true,
  },
  {
    id: "3",
    senderId: "2",
    receiverId: "1",
    adId: "4",
    content: "Tenho sim! Podemos negociar o valor?",
    timestamp: "2023-05-22T16:00:00Z",
    isRead: true,
  },
  {
    id: "4",
    senderId: "3",
    receiverId: "1",
    adId: null,
    content: "João, você faria uma troca pelo seu iPhone?",
    timestamp: "2023-05-23T10:15:00Z",
    isRead: false,
  },
  {
    id: "5",
    senderId: "4",
    receiverId: "2",
    adId: "2",
    content: "Seus bolos parecem deliciosos! Você faz sem açúcar?",
    timestamp: "2023-05-23T11:20:00Z",
    isRead: false,
  },
];

// Helper function to get user by ID
export const getUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

// Helper function to get advertisement by ID
export const getAdById = (id: string): Advertisement | undefined => {
  return advertisements.find(ad => ad.id === id);
};

// Helper function to get advertisements by user ID
export const getAdsByUserId = (userId: string): Advertisement[] => {
  return advertisements.filter(ad => ad.userId === userId);
};

// Helper function to get messages for a conversation
export const getConversationMessages = (userId1: string, userId2: string): Message[] => {
  return messages.filter(
    msg => 
      (msg.senderId === userId1 && msg.receiverId === userId2) || 
      (msg.senderId === userId2 && msg.receiverId === userId1)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

// Helper function to get all conversations for a user
export const getUserConversations = (userId: string): { userId: string; lastMessage: Message }[] => {
  const conversationPartners = new Set<string>();
  const conversations: { userId: string; lastMessage: Message }[] = [];
  
  // Find all messages where the user is sender or receiver
  const userMessages = messages.filter(
    msg => msg.senderId === userId || msg.receiverId === userId
  );
  
  // Group by conversation partner
  userMessages.forEach(message => {
    const partnerId = message.senderId === userId ? message.receiverId : message.senderId;
    
    if (!conversationPartners.has(partnerId)) {
      conversationPartners.add(partnerId);
      
      // Find the last message
      const partnerMessages = userMessages.filter(
        msg => msg.senderId === partnerId || msg.receiverId === partnerId
      );
      
      const lastMessage = partnerMessages.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];
      
      conversations.push({ userId: partnerId, lastMessage });
    }
  });
  
  return conversations;
};

// Helper function to get category by ID
export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(category => category.id === id);
};

// Format price
export const formatPrice = (price: number): string => {
  if (price === 0) return "Gratuito";
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(price);
};

// Format date
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

// Format relative date (like "2 hours ago")
export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} segundo${diffInSeconds !== 1 ? 's' : ''} atrás`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''} atrás`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hora${diffInHours !== 1 ? 's' : ''} atrás`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} dia${diffInDays !== 1 ? 's' : ''} atrás`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} mês${diffInMonths !== 1 ? 'es' : ''} atrás`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} ano${diffInYears !== 1 ? 's' : ''} atrás`;
};
