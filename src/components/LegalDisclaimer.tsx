import React from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { Info } from "lucide-react";

export function LegalDisclaimer() {
  return (
    <Alert className="bg-muted/50 border-muted-foreground/20">
      <Info className="h-4 w-4" />
      <AlertDescription className="text-xs text-muted-foreground">
        The information provided on this website is for general informational
        purposes only and should not be considered as financial or investment
        advice. Property investments carry risks and values can go down as well
        as up. Always seek professional advice before making investment
        decisions.
      </AlertDescription>
    </Alert>
  );
}
