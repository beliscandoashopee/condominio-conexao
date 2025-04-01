import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import { CreditsProvider } from "./contexts/credits";
import { Layout } from "./components/Layout";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Marketplace from "./pages/Marketplace";
import Profile from "./pages/Profile";
import AdDetails from "./pages/AdDetails";
import Messages from "./pages/Messages";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import PurchaseCredits from "./pages/PurchaseCredits";
import PurchaseSuccess from "./pages/PurchaseSuccess";
import CreditHistory from "./pages/CreditHistory";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <CreditsProvider>
          <UserProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Layout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/ad/:id" element={<AdDetails />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/purchase-credits" element={<PurchaseCredits />} />
                  <Route path="/purchase-success" element={<PurchaseSuccess />} />
                  <Route path="/credit-history" element={<CreditHistory />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </TooltipProvider>
          </UserProvider>
        </CreditsProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
