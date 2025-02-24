import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "./ui/use-toast";
import { useAuth } from "../lib/auth";
import { createCheckoutSession } from "../lib/stripe";

type AuthMode = "signin" | "signup";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: AuthMode;
}

export function AuthModal({
  isOpen,
  onClose,
  defaultMode = "signin",
}: AuthModalProps) {
  const [mode, setMode] = React.useState<AuthMode>(defaultMode);
  React.useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        const user = await signIn(formData.email, formData.password);
        if (user) {
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
          setTimeout(() => onClose(), 500);
        }
      } else {
        const user = await signUp(
          formData.email,
          formData.password,
          formData.firstName,
          formData.lastName,
        );

        // Check if there's a pending subscription
        const pendingPriceId = localStorage.getItem(
          "pending_subscription_price_id",
        );
        if (pendingPriceId && user && 'id' in user) {
          localStorage.removeItem("pending_subscription_price_id");
          await createCheckoutSession(pendingPriceId, user.id);
        } else {
          setShowConfirmation(true);
          toast({
            title: "Welcome to MyVGE Alpha!",
            description:
              "Thank you for joining us during our alpha testing phase.",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showConfirmation) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Welcome to MyVGE Alpha!</DialogTitle>
            <DialogDescription className="space-y-2">
              <p className="text-lg font-medium text-primary">
                Thank you for joining MyVGE during our alpha testing phase!
              </p>
              <p>
                We've sent a confirmation email to your inbox. Please click the
                verification link to activate your account and start exploring
                MyVGE.
              </p>
              <p className="text-sm text-muted-foreground">
                Note: You must confirm your email before signing in. Please
                check your spam folder if you don't see the email.
              </p>
              <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                <p className="text-sm font-medium">
                  As an alpha tester, your feedback is invaluable to us. We're
                  excited to have you on board and look forward to your insights
                  as we continue to improve the platform.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-4 pt-4">
            <Button
              onClick={() => {
                setShowConfirmation(false);
                onClose();
              }}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "signin" ? "Sign In" : "Create Account"}
          </DialogTitle>
          <DialogDescription>
            {mode === "signin"
              ? "Welcome back! Please sign in to continue."
              : "Join MyVGE and start exploring properties."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {mode === "signup" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              required
            />
          </div>

          <div className="flex flex-col space-y-4 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Loading..."
                : mode === "signin"
                  ? "Sign In"
                  : "Create Account"}
            </Button>

            <Button type="button" variant="link" onClick={() => signInWithGoogle()} disabled={isSubmitting}>
              Sign In with Google
            </Button>

            <Button
              type="button"
              variant="link"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin"
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
