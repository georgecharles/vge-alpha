import React from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Lock, ArrowRight } from "lucide-react";

interface PasswordProtectProps {
  onSuccess: () => void;
}

export function PasswordProtect({ onSuccess }: PasswordProtectProps) {
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "pestOnaPENTERpy123!") {
      localStorage.setItem("password-protected", "true");
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(173,216,230,0.1)_25%,rgba(173,216,230,0.1)_50%,transparent_50%,transparent_75%,rgba(173,216,230,0.1)_75%)] bg-[length:20px_20px]"></div>

      {/* Content */}
      <div className="relative z-10 max-w-lg w-full text-center mb-8">
        <img
          src="/myvge-logo-white.png"
          alt="MyVGE"
          className="h-16 mx-auto mb-4 invert-[0.4] sepia-[.75] saturate-[.6] hue-rotate-[130deg] brightness-[0.8] contrast-[.8]"
        />
        <p className="text-xl text-muted-foreground font-light mb-2">
          Coming Soon
        </p>
        <p className="text-muted-foreground">
          An exclusive platform for property investment analysis and portfolio
          management
        </p>
      </div>

      <Card className="w-full max-w-md relative z-10 bg-background/80 backdrop-blur-sm border-primary/20">
        <CardHeader className="text-center space-y-2 pb-4">
          <Lock className="w-10 h-10 mx-auto text-primary" />
          <h2 className="text-2xl font-semibold">Developer Preview</h2>
          <p className="text-muted-foreground text-sm">
            Access restricted to invited developers and investors
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter access code"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                className={`bg-background/50 border-primary/20 ${error ? "border-destructive" : ""}`}
              />
              {error && (
                <p className="text-sm text-destructive">Invalid access code</p>
              )}
            </div>
            <Button type="submit" className="w-full group">
              Access Platform
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="relative z-10 mt-8 text-center text-sm text-muted-foreground">
        <p>© 2024 MyVGE. All rights reserved.</p>
        <p className="mt-1">Currently in private alpha testing</p>
      </div>
    </div>
  );
}
