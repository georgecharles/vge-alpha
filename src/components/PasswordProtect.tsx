import React from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Lock } from "lucide-react";

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
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <Lock className="w-12 h-12 mx-auto text-primary" />
          <h1 className="text-2xl font-bold">Password Protected</h1>
          <p className="text-muted-foreground">
            Please enter the password to access this site
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                className={error ? "border-destructive" : ""}
              />
              {error && (
                <p className="text-sm text-destructive">Invalid password</p>
              )}
            </div>
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
