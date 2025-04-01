import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  ShoppingCart, 
  CreditCard,
  Wallet,
  CreditCardIcon
} from "lucide-react";

const AdminMenu = () => {
  const location = useLocation();

  const menuItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard
    },
    {
      title: "Usuários",
      href: "/admin/users",
      icon: Users
    },
    {
      title: "Anúncios",
      href: "/admin/listings",
      icon: ShoppingCart
    },
    {
      title: "Pacotes de Créditos",
      href: "/admin/credit-packages",
      icon: CreditCard
    },
    {
      title: "Solicitações de Créditos",
      href: "/admin/manual-credits",
      icon: Wallet
    },
    {
      title: "Configurações de Checkout",
      href: "/admin/checkout-settings",
      icon: CreditCardIcon
    },
    {
      title: "Configurações",
      href: "/admin/settings",
      icon: Settings
    }
  ];

  return (
    <nav className="space-y-1">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
};

export default AdminMenu; 