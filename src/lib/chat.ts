const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const popularQuestions = [
  "Calculate stamp duty for a £400,000 property",
  "What are typical legal fees for property purchase?",
  "Explain all costs involved in buying a property",
  "How much should I budget for property maintenance?",
  "What surveys do I need when buying a property?",
  "Calculate monthly mortgage payments for £300,000",
];

export async function getChatResponse(message: string) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
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
                  text: `You are a UK property cost assistant specializing in helping users understand and calculate all costs involved in property transactions. You have expertise in:

1. Stamp Duty Land Tax calculations
2. Legal fees and conveyancing costs
3. Survey and valuation fees
4. Mortgage arrangement fees
5. Property maintenance costs
6. Insurance costs
7. Property management fees
8. Tax implications

Provide specific numbers and calculations when possible. For professional services, explain what to look for and typical cost ranges. Always break down complex costs into clear categories.

If asked about stamp duty, always show the calculation breakdown and mention if there are any special rates (e.g., first-time buyers, additional properties).

For maintenance costs, provide annual percentages of property value and specific examples of common maintenance items.

User question: ${message}`,
                },
              ],
            },
          ],
        }),
      },
    );

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error getting chat response:", error);
    return "I'm sorry, I'm having trouble processing your request right now. Please try again later.";
  }
}
