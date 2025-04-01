import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserProvider } from "@/contexts/user/UserContext";
import { CreditsProvider } from "@/contexts/credits/CreditsProvider";
import { CheckoutProvider } from "./contexts/checkout/CheckoutProvider";
import { CheckoutSettingsProvider } from "@/contexts/checkout/CheckoutSettingsContext";
import { Layout } from "./components/Layout";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Index from "./pages/Index";
import Auth from "@/pages/Auth";
import Marketplace from "@/pages/Marketplace";
import Profile from "@/pages/Profile";
import Admin from "@/pages/Admin";
import AdminManualCredits from "@/pages/AdminManualCredits";
import ManualCreditRequest from "@/pages/ManualCreditRequest";
import CheckoutSettings from "@/pages/CheckoutSettings";

import NotFound from "./pages/NotFound";
import AdDetails from "./pages/AdDetails";
import Messages from "./pages/Messages";
import PurchaseCredits from "./pages/PurchaseCredits";
import PurchaseSuccess from "./pages/PurchaseSuccess";
import CreditHistory from "./pages/CreditHistory";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <CheckoutProvider>
          <UserProvider>
            <CreditsProvider>
              <CheckoutSettingsProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <Layout>
                    <div className="min-h-screen flex flex-col">
                      <Navbar />
                      <main className="flex-grow">
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/auth" element={<Auth />} />
                          <Route path="/marketplace" element={<Marketplace />} />
                          <Route path="/profile" element={<Profile />} />
                          <Route path="/ad/:id" element={<AdDetails />} />
                          <Route path="/messages" element={<Messages />} />
                          <Route path="/admin" element={<Admin />} />
                          <Route path="/admin/manual-credits" element={<AdminManualCredits />} />
                          <Route path="/admin/checkout-settings" element={<CheckoutSettings />} />
                          <Route path="/manual-credit-request" element={<ManualCreditRequest />} />
                          <Route path="/purchase-credits" element={<PurchaseCredits />} />
                          <Route path="/purchase-success" element={<PurchaseSuccess />} />
                          <Route path="/credit-history" element={<CreditHistory />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </main>
                      <Footer />
                    </div>
                  </Layout>
                </TooltipProvider>
              </CheckoutSettingsProvider>
            </CreditsProvider>
          </UserProvider>
        </CheckoutProvider>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
