import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, profile, isLoading, fetchProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoading && !user) {
        navigate("/");
        return;
      }

      if (user && !profile) {
        // Fetch profile if user is authenticated but profile is missing
        await fetchProfile(user.id);
      }
    };

    checkAuth();
  }, [user, profile, isLoading, navigate, fetchProfile]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
