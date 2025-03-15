import { Suspense, useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider, useAuth } from "./lib/auth";
import { Loading } from "./components/ui/loading";
import { ProgressBar } from "./components/ui/progress-bar";
import Header from './components/Header';
import Home from "./components/home";
import Dashboard from "./components/Dashboard";
import PricingPage from "./components/PricingPage";
import SubscriptionSuccess from "./components/SubscriptionSuccess";
import SubscriptionCancel from "./components/SubscriptionCancel";
import AccountSettings from "./components/AccountSettings";
import NotFound from "./components/NotFound";
import MarketInsightsPage from "./components/MarketInsightsPage";
import MarketTrendsPage from "./components/MarketTrendsPage";
import { ArticlePage } from "./components/ArticlePage";
import ResearchPage from "./components/ResearchPage";
import BlogPage from "./components/BlogPage";
import HelpSupportPage from "./components/HelpSupportPage";
import { ChatBot } from "./components/ChatBot";
import AuthCallback from "./components/AuthCallback";
import PropertyManagementPage from "./components/PropertyManagementPage";
import InvestmentOpportunitiesPage from "./components/InvestmentOpportunitiesPage";
import AboutUsPage from "./components/AboutUsPage";
import DealsPage from "./components/DealsPage";
import Messages from "./pages/Messages";
import Listings from './pages/Listings';
import Calculators from "./pages/Calculators";
import ReportDetailPage from "./components/ReportDetailPage";

// Add a wrapper component for ArticlePage that extracts URL parameters
function ArticlePageWrapper() {
  const { title } = useParams();
  
  // Provide default or placeholder values
  return (
    <ArticlePage 
      title={title || "Loading..."} 
      content="Content is loading..." 
      date={new Date().toISOString().split('T')[0]} 
    />
  );
}

// Wrap the main content in a component to use hooks
function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const { user, profile, signOut, refreshSession } = useAuth();

  // Log auth state for debugging
  useEffect(() => {
    console.log("Auth state in App:", { user, profile });
    
    // Refresh session on mount to ensure we have the latest auth state
    refreshSession();
  }, []);

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
      <Header 
        isAuthenticated={!!user}
        userProfile={profile || undefined}
        onSignIn={() => {
          // This will be handled by the Header component
        }}
        onSignUp={() => {
          // This will be handled by the Header component
        }}
        onSignOut={signOut}
      />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/trends" element={<MarketTrendsPage />} />
          <Route path="/insights" element={<MarketInsightsPage />} />
          <Route path="/calculators" element={<Calculators />} />
          <Route path="/profile" element={<AccountSettings />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/subscription/success" element={<SubscriptionSuccess />} />
          <Route path="/subscription/cancel" element={<SubscriptionCancel />} />
          <Route path="/account" element={<AccountSettings />} />
          <Route path="/research" element={<ResearchPage />} />
          <Route path="/research/reports/:slug" element={<ReportDetailPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/article/:title" element={<ArticlePageWrapper />} />
          <Route path="/blog/:slug" element={<ArticlePageWrapper />} />
          <Route path="/help" element={<HelpSupportPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/property-management" element={<PropertyManagementPage />} />
          <Route path="/investment-opportunities" element={<InvestmentOpportunitiesPage />} />
          <Route path="/about-us" element={<AboutUsPage />} />
          <Route path="/messages" element={<Messages />} />
          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="/tempobook/*" element={null} />
          )}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <ChatBot />
      <Toaster />
      <ProgressBar isAnimating={isLoading} />
    </div>
  );
}

// Main App component with providers
function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<Loading />}>
        <AppContent />
      </Suspense>
    </AuthProvider>
  );
}

export default App;
