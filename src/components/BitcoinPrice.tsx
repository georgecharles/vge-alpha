import React from "react";
import { useBitcoinPrice } from "../lib/hooks/useBitcoinPrice";
import { Bitcoin } from "lucide-react";

interface BitcoinPriceProps {
  amount: number;
}

export function BitcoinPrice({ amount }: BitcoinPriceProps) {
  const { btcPrice, loading, convertGBPtoBTC } = useBitcoinPrice();
  const btcAmount = convertGBPtoBTC(amount);

  if (loading) return <span className="text-muted-foreground">Loading...</span>;
  if (!btcAmount) return null;

  return (
    <span className="inline-flex items-center gap-1">
      <Bitcoin className="h-4 w-4 text-[#F7931A]" />
      {btcAmount.toFixed(2)}
    </span>
  );
}
