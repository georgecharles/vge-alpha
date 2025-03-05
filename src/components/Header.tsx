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
    icon: "💼"
  },
  {
    title: "Market",
    items: [
      { title: "Market Trends", href: "/trends", description: "Stay updated with the latest real estate market trends" },
      { title: "Market Insights", href: "/insights", description: "Deep dive into property market analytics" },
      { title: "Research & Reports", href: "/research", description: "Access expert analysis and reports" }
    ],
    icon: "📊"
  },
  {
    title: "Services",
    items: [
      { title: "Property Management", href: "/property-management", description: "Let us take care of your property" },
      { title: "Investment Opportunities", href: "/investment-opportunities", description: "Discover tailored investment strategies" },
      { title: "Calculators", href: "/calculators", description: "Calculate your property investment" }
    ],
    icon: "🏠"
  },
  {
    title: "Messages",
    href: "/messages",
    icon: "💬"
  },
  {
    title: "Pricing",
    href: "/pricing",
    icon: "💎"
  },
  {
    title: "Help & Support",
    href: "/help",
    icon: "❓"
  },
  {
    title: "About Us",
    href: "/about-us",
    icon: "ℹ️"
  }
];

const Header = ({
  isAuthenticated = false,
  onSignIn,
  onSignUp,
  userProfile = {},
}: HeaderProps) => {
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);
  const navigate = useNavigate();
  const { signOut, isLoading } = useAuth();

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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-screen overflow-x-hidden">
        <div className="px-2 sm:px-4 py-3 max-w-screen-2xl mx-auto">
          <div className="mx-2 sm:mx-auto max-w-[1400px] w-[calc(100vw-24px)] sm:w-auto rounded-full bg-white/90 shadow-sm border border-gray-200/50 backdrop-blur-md transition-all duration-300">
            <div className="h-14 px-3 sm:px-4 md:px-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <a href="/" className="hover:opacity-80 transition-opacity">
                  <img
                    src="https://i.postimg.cc/GpdY6N74/my-1920-x-1080-px-1.png"
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
                        <ListItem href="/research" title="Research & Reports">
                          Access expert analysis and reports.
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
                    <NavigationMenuTrigger className="text-sm font-medium transition-colors hover:text-primary bg-transparent hover:bg-transparent">
                      Services
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 rounded-xl">
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
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      className="text-sm font-medium transition-colors hover:text-primary px-4 py-2"
                      href="/about-us"
                    >
                      About Us
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
                  className="hidden md:flex bg-gradient-to-r from-emerald-400 to-cyan-400 text-white hover:from-emerald-500 hover:to-cyan-500 rounded-full border border-emerald-500/20 shadow-lg hover:shadow-emerald-500/20 transition-all duration-300"
                  onClick={() => (window.location.href = "/pricing")}
                >
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade
                </Button>
                {!isAuthenticated ? (
                  <div className="hidden md:flex items-center gap-4">
                    <Button variant="ghost" onClick={() => onSignIn?.()} className="rounded-full">
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </Button>
                    <Button onClick={() => onSignUp?.()} variant="default" className="rounded-full">
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
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.full_name || "")}&background=random`}
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
                    <DropdownMenuContent 
                      className="w-56 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-50" 
                      align="end" 
                      forceMount
                    >
                      <DropdownMenuItem className="flex-col items-start bg-white">
                        <div className="font-medium">
                          {userProfile?.full_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {userProfile?.email}
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="bg-white hover:bg-muted"
                        onClick={() =>
                          window.location.pathname !== "/dashboard" &&
                          navigate("/dashboard")
                        }
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="bg-white hover:bg-muted" onClick={() => navigate("/account")}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Account Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="bg-white hover:bg-muted" onClick={() => navigate("/messages")}>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        <span>Messages</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="bg-white hover:bg-muted" onClick={handleSignOut}>
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

      <MobileNav
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
      >
        <nav className="space-y-6">
          {isAuthenticated && (
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3 px-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.full_name || "")}&background=random`}
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
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium leading-none truncate">
                    {userProfile?.full_name}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {userProfile?.email}
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
                  href={item.href}
                  className="flex items-center space-x-3 text-lg font-medium hover:text-primary transition-colors"
                  onClick={() => setShowMobileMenu(false)}
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
                        onClick={() => setShowMobileMenu(false)}
                      >
                        {subItem.title}
                      </a>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}

          {!isAuthenticated ? (
            <div className="space-y-4 pt-6">
              <Button
                variant="outline"
                className="w-full justify-center rounded-full"
                onClick={() => {
                  onSignIn?.();
                  setShowMobileMenu(false);
                }}
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
                onClick={() => {
                  handleSignOut();
                  setShowMobileMenu(false);
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </div>
          )}
        </nav>
      </MobileNav>
    </>
  );
};

export default Header;
