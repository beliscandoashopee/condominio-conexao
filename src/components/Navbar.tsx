
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Home, 
  ShoppingBag, 
  User, 
  MessageSquare,
  CreditCard
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { Logo } from "./navigation/Logo";
import { DesktopNav } from "./navigation/DesktopNav";
import { MobileNav } from "./navigation/MobileNav";
import { RouteConfig } from "./navigation/types";

const routes: RouteConfig[] = [
  { name: "Início", path: "/", icon: Home },
  { name: "Marketplace", path: "/marketplace", icon: ShoppingBag },
  { name: "Mensagens", path: "/messages", icon: MessageSquare, requireAuth: true },
  { name: "Perfil", path: "/profile", icon: User, requireAuth: true },
  { name: "Créditos", path: "/purchase-credits", icon: CreditCard, requireAuth: true }
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
        <Logo />
        <DesktopNav 
          routes={filteredRoutes} 
          isActive={isActive} 
          user={user} 
          isAdmin={isAdmin} 
          handleLogout={handleLogout} 
        />
        <MobileNav 
          routes={filteredRoutes} 
          isActive={isActive} 
          user={user} 
          profile={profile} 
          isAdmin={isAdmin} 
          handleLogout={handleLogout} 
          open={open} 
          setOpen={setOpen} 
        />
      </div>
    </header>
  );
};

export default Navbar;
