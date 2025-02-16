import React from "react";

export function HeroCharacter({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute pointer-events-none ${className}`}>
      <img
        src="https://github.githubassets.com/images/modules/site/home-campaign/hero-drone.webp"
        alt="Decorative"
        className="w-[300px] h-auto transform motion-safe:animate-float"
      />
    </div>
  );
}

export function SignInCharacter({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute pointer-events-none ${className}`}>
      <img
        src="https://github.githubassets.com/images/modules/site/home-campaign/astrocat.png"
        alt="Decorative"
        className="w-[150px] h-auto transform motion-safe:animate-float-slow"
      />
    </div>
  );
}
