import React from "react";
import { Footer } from "./Footer";
import Header from "./Header";
import { AuthModal } from "./AuthModal";
import { useAuth } from "../lib/auth";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, profile, signOut, isLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<"signin" | "signup">("signin");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        isAuthenticated={!!user}
        userProfile={profile}
        onSignIn={() => window.location.href = '/login'}
        onSignUp={() => window.location.href = '/signup'}
        onSignOut={signOut}
      />
      
      <main className="flex-1">
        {children}
      </main>
      
      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </div>
  );
}
