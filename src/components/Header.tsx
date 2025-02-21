import React from "react";
    import { Button } from "./ui/button";
    import { Menu } from "lucide-react";
    import { MobileNav } from "./MobileNav";
    import {
      NavigationMenu,
      NavigationMenuContent,
      NavigationMenuItem,
      NavigationMenuLink,
      NavigationMenuList,
      NavigationMenuTrigger,
      navigationMenuTriggerStyle,
    } from "./ui/navigation-menu";
    import { cn } from "../lib/utils";
    import { useNavigate } from "react-router-dom";
    import { useAuth } from "../lib/auth";
    import {
      Building2,
      LogIn,
      UserPlus,
      LogOut,
      Settings,
      LayoutDashboard,
      Crown,
    } from "lucide-react";
    import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
    import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuSeparator,
      DropdownMenuTrigger,
    } from "./ui/dropdown-menu";
    import { useLocation } from "react-router-dom";
    import { SignInButton, SignUpButton, useClerk } from "@clerk/clerk-react";

    interface HeaderProps {
      isAuthenticated?: boolean;
      onSignIn?: () => void;
      onSignUp?: () => Promise<void>;
      onSignOut?: () => Promise<void>;
      userProfile?: Profile | null; // Updated type to Profile or null
    }

    const Header = ({
      isAuthenticated = false,
      onSignIn,
      onSignUp,
      userProfile = null, // Default to null
    }: HeaderProps) => {
      const [showMobileMenu, setShowMobileMenu] = React.useState(false);
      const navigate = useNavigate();
      const { user, profile, signOut } = useAuth();
      const { signOut: clerkSignOut, isSignedIn, user: clerkUser } = useClerk();

      const handleSignOut = async () => {
        console.log("Sign out button clicked");
        try {
          await signOut();
          navigate("/");
        } catch (error) {
          console.error("Error signing out:", error);
        }
      };

      const ListItem = React.forwardRef<
        React.ElementRef<"a">,
        React.ComponentPropsWithoutRef<"a"> & {
          title: string;
        }
      >(({ className, title, children, ...props }, ref) => {
        return (
          <li>
            <NavigationMenuLink asChild>
              <a
                ref={ref}
                className={cn(
                  "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                  className,
                )}
                {...props}
              >
                <div className="text-sm font-medium leading-none">{title}</div>
                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                  {children}
                </p>
              </a>
            </NavigationMenuLink>
          </li>
        );
      });
      ListItem.displayName = "ListItem";

      return (
        <>
          <header
            className="fixed top-4 left-0 right-0 z-50 px-4 py-2 bg-background/80 backdrop-blur-md shadow-lg rounded-full mx-auto max-w-[1400px]"
          >
            <div className="container mx-auto h-14 px-6 flex items-center justify-between">
              {/* ... rest of the header code ... */}
                  {/* ... rest of the header code ... */}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </header>

          <MobileNav
            isOpen={showMobileMenu}
            onClose={() => setShowMobileMenu(false)}
          >
            <nav className="space-y-6">
              {/* ... rest of the mobile nav code ... */}
            </nav>
          </MobileNav>
        </>
      );
    };

    export default Header;
