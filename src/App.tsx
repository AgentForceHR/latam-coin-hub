import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Web3Provider } from "@/contexts/Web3Context";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Earn from "./pages/Earn";
import Borrow from "./pages/Borrow";
import Governance from "./pages/Governance";
import SolDeFiLanding from "./pages/SolDeFiLanding";
import SolDeFiApp from "./pages/SolDeFiApp";
import Beta from "./pages/Beta";
import BetaTest from "./pages/BetaTest";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <Web3Provider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/earn" element={<Earn />} />
            <Route path="/borrow" element={<Borrow />} />
            <Route path="/governance" element={<Governance />} />
            <Route path="/soldefi" element={<SolDeFiLanding />} />
            <Route path="/soldefi/app" element={<SolDeFiApp />} />
            <Route path="/beta" element={<Beta />} />
            <Route path="/beta/test" element={<BetaTest />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </Web3Provider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
