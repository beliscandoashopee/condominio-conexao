
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, 
  ShoppingBag, 
  User, 
  MessageSquare, 
  Plus,
  Menu,
  X,
  LogOut,
  LogIn,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const routes = [
  { name: "Início", path: "/", icon: Home },
  { name: "Marketplace", path: "/marketplace", icon: ShoppingBag },
  { name: "Mensagens", path: "/messages", icon: MessageSquare, requireAuth: true },
  { name: "Perfil", path: "/profile", icon: User, requireAuth: true }
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user, profile, logout } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setOpen(false);
  };

  const filteredRoutes = routes.filter(route => 
    !route.requireAuth || (route.requireAuth && user)
  );

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-white/80 backdrop-blur-md shadow-sm" 
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 transition-transform duration-300 hover:scale-105">
          <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            ConexãoCondomínio
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {filteredRoutes.map((route) => (
            <Link
              key={route.path}
              to={route.path}
              className={`flex items-center px-4 py-2 rounded-full transition-all duration-300 ${
                isActive(route.path)
                  ? "bg-primary text-white font-medium scale-105"
                  : "text-foreground/80 hover:bg-secondary hover:text-foreground"
              }`}
            >
              <route.icon size={18} className="mr-2" />
              <span>{route.name}</span>
            </Link>
          ))}
          
          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center px-4 py-2 rounded-full transition-all duration-300 ${
                isActive("/admin")
                  ? "bg-primary text-white font-medium scale-105"
                  : "text-foreground/80 hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Settings size={18} className="mr-2" />
              <span>Admin</span>
            </Link>
          )}
          
          {user ? (
            <>
              <Button asChild className="ml-2 rounded-full bg-gradient-to-r from-primary to-blue-600 text-white shadow-md hover:shadow-lg transition-all">
                <Link to="/marketplace?new=true">
                  <Plus size={18} className="mr-2" />
                  Anunciar
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="ml-2 rounded-full"
                onClick={handleLogout}
              >
                <LogOut size={18} />
              </Button>
            </>
          ) : (
            <Button asChild className="ml-2 rounded-full">
              <Link to="/auth">
                <LogIn size={18} className="mr-2" />
                Entrar
              </Link>
            </Button>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80%] sm:w-[350px] border-l border-border/30 bg-white/90 backdrop-blur-lg">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                  ConexãoCondomínio
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-4">
                {filteredRoutes.map((route) => (
                  <Link
                    key={route.path}
                    to={route.path}
                    onClick={() => setOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 ${
                      isActive(route.path)
                        ? "bg-primary text-white font-medium"
                        : "text-foreground/80 hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <route.icon size={20} className="mr-3" />
                    <span className="text-lg">{route.name}</span>
                  </Link>
                ))}
                
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 ${
                      isActive("/admin")
                        ? "bg-primary text-white font-medium"
                        : "text-foreground/80 hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <Settings size={20} className="mr-3" />
                    <span className="text-lg">Admin</span>
                  </Link>
                )}
                
                {user ? (
                  <>
                    <Button asChild className="mt-4 bg-gradient-to-r from-primary to-blue-600 text-white py-6 shadow-md">
                      <Link 
                        to="/marketplace?new=true"
                        onClick={() => setOpen(false)}
                      >
                        <Plus size={18} className="mr-2" />
                        Anunciar
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex items-center justify-center gap-2"
                      onClick={handleLogout}
                    >
                      <LogOut size={18} />
                      Sair
                    </Button>
                  </>
                ) : (
                  <Button asChild className="mt-4">
                    <Link 
                      to="/auth"
                      onClick={() => setOpen(false)}
                    >
                      <LogIn size={18} className="mr-2" />
                      Entrar / Cadastrar
                    </Link>
                  </Button>
                )}
              </nav>
              {profile && (
                <div className="mt-auto pt-6 border-t border-border/30">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full overflow-hidden">
                      <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{profile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {profile.apartment && profile.block ? `Apto ${profile.apartment} · Bloco ${profile.block}` : "Usuário"}
                        {isAdmin && <span className="ml-2 px-1.5 py-0.5 bg-primary/10 text-primary rounded text-xs">Admin</span>}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
