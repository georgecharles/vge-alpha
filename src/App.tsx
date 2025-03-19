import { Suspense, useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation, useParams, useNavigate } from "react-router-dom";
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
import WaitlistPage from "./components/WaitlistPage";
import { supabase } from "./lib/supabase";
import ResearchAndReports from "./pages/ResearchAndReports";
import AdminReports from "./pages/AdminReports";
import { setupBackgroundJobs } from './lib/backgroundJobs';

// Add TypeScript declaration for import.meta.env
declare global {
  interface ImportMeta {
    env: {
      MODE: string;
      VITE_SUPABASE_URL: string;
      VITE_SUPABASE_ANON_KEY: string;
      VITE_TEMPO?: string;
      [key: string]: string | undefined;
    };
  }
}

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

// Global state to avoid excessive redirects
let isAuthChecking = false;

// PrivateRoute component that redirects to waitlist if not authenticated
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authConfirmed, setAuthConfirmed] = useState(false);
  
  useEffect(() => {
    // Check if we have a direct sign of authentication from the waitlist page
    const hasLocalAuth = localStorage.getItem('vge_user_authenticated') === 'true';
    const authTimestamp = parseInt(localStorage.getItem('vge_auth_timestamp') || '0');
    const isRecentAuth = Date.now() - authTimestamp < 1000 * 60 * 60; // Within the last hour
    
    // If we're already checking auth, don't duplicate the process
    if (isAuthChecking) return;
    
    // Handle auth check
    const checkAuth = async () => {
      // Prevent multiple simultaneous checks
      isAuthChecking = true;
      
      try {
        console.log("Checking auth in PrivateRoute. User:", !!user, "Path:", location.pathname);
        
        // First, check if we have a confirmed login from localStorage
        if (hasLocalAuth && isRecentAuth) {
          console.log("Local auth confirmed from waitlist login");
          setAuthConfirmed(true);
          isAuthChecking = false;
          return;
        }
        
        // Next, check the auth state from the context
        if (!isLoading) {
          if (user) {
            console.log("Auth confirmed from user context");
            setAuthConfirmed(true);
          } else if (location.pathname !== '/waitlist') {
            console.log("No auth, redirecting to waitlist");
            navigate('/waitlist', { replace: true });
          }
        }
      } catch (error) {
        console.error("Error in PrivateRoute auth check:", error);
      } finally {
        isAuthChecking = false;
      }
    };
    
    checkAuth();
  }, [user, isLoading, navigate, location.pathname]);
  
  // If we're still checking auth and don't have confirmation yet, show loading
  if ((isLoading || !authConfirmed) && !user) {
    return <Loading />;
  }
  
  // If we're confirmed or have a user, show content
  if (authConfirmed || user) {
    return <>{children}</>;
  }
  
  // Default: don't show content. The redirect will happen in the useEffect
  return null;
}

// Wrap the main content in a component to use hooks
function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [isDevelopment, setIsDevelopment] = useState(true); // Flag to control waitlist bypass
  const navigate = useNavigate();

  // Improved auth check that runs only once on initial load
  useEffect(() => {
    let isMounted = true;
    
    // Skip auth check for waitlist and auth callback pages
    if (location.pathname === '/waitlist' || location.pathname === '/auth/callback') {
      return;
    }
    
    const checkInitialAuth = async () => {
      try {
        console.log("Performing initial auth check");
        const { data } = await supabase.auth.getSession();
        
        if (isMounted) {
          console.log("Initial auth check result:", !!data.session);
          
          // If no session and not already on waitlist, redirect
          if (!data.session && location.pathname !== '/waitlist') {
            navigate('/waitlist', { replace: true });
          }
        }
      } catch (error) {
        console.error("Error in initial auth check:", error);
      }
    };
    
    checkInitialAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);  // Empty dependency array = only runs once on mount

  // Log auth state for debugging
  useEffect(() => {
    if (user) {
      console.log("Auth state in App: User is authenticated");
      
      // Store auth state in localStorage as an additional check
      localStorage.setItem('vge_user_authenticated', 'true');
      localStorage.setItem('vge_auth_timestamp', Date.now().toString());
      
      // Use refreshProfile to ensure we have latest auth state
      if (refreshProfile) {
        refreshProfile();
      }
    } else {
      console.log("Auth state in App: User is not authenticated");
    }
  }, [refreshProfile, user]);

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

  useEffect(() => {
    // Set up background jobs for property listings when in production
    if (import.meta.env.PROD) {
      setupBackgroundJobs();
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {location.pathname !== '/waitlist' && (
        <Header 
          isAuthenticated={!!user}
          userProfile={profile || undefined}
          onSignIn={() => {
            // This will be handled by the Header component
          }}
          onSignUp={() => {
            // This will be handled by the Header component
          }}
          onSignOut={() => {
            // Clear local auth state
            localStorage.removeItem('vge_user_authenticated');
            localStorage.removeItem('vge_auth_timestamp');
            
            // Call the real signOut function
            if (signOut) signOut();
          }}
        />
      )}
      <main>
        <Routes>
          {/* Public waitlist route */}
          <Route path="/waitlist" element={<WaitlistPage />} />
          
          {/* Auth callback must be public */}
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Protected routes that require authentication */}
          <Route path="/" element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } />
          <Route path="/listings" element={
            <PrivateRoute>
              <Listings />
            </PrivateRoute>
          } />
          <Route path="/deals" element={
            <PrivateRoute>
              <DealsPage />
            </PrivateRoute>
          } />
          <Route path="/trends" element={
            <PrivateRoute>
              <MarketTrendsPage />
            </PrivateRoute>
          } />
          <Route path="/insights" element={
            <PrivateRoute>
              <MarketInsightsPage />
            </PrivateRoute>
          } />
          <Route path="/calculators" element={
            <PrivateRoute>
              <Calculators />
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <AccountSettings />
            </PrivateRoute>
          } />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/pricing" element={
            <PrivateRoute>
              <PricingPage />
            </PrivateRoute>
          } />
          <Route path="/subscription/success" element={
            <PrivateRoute>
              <SubscriptionSuccess />
            </PrivateRoute>
          } />
          <Route path="/subscription/cancel" element={
            <PrivateRoute>
              <SubscriptionCancel />
            </PrivateRoute>
          } />
          <Route path="/account" element={
            <PrivateRoute>
              <AccountSettings />
            </PrivateRoute>
          } />
          <Route path="/research" element={
            <PrivateRoute>
              <ResearchPage />
            </PrivateRoute>
          } />
          <Route path="/research/reports/:slug" element={
            <PrivateRoute>
              <ReportDetailPage />
            </PrivateRoute>
          } />
          <Route path="/blog" element={
            <PrivateRoute>
              <BlogPage />
            </PrivateRoute>
          } />
          <Route path="/article/:title" element={
            <PrivateRoute>
              <ArticlePageWrapper />
            </PrivateRoute>
          } />
          <Route path="/blog/:slug" element={
            <PrivateRoute>
              <ArticlePageWrapper />
            </PrivateRoute>
          } />
          <Route path="/help" element={
            <PrivateRoute>
              <HelpSupportPage />
            </PrivateRoute>
          } />
          <Route path="/property-management" element={
            <PrivateRoute>
              <PropertyManagementPage />
            </PrivateRoute>
          } />
          <Route path="/investment-opportunities" element={
            <PrivateRoute>
              <InvestmentOpportunitiesPage />
            </PrivateRoute>
          } />
          <Route path="/about-us" element={
            <PrivateRoute>
              <AboutUsPage />
            </PrivateRoute>
          } />
          <Route path="/messages" element={
            <PrivateRoute>
              <Messages />
            </PrivateRoute>
          } />
          <Route path="/research-reports" element={
            <PrivateRoute>
              <ResearchAndReports />
            </PrivateRoute>
          } />
          <Route path="/admin/reports" element={
            <PrivateRoute>
              <AdminReports />
            </PrivateRoute>
          } />
          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="/tempobook/*" element={null} />
          )}
          
          {/* Default redirect to waitlist or home */}
          <Route path="" element={<Navigate to={user ? "/" : "/waitlist"} replace />} />
          
          {/* 404 page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      {location.pathname !== '/waitlist' && <ChatBot />}
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
