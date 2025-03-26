
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  ShoppingBag, 
  User, 
  MessageSquare, 
  Plus, 
  Menu,
  X
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
  { name: "Mensagens", path: "/messages", icon: MessageSquare },
  { name: "Perfil", path: "/profile", icon: User }
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user } = useUser();
  const location = useLocation();
  const [open, setOpen] = useState(false);

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
          {routes.map((route) => (
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
          <Button asChild className="ml-2 rounded-full bg-gradient-to-r from-primary to-blue-600 text-white shadow-md hover:shadow-lg transition-all">
            <Link to="/marketplace?new=true">
              <Plus size={18} className="mr-2" />
              Anunciar
            </Link>
          </Button>
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
                {routes.map((route) => (
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
                <Button asChild className="mt-4 bg-gradient-to-r from-primary to-blue-600 text-white py-6 shadow-md">
                  <Link 
                    to="/marketplace?new=true"
                    onClick={() => setOpen(false)}
                  >
                    <Plus size={18} className="mr-2" />
                    Anunciar
                  </Link>
                </Button>
              </nav>
              {user && (
                <div className="mt-auto pt-6 border-t border-border/30">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full overflow-hidden">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Apto {user.apartment} · Bloco {user.block}
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
