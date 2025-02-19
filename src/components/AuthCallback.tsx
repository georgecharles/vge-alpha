import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", event, session); // Add this line
      if (event === "SIGNED_IN") {
        navigate("/dashboard");
      }
    });

    // Handle the initial session
    const handleInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("Initial session:", session); // Add this line
      if (session) {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    };

    handleInitialSession();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Authenticating...</h2>
        <p className="text-muted-foreground">
          Please wait while we verify your credentials.
        </p>
      </div>
    </div>
  );
}
