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

interface HeaderProps {
  isAuthenticated?: boolean;
  onSignIn?: () => void;
  onSignUp?: () => void;
  userProfile?: {
    full_name?: string;
    email?: string;
  };
}

const Header = ({
  isAuthenticated = false,
  onSignIn,
  onSignUp,
  userProfile = {},
}: HeaderProps) => {
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
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
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-2">
        <div className="mx-auto max-w-[1400px] rounded-full backdrop-blur-md bg-background/80 border border-border/50 shadow-lg transition-all duration-300">
          <div className="container mx-auto h-14 px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <a href="/" className="hover:opacity-80 transition-opacity">
                <img
                  src="https://i.postimg.cc/1zhYWbNc/my-1-1.png"
                  alt="MyVGE"
                  className="h-8"
                />
              </a>
            </div>

            <NavigationMenu className="hidden lg:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium transition-colors hover:text-primary bg-transparent hover:bg-transparent">
                    Market
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 rounded-xl">
                      <ListItem href="/trends" title="Market Trends">
                        Stay updated with the latest real estate market trends.
                      </ListItem>
                      <ListItem href="/insights" title="Market Insights">
                        Deep dive into property market analytics and forecasts.
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink
                    className="text-sm font-medium transition-colors hover:text-primary px-4 py-2"
                    href="/deals"
                  >
                    Deals
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink
                    className="text-sm font-medium transition-colors hover:text-primary px-4 py-2"
                    href="/calculators"
                  >
                    Calculators
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className="text-sm font-medium transition-colors hover:text-primary px-4 py-2"
                    href="/pricing"
                  >
                    Pricing
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className="text-sm font-medium transition-colors hover:text-primary px-4 py-2"
                    href="/help"
                  >
                    Help & Support
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                className="lg:hidden p-2"
                onClick={() => setShowMobileMenu(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                className="hidden md:flex bg-gradient-to-r from-emerald-400 to-cyan-400 text-white hover:from-emerald-500 hover:to-cyan-500 border border-emerald-500/20 shadow-lg hover:shadow-emerald-500/20 transition-all duration-300"
                onClick={() => (window.location.href = "/pricing")}
              >
                <Crown className="mr-2 h-4 w-4" />
                Upgrade
              </Button>
              {!isAuthenticated ? (
                <div className="hidden md:flex items-center gap-4">
                  <Button variant="ghost" onClick={() => onSignIn?.()}>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Button>
                  <Button onClick={() => onSignUp?.()} variant="default">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Sign Up
                  </Button>
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.email}`}
                          alt={userProfile?.full_name || "User avatar"}
                        />
                        <AvatarFallback className="bg-primary/10">
                          {userProfile?.full_name
                            ?.split(" ")
                            .filter(Boolean)
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem className="flex-col items-start">
                      <div className="font-medium">
                        {userProfile?.full_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {userProfile?.email}
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        window.location.pathname !== "/dashboard" &&
                        navigate("/dashboard")
                      }
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/account")}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Account Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </header>

      <MobileNav
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
      >
        <nav className="space-y-6">
          <a
            href="/deals"
            className="block text-lg font-medium hover:text-primary transition-colors"
          >
            Investment Deals
          </a>
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Resources
            </h4>
            <div className="space-y-3 pl-1">
              <a
                href="/trends"
                className="block text-lg font-medium hover:text-primary transition-colors"
              >
                Market Trends
              </a>
              <a
                href="/insights"
                className="block text-lg font-medium hover:text-primary transition-colors"
              >
                Market Insights
              </a>
              <a
                href="/research"
                className="block text-lg font-medium hover:text-primary transition-colors"
              >
                Research & Reports
              </a>
              <a
                href="/blog"
                className="block text-lg font-medium hover:text-primary transition-colors"
              >
                Blog
              </a>
            </div>
          </div>
          <a
            href="/calculators"
            className="block text-lg font-medium hover:text-primary transition-colors"
          >
            Calculators
          </a>
          <a
            href="/pricing"
            className="block text-lg font-medium hover:text-primary transition-colors"
          >
            Pricing
          </a>
          {!isAuthenticated ? (
            <div className="space-y-4 pt-6">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => onSignIn?.()}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
              <Button
                className="w-full justify-start"
                onClick={() => onSignUp?.()}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Sign Up
              </Button>
            </div>
          ) : null}
        </nav>
      </MobileNav>
    </>
  );
};

export default Header;
