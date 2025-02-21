import React from "react";
    import { Footer } from "./Footer";
    import Header from "./Header";
    // import { AuthModal } from "./AuthModal"; // Remove this line
    import { useAuth } from "../lib/auth";

    interface LayoutProps {
      children: React.ReactNode;
    }

    export function Layout({ children }: LayoutProps) {
      const { user, profile, signOut } = useAuth();
      // const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false); // Remove this line
      // const [authMode, setAuthMode] = React.useState<"signin" | "signup">("signin"); // Remove this line

      return (
        <div className="min-h-screen bg-background">
          <Header
            isAuthenticated={!!user}
            userProfile={profile || undefined}
          />

          {children}

          <Footer />
        </div>
      );
    }
