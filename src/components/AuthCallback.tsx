import { useEffect } from "react";
    import { useNavigate } from "react-router-dom";
    import { supabase } from "../lib/supabase";
    import { useClerk } from "@clerk/clerk-react";

    export default function AuthCallback() {
      const navigate = useNavigate();
      const { user: clerkUser, isLoaded } = useClerk();

      useEffect(() => {
        const handleAuth = async () => {
          if (isLoaded && clerkUser) {
            try {
              // Check if profile exists
              const { data: existingProfile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", clerkUser.id)
                .single();

              if (!existingProfile) {
                // Create profile if it doesn't exist
                const { error: profileError } = await supabase
                  .from("profiles")
                  .insert({
                    id: clerkUser.id,
                    email: clerkUser.emailAddresses[0].emailAddress,
                    full_name: `${clerkUser.firstName} ${clerkUser.lastName}`,
                    role: "user",
                    subscription_tier: "free",
                    subscription_status: "active",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  });

                if (profileError) {
                  console.error("Profile creation error:", profileError);
                  // Handle error appropriately
                }
              }
              navigate("/dashboard");
            } catch (error) {
              console.error("Error in AuthCallback:", error);
            }
          } else if (isLoaded) {
            navigate("/");
          }
        };

        handleAuth();
      }, [clerkUser, navigate, isLoaded]);

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
