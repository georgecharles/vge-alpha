import { useState, useEffect } from 'react';

export const useBitcoinPrice = (gbpAmount?: number) => {
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [btcEquivalent, setBtcEquivalent] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBtcPrice = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(
        'https://api.binance.com/api/v3/ticker/price?symbol=BTCGBP'
      );

      if (!response.ok) {
        throw new Error('Binance API failed');
      }

      const data = await response.json();
      const price = Number(data.price);
      setBtcPrice(price);
      
      // Calculate BTC equivalent if GBP amount is provided
      if (gbpAmount && price) {
        setBtcEquivalent(gbpAmount / price);
      }
    } catch (error) {
      console.error("Error fetching BTC price:", error);
      setError('Failed to fetch Bitcoin price');
      setBtcPrice(null);
      setBtcEquivalent(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    const fetchWithRetry = async () => {
      if (!mounted || retryCount >= MAX_RETRIES) return;
      
      try {
        await fetchBtcPrice();
        retryCount = 0;
      } catch (error) {
        retryCount++;
        if (mounted && retryCount < MAX_RETRIES) {
          setTimeout(fetchWithRetry, Math.pow(2, retryCount) * 1000);
        }
      }
    };

    fetchWithRetry();
    const interval = setInterval(fetchWithRetry, 60000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [gbpAmount]); // Add gbpAmount to dependencies

  return { btcPrice, btcEquivalent, error, isLoading };
}; 