import React from "react";
import { Button } from "./ui/button";
import { LogIn, Menu, MessageCircle } from "lucide-react";
import { MobileNav } from "./MobileNav";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";
import { cn } from "../lib/utils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import {
  UserPlus,
  LogOut,
  Settings,
  LayoutDashboard,
  Crown,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LoginModal } from './auth/LoginModal';

interface HeaderProps {
  isAuthenticated?: boolean;
  onSignIn?: () => void;
  onSignUp?: () => void;
  onSignOut?: () => Promise<void>;
  userProfile?: {
    full_name?: string | null;
    email?: string | null;
    created_at?: string;
    id?: string;
    role?: "user" | "admin" | "moderator" | null;
    stripe_customer_id?: string | null;
    subscription_status?: string | null;
    subscription_tier?: "free" | "basic" | "pro" | "premium" | null;
    updated_at?: string;
  };
}

const MobileNavLinks = [
  {
    title: "Investment Deals",
    href: "/deals",
    icon: "💼",
    requiresAuth: true
  },
  {
    title: "Listings",
    href: "/listings",
    icon: "🏠",
    requiresAuth: false
  },
  {
    title: "Market",
    items: [
      { title: "Market Trends", href: "/trends", description: "Stay updated with the latest real estate market trends", requiresAuth: true },
      { title: "Market Insights", href: "/insights", description: "Deep dive into property market analytics", requiresAuth: true },
      { title: "Research & Reports", href: "/research", description: "Access expert analysis and reports", requiresAuth: false }
    ],
    icon: "📊"
  },
  {
    title: "Services",
    items: [
      { title: "Property Management", href: "/property-management", description: "Let us take care of your property", requiresAuth: true },
      { title: "Investment Opportunities", href: "/investment-opportunities", description: "Discover tailored investment strategies", requiresAuth: true },
      { title: "Calculators", href: "/calculators", description: "Calculate your property investment", requiresAuth: false }
    ],
    icon: "🏠"
  },
  {
    title: "Messages",
    href: "/messages",
    icon: "💬",
    requiresAuth: true
  },
  {
    title: "Pricing",
    href: "/pricing",
    icon: "💎",
    requiresAuth: false
  },
  {
    title: "Support",
    href: "/help",
    icon: "❓",
    requiresAuth: false
  },
  {
    title: "About Us",
    href: "/about-us",
    icon: "ℹ️",
    requiresAuth: false
  }
];

export default function Header({
  isAuthenticated = false,
  onSignIn,
  onSignUp,
  userProfile = {},
  onSignOut
}: HeaderProps) {
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [loginModalOpen, setLoginModalOpen] = React.useState(false);
  const navigate = useNavigate();
  const auth = useAuth();
  
  // Prioritize props but fallback to global auth context if not provided
  const actualIsAuthenticated = isAuthenticated || !!auth.user;
  const actualUserProfile = userProfile && Object.keys(userProfile).length > 0 ? userProfile : auth.profile;
  const actualSignOut = onSignOut || auth.signOut;

  // Add scroll listener
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle login click
  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setLoginModalOpen(true);
  };

  // Handle sign out with proper page refresh
  const handleSignOut = async () => {
    console.log("Sign out button clicked");
    try {
      await actualSignOut();
      // Force page reload to ensure auth state is completely reset
      window.location.href = "/";
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
              className ?? ""
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
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled ? "py-2" : "py-4"
        )}
      >
        <div className="px-4 mx-auto max-w-7xl">
          <div className={cn(
            "rounded-full bg-white border transition-all duration-300",
            isScrolled 
              ? "shadow-md border-gray-200/50 backdrop-blur-md bg-white/90" 
              : "shadow-sm border-transparent"
          )}>
            <div className="h-16 px-6 flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-8">
                <a href="/" className="hover:opacity-80 transition-opacity">
                  <img
                    src="https://i.postimg.cc/GpdY6N74/my-1920-x-1080-px-1.png"
                    alt="MyVGE"
                    className="h-8"
                  />
                </a>

                {/* Desktop Navigation */}
              <NavigationMenu className="hidden lg:flex">
                  <NavigationMenuList className="gap-2">
                  <NavigationMenuItem>
                      <NavigationMenuTrigger 
                        className={cn(
                          "text-sm font-medium rounded-full px-4",
                          "bg-transparent hover:bg-gray-100 transition-colors",
                          "data-[state=open]:bg-gray-100"
                        )}
                      >
                      Market
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="w-[400px] gap-3 p-4 rounded-2xl">
                          {actualIsAuthenticated ? (
                            <>
                        <ListItem href="/trends" title="Market Trends">
                          Stay updated with the latest real estate market trends.
                        </ListItem>
                        <ListItem href="/insights" title="Market Insights">
                          Deep dive into property market analytics and forecasts.
                        </ListItem>
                            </>
                          ) : (
                            <>
                              <ListItem 
                                href="#" 
                                onClick={handleLoginClick} 
                                title="Market Trends"
                              >
                                Sign in to access market trends.
                              </ListItem>
                              <ListItem 
                                href="#" 
                                onClick={handleLoginClick} 
                                title="Market Insights"
                              >
                                Sign in to access market insights.
                              </ListItem>
                            </>
                          )}
                        <ListItem href="/research" title="Research & Reports">
                          Access expert analysis and reports.
                        </ListItem>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink
                        className={cn(
                          "text-sm font-medium rounded-full px-4 py-2",
                          "hover:bg-gray-100 transition-colors"
                        )}
                      href="/deals"
                    >
                      Deals
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                      <NavigationMenuLink
                        className={cn(
                          "text-sm font-medium rounded-full px-4 py-2",
                          "hover:bg-gray-100 transition-colors"
                        )}
                        href="/listings"
                      >
                        Listings
                      </NavigationMenuLink>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                      <NavigationMenuTrigger 
                        className={cn(
                          "text-sm font-medium rounded-full px-4",
                          "bg-transparent hover:bg-gray-100 transition-colors",
                          "data-[state=open]:bg-gray-100"
                        )}
                      >
                      Services
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="w-[400px] gap-3 p-4 rounded-2xl">
                        <ListItem href="/property-management" title="Property Management">
                          Let us take care of your property.
                        </ListItem>
                        <ListItem href="/investment-opportunities" title="Investment Opportunities">
                          Discover tailored investment strategies.
                        </ListItem>
                        <ListItem href="/calculators" title="Calculators">
                          Calculate different aspects of your property investment.
                        </ListItem>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink
                        className={cn(
                          "text-sm font-medium rounded-full px-4 py-2",
                          "hover:bg-gray-100 transition-colors"
                        )}
                      href="/pricing"
                    >
                      Pricing
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  className="lg:hidden p-2"
                  onClick={() => setShowMobileMenu(true)}
                >
                  <Menu className="h-6 w-6" />
                </Button>

                {/* Help & Support + About Us */}
                <nav className="hidden lg:flex items-center gap-2 mr-4">
                  <a 
                    href="/help"
                    className={cn(
                      "text-sm font-medium rounded-full px-4 py-2",
                      "hover:bg-gray-100 transition-colors"
                    )}
                  >
                    Support
                  </a>
                  <a 
                    href="/about-us"
                    className={cn(
                      "text-sm font-medium rounded-full px-4 py-2",
                      "hover:bg-gray-100 transition-colors"
                    )}
                  >
                    About Us
                  </a>
                </nav>

                {/* Upgrade Button */}
                <Button
                  variant="ghost"
                  className="hidden md:flex bg-gradient-to-r from-emerald-400 to-cyan-400 text-white hover:from-emerald-500 hover:to-cyan-500 rounded-full border border-emerald-500/20 shadow-lg hover:shadow-emerald-500/20 transition-all duration-300"
                  onClick={() => navigate("/pricing")}
                >
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade
                </Button>

                {/* Auth Buttons or User Menu */}
                {!actualIsAuthenticated ? (
                  <div className="hidden md:flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      onClick={handleLoginClick} 
                      className="rounded-full hover:bg-gray-100"
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </Button>
                    <Button 
                      onClick={() => onSignUp?.()} 
                      className="rounded-full bg-black text-white hover:bg-gray-800"
                    >
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
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(actualUserProfile?.full_name || "")}&background=random`}
                            alt={actualUserProfile?.full_name || "User avatar"}
                          />
                          <AvatarFallback className="bg-primary/10">
                            {actualUserProfile?.full_name
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
                    <DropdownMenuContent 
                      className="w-56 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg" 
                      align="end" 
                      forceMount
                    >
                      <DropdownMenuItem className="flex-col items-start">
                        <div className="font-medium">
                          {actualUserProfile?.full_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {actualUserProfile?.email}
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/account")}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Account Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/messages")}>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        <span>Messages</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-500 focus:text-red-500" 
                        onClick={handleSignOut}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log Out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <MobileNav
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
      >
        <nav className="space-y-6">
          {actualIsAuthenticated && (
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3 px-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(actualUserProfile?.full_name || "")}&background=random`}
                    alt={actualUserProfile?.full_name || "User avatar"}
                  />
                  <AvatarFallback className="bg-primary/10">
                    {actualUserProfile?.full_name
                      ?.split(" ")
                      .filter(Boolean)
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium leading-none truncate">
                    {actualUserProfile?.full_name}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {actualUserProfile?.email}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="justify-center rounded-full"
                  onClick={() => {
                    navigate('/dashboard');
                    setShowMobileMenu(false);
                  }}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  className="justify-center rounded-full"
                  onClick={() => {
                    navigate('/account');
                    setShowMobileMenu(false);
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Account
                </Button>
              </div>
              <div className="border-b border-border" />
            </div>
          )}

          {MobileNavLinks.map((item, index) => (
            <div key={index} className="space-y-3">
              {item.href ? (
                <a
                  href={(!item.requiresAuth || actualIsAuthenticated) ? item.href : "#"}
                  className="flex items-center space-x-3 text-lg font-medium hover:text-primary transition-colors"
                  onClick={handleLoginClick}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.title}</span>
                </a>
              ) : (
                <>
                  <div className="flex items-center space-x-3 text-lg font-medium">
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.title}</span>
                  </div>
                  <div className="space-y-3 pl-9">
                    {item.items?.map((subItem, subIndex) => (
                      <a
                        key={subIndex}
                        href={subItem.href}
                        className="block text-base text-muted-foreground hover:text-primary transition-colors"
                        onClick={handleLoginClick}
                      >
                        {subItem.title}
                        {subItem.requiresAuth && !actualIsAuthenticated && (
                          <span className="ml-2 text-xs text-muted-foreground">(Sign in required)</span>
                        )}
                      </a>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}

          {!actualIsAuthenticated ? (
            <div className="space-y-4 pt-6">
              <Button
                variant="outline"
                className="w-full justify-center rounded-full"
                onClick={handleLoginClick}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
              <Button
                className="w-full justify-center rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-white hover:from-emerald-500 hover:to-cyan-500"
                onClick={() => {
                  onSignUp?.();
                  setShowMobileMenu(false);
                }}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Sign Up
              </Button>
            </div>
          ) : (
            <div className="pt-6">
              <Button
                variant="outline"
                className="w-full justify-center rounded-full text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </div>
          )}
        </nav>
      </MobileNav>

      <LoginModal 
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={() => {
          setLoginModalOpen(false);
          // Force a reload for the header to recognize the auth state
          window.location.reload();
        }}
      />
    </>
  );
}
