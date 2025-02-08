import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ui/use-toast";

export default function SubscriptionCancel() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Subscription Cancelled",
      description:
        "Your subscription process was cancelled. Please try again if this was a mistake.",
      variant: "destructive",
    });

    // Redirect to home after a short delay
    const timer = setTimeout(() => {
      navigate("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="bg-white shadow-lg rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Subscription Cancelled
          </h2>
          <p className="text-gray-600 mb-4">
            Your subscription process was cancelled. Please try again if this
            was a mistake.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting you to the homepage...
          </p>
        </div>
      </div>
    </div>
  );
}
