import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search } from "lucide-react";
import SplitText from "./ui/SplitText";
import Aurora from "./ui/Aurora";

interface HeroSectionProps {
  onSearch: (term: string) => void;
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  showStats?: boolean;
  height?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearch,
  title = "Find Your Next Investment Property",
  subtitle = "Search through thousands of investment opportunities",
  showSearch = true,
  height = "h-[500px]",
}: HeroSectionProps) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleAnimationComplete = () => {
    console.log('Hero text animation completed!');
  };

  return (
    <div className={`relative w-full ${height} bg-gray-900 overflow-hidden`}>
      {/* Aurora Background */}
      <div className="absolute inset-0">
        <Aurora
          colorStops={["#004F39", "#FEFACA", "#151513"]}
          blend={0.6}
          amplitude={1.2}
          speed={0.3}
        />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center py-16 pt-24 animate-fade-in-up">
        <SplitText
          text={title}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
          delay={50}
          animationFrom={{ opacity: 0, transform: 'translate3d(0,50px,0)' }}
          animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
          easing={(t: number) => 1 - Math.pow(1 - t, 3)} // easeOutCubic function
          threshold={0.2}
          rootMargin="-50px"
          onLetterAnimationComplete={handleAnimationComplete}
        />
        <p className="text-lg sm:text-xl text-gray-200 mb-6 sm:mb-8 max-w-3xl mx-auto">
          {subtitle}
        </p>

        {/* Search Form */}
        {showSearch && (
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-2xl animate-fade-in-up"
          >
            <div className="relative">
              <Input
                type="text"
                placeholder="Enter an address, neighbourhood, city, or postcode"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 sm:h-14 pl-5 pr-14 text-base sm:text-lg bg-white/90 backdrop-blur-sm text-black border-2 border-transparent focus:border-primary"
              />
              <Button
                type="submit"
                size="sm"
                variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent"
              >
                <Search className="w-6 h-6 text-gray-500 hover:text-primary transition-colors" />
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default HeroSection;
