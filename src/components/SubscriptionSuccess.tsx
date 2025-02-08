import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "./ui/use-toast";
import { useAuth } from "../lib/auth";
import { OnboardingModal } from "./OnboardingModal";

export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      toast({
        title: "Subscription Successful!",
        description:
          "Thank you for subscribing. Your premium features are now available.",
      });
    }

    // Only redirect if onboarding is skipped or completed
    if (!showOnboarding) {
      navigate("/dashboard");
    }
  }, [showOnboarding, navigate, searchParams, toast]);

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8">
          <div className="bg-white shadow-lg rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Subscription Successful!
            </h2>
            <p className="text-gray-600 mb-4">
              Thank you for subscribing. Your premium features are now
              available.
            </p>
            <p className="text-sm text-gray-500">
              Setting up your preferences...
            </p>
          </div>
        </div>
      </div>

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => {
          setShowOnboarding(false);
          navigate("/dashboard");
        }}
      />
    </>
  );
}
