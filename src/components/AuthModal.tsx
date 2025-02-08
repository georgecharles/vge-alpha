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
  const [isLoading, setIsLoading] = React.useState(false);
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

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
        await signUp(
          formData.email,
          formData.password,
          formData.firstName,
          formData.lastName,
        );
        setShowConfirmation(true);
        toast({
          title: "Check your email",
          description:
            "Please check your inbox and confirm your email address to continue.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showConfirmation) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Check Your Email</DialogTitle>
            <DialogDescription className="space-y-2">
              <p>
                We've sent you a confirmation email. Please check your inbox and
                click the verification link to complete your registration.
              </p>
              <p className="text-sm text-muted-foreground">
                Note: You must confirm your email before you can sign in. Please
                check your spam folder if you don't see the email.
              </p>
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
              : "Create an account to start exploring properties."}
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
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Loading..."
                : mode === "signin"
                  ? "Sign In"
                  : "Create Account"}
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
