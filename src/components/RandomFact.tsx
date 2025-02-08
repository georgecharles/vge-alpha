import React from "react";
import { Lightbulb } from "lucide-react";

export function RandomFact() {
  const [fact, setFact] = React.useState<string>("");

  React.useEffect(() => {
    fetch("https://uselessfacts.jsph.pl/api/v2/facts/random?language=en")
      .then((response) => response.json())
      .then((data) => setFact(data.text))
      .catch((error) => console.error("Error fetching random fact:", error));
  }, []);

  if (!fact) return null;

  return (
    <div className="flex items-center gap-2 text-gray-400 text-sm">
      <Lightbulb className="w-4 h-4" />
      <p>{fact}</p>
    </div>
  );
}
