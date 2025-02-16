import { useState, useEffect } from "react";

export function useBitcoinPrice() {
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: "What is the current Bitcoin price in GBP? Return ONLY the number, no text or currency symbols.",
                    },
                  ],
                },
              ],
            }),
          },
        );

        const data = await response.json();
        const priceText = data.candidates[0].content.parts[0].text;
        const price = parseFloat(priceText.replace(/[^0-9.]/g, ""));

        if (!isNaN(price)) {
          setBtcPrice(price);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching Bitcoin price:", error);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const convertGBPtoBTC = (gbpAmount: number) => {
    if (!btcPrice) return null;
    return gbpAmount / btcPrice;
  };

  return { btcPrice, loading, convertGBPtoBTC };
}
