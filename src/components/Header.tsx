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

    const Header = ({
      isAuthenticated = false,
      onSignIn,
      onSignUp,
      userProfile = {},
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
                          Stay updated with the latest real estate market
                          trends.
                        </ListItem>
                        <ListItem href="/insights" title="Market Insights">
                          Deep dive into property market analytics and
                          forecasts.
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
                        <ListItem
                          href="/property-management"
                          title="Property Management"
                        >
                          Let us take care of your property.
                        </ListItem>
                        <ListItem
                          href="/investment-opportunities"
                          title="Investment Opportunities"
                        >
                          Discover tailored investment strategies.
                        </ListItem>
                        <ListItem href="/calculators" title="Calculators">
                          Calculate different aspects of your property
                          investment.
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
                  className="hidden md:flex bg-gradient-to-r from-emerald-400 to-cyan-400 text-white hover:from-emerald-500 hover:to-cyan-500 border border-emerald-500/20 shadow-lg hover:shadow-emerald-500/20 transition-all duration-300"
                  onClick={() => (window.location.href = "/pricing")}
                >
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade
                </Button>
                {isSignedIn ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div>
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
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56 bg-white/80 backdrop-blur-md"
                      align="end"
                      forceMount
                    >
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
                ) : (
                  <div className="hidden md:flex items-center gap-4">
                    <SignInButton mode="modal">
                      <Button variant="ghost">
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In
                      </Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button variant="default">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Sign Up
                      </Button>
                    </SignUpButton>
                  </div>
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
