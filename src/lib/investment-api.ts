export async function getTailoredRecommendations() {
  try {
    const response = await fetch(
      `https://your-api-endpoint.com/tailored-recommendations?key=${import.meta.env.VITE_GEMINI_API_KEY}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data; // Ensure this returns an array of recommendations
  } catch (error) {
    console.error("Error fetching tailored recommendations:", error);
    return []; // Return an empty array as a fallback
  }
}

export async function simulateInvestmentScenario(params: { initialInvestment: number; duration: number; riskLevel: string; }) {
  try {
    const response = await fetch(
      `https://your-api-endpoint.com/simulate-scenario?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data; // Ensure this returns the expected format
  } catch (error) {
    console.error("Error simulating investment scenario:", error);
    return {}; // Return an empty object or default value
  }
} 