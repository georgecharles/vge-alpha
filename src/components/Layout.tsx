import React from "react";
import { Footer } from "./Footer";
import Header from "./Header";
import { AuthModal } from "./AuthModal";
import { useAuth } from "../lib/auth";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, profile, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<"signin" | "signup">("signin");

  return (
    <div className="min-h-screen bg-background">
      <Header
        isAuthenticated={!!user}
        userProfile={profile || undefined}
        onSignIn={() => {
          setAuthMode("signin");
          setIsAuthModalOpen(true);
        }}
        onSignUp={() => {
          setAuthMode("signup");
          setIsAuthModalOpen(true);
        }}
      />

      {children}

      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </div>
  );
}
