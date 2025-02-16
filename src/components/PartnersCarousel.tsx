import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";

const partners = [
  {
    name: "Grosvenor Group",
    logo: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3",
  },
  {
    name: "Berkeley Group",
    logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3",
  },
  {
    name: "Ballymore Properties",
    logo: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3",
  },
  {
    name: "Almacantar",
    logo: "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?ixlib=rb-4.0.3",
  },
  {
    name: "Capital & Counties",
    logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3",
  },
  {
    name: "Great Portland Estates",
    logo: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3",
  },
];

export function PartnersCarousel() {
  return (
    <div className="w-full bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-2xl font-semibold mb-8">
          Trusted by Industry Leaders
        </h2>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-5xl mx-auto"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {partners.map((partner, index) => (
              <CarouselItem
                key={index}
                className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <div className="p-4">
                  <div className="aspect-square relative rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-background/50" />
                    <div className="relative h-full flex items-center justify-center p-6">
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                          <img
                            src={partner.logo}
                            alt={partner.name}
                            className="w-8 h-8 object-contain opacity-50"
                          />
                        </div>
                        <p className="text-sm font-medium text-foreground/80">
                          {partner.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-12 hover:bg-background/80" />
          <CarouselNext className="-right-12 hover:bg-background/80" />
        </Carousel>
      </div>
    </div>
  );
}
