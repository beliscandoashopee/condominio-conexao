import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Home, 
  ShoppingBag, 
  User, 
  MessageSquare,
  CreditCard,
  History,
  Settings,
  Receipt,
  CreditCard as CreditCardIcon
} from "lucide-react";
import { useUser } from "@/contexts/user/UserContext";
import { Logo } from "./navigation/Logo";
import { DesktopNav } from "@/components/navigation/DesktopNav";
import { MobileNav } from "@/components/navigation/MobileNav";
import { RouteConfig } from "@/components/navigation/types";

const routes: RouteConfig[] = [
  {
    name: "Início",
    path: "/",
    icon: Home,
  },
  {
    name: "Marketplace",
    path: "/marketplace",
    icon: ShoppingBag,
  },
  {
    name: "Perfil",
    path: "/profile",
    icon: User,
    isAuth: true,
  },
];

const adminRoutes: RouteConfig[] = [
  {
    name: "Painel Admin",
    path: "/admin",
    icon: Settings,
    isAdmin: true,
  },
  {
    name: "Config. Checkout",
    path: "/admin/checkout-settings",
    icon: CreditCard,
    isAdmin: true,
  },
  {
    name: "Créditos Manuais",
    path: "/admin/manual-credits",
    icon: Receipt,
    isAdmin: true,
  },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user, isAdmin, signOut } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
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

  const handleLogout = async () => {
    await signOut();
    navigate("/");
    setOpen(false);
  };

  const filteredRoutes = [
    ...routes.filter((route) => !route.isAuth || user),
    ...(isAdmin ? adminRoutes : []),
  ];

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
