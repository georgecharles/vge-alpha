import React, { Suspense, useEffect, useState } from "react";
import { PasswordProtect } from "./components/PasswordProtect";
import { Loading } from "./components/ui/loading";
import { AnimatePresence, motion } from "framer-motion";
import {
  useLocation,
  useNavigate,
  useRoutes,
  Routes,
  Route,
} from "react-router-dom";
import { ProgressBar } from "./components/ui/progress-bar";
import { AuthProvider } from "./lib/auth";
import { Toaster } from "./components/ui/toaster";
import Home from "./components/home";
import Dashboard from "./components/Dashboard";
import PricingPage from "./components/PricingPage";
import SubscriptionSuccess from "./components/SubscriptionSuccess";
import SubscriptionCancel from "./components/SubscriptionCancel";
import AccountSettings from "./components/AccountSettings";
import { RequireAuth } from "./components/RequireAuth";
import routes from "tempo-routes";
import FeaturedProperties from "./components/SearchResults";
import MarketInsightsPage from "./components/MarketInsightsPage";
import MarketTrendsPage from "./components/MarketTrendsPage";
import { ArticlePage } from "./components/ArticlePage";
import ResearchPage from "./components/ResearchPage";
import BlogPage from "./components/BlogPage";
import InvestmentCalculator from "./components/InvestmentCalculator";
import HelpSupportPage from "./components/HelpSupportPage";
import { ChatBot } from "./components/ChatBot";
import AuthCallback from "./components/AuthCallback";

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleStop = () => setIsLoading(false);

    handleStart();
    const timer = setTimeout(handleStop, 100);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {isLoading && <ProgressBar />}
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Suspense fallback={<Loading />}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/deals" element={<FeaturedProperties />} />
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            />
            <Route path="/pricing" element={<PricingPage />} />
            <Route
              path="/subscription/success"
              element={<SubscriptionSuccess />}
            />
            <Route
              path="/subscription/cancel"
              element={<SubscriptionCancel />}
            />
            <Route
              path="/account"
              element={
                <RequireAuth>
                  <AccountSettings />
                </RequireAuth>
              }
            />
            <Route path="/insights" element={<MarketInsightsPage />} />
            <Route path="/trends" element={<AuthProvider><MarketTrendsPage /></AuthProvider>} />
            <Route path="/research" element={<ResearchPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/article/:title" element={<ArticlePage />} />
            <Route path="/blog/:slug" element={<ArticlePage />} />
            <Route path="/calculators" element={<InvestmentCalculator />} />
            <Route path="/help" element={<HelpSupportPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            {import.meta.env.VITE_TEMPO === "true" && (
              <Route path="/tempobook/*" />
            )}
          </Routes>
        </Suspense>
      </motion.div>
      {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      <Toaster />
      <ChatBot />
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(() => {
    return localStorage.getItem("password-protected") === "true";
  });

  if (!isAuthenticated) {
    return <PasswordProtect onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
