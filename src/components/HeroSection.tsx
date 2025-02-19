import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search } from "lucide-react";

interface HeroSectionProps {
  onSearch?: (searchTerm: string) => void;
  backgroundImage?: string;
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  showStats?: boolean;
  height?: string;
}

const HeroSection = ({
  onSearch = () => {},
  backgroundImage = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
  title = "Find Your Perfect Property",
  subtitle = "Search through millions of properties to find your next home",
  showSearch = true,
  showStats = true,
  height = "h-[500px]",
}: HeroSectionProps) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <div className={`relative w-full ${height} bg-gray-900 overflow-hidden`}>
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105 animate-ken-burns"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/60 backdrop-blur-sm" />
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center py-16 pt-24 animate-fade-in-up">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
          {title}
        </h1>
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
                className="w-full h-12 sm:h-14 pl-5 pr-14 text-base sm:text-lg bg-white text-black border-2 border-transparent focus:border-primary"
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
