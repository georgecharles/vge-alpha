import React from "react";
    import { Card, CardContent } from "./ui/card";
    import { Button } from "./ui/button";
    import { MessageCircle, Heart, HeartOff } from "lucide-react";
    import { useAuth } from "../lib/auth";
    import { saveProperty } from "../lib/properties";
    import { useToast } from "./ui/use-toast";
    import { useNavigate } from "react-router-dom";

    interface PropertyCardProps {
      id?: string;
      address?: string;
      price?: number;
      squareFootage?: number;
      bedrooms?: number;
      bathrooms?: number;
      isPremium?: boolean;
      isSubscriber?: boolean;
      images?: string[];
    }

    const PropertyCard = ({
      id = "1",
      address = "123 Example Street, City, State 12345",
      price = 500000,
      squareFootage = 0,
      bedrooms = 0,
      bathrooms = 0,
      isPremium = true,
      isSubscriber = false,
      images = [],
    }: PropertyCardProps) => {
      const { user } = useAuth();
      const { toast } = useToast();
      const navigate = useNavigate();
      const [isLiked, setIsLiked] = React.useState(false); // Example: Initialize with false
      const [likeCount, setLikeCount] = React.useState(0); // Example: Initialize with 0
      const [isImageLoading, setIsImageLoading] = React.useState(true);

      const handleLike = async () => {
        if (!user) {
          toast({
            title: "Please sign in",
            description: "You must be signed in to save properties.",
          });
          return;
        }

        setIsLiked(!isLiked);
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

        try {
          await saveProperty(id, user.id);
          toast({
            title: "Success",
            description: "Property has been saved successfully.",
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to save property. Please try again.",
            variant: "destructive",
          });
        }
      };

      return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative h-48 bg-muted">
            {isImageLoading && (
              <div className="absolute inset-0 animate-pulse bg-muted" />
            )}
            <img
              src={
                (images && Array.isArray(images) && images.length > 0 && images[0]) ||
                "https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
              }
              alt="Property"
              className={`w-full h-full object-cover transition-opacity duration-200 ${isImageLoading ? "opacity-0" : "opacity-100"}`}
              onLoad={() => setIsImageLoading(false)}
            />
            {isPremium && !isSubscriber && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] flex items-center justify-center">
                <div className="text-center p-6">
                  <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Subscribe to view premium properties
                  </p>
                </div>
              </div>
            )}
          </div>

          <CardContent className="p-4">
            <h3 className="font-semibold mb-1 line-clamp-1">{address}</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">£{price.toLocaleString()}</span>
              {/* <BitcoinPrice amount={price} /> */}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
              <div>
                <span className="block text-muted-foreground">Beds</span>
                <span className="font-medium">{bedrooms}</span>
              </div>
              <div>
                <span className="block text-muted-foreground">Baths</span>
                <span className="font-medium">{bathrooms}</span>
              </div>
              <div>
                <span className="block text-muted-foreground">Sq Ft</span>
                <span className="font-medium">{squareFootage}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Button variant="ghost" size="icon" onClick={handleLike}>
                  {isLiked ? (
                    <Heart className="w-4 h-4 text-red-500" />
                  ) : (
                    <HeartOff className="w-4 h-4" />
                  )}
                </Button>
                <span>{likeCount}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate(`/property/${id}`)}>
                <MessageCircle className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    };

    export default PropertyCard;
