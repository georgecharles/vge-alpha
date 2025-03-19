import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from './ui/use-toast';
import { Card } from './ui/card';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { ChevronRight, ArrowRight, Mail, ShieldCheck, Zap } from 'lucide-react';

// Validation schema for the email form
const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function WaitlistPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const auth = useAuth(); // Get the full auth object
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showDevAuth, setShowDevAuth] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Store the email in Supabase waitlist table
      const { error } = await supabase
        .from('waitlist')
        .insert([
          { email: data.email, signed_up_at: new Date().toISOString() }
        ]);
        
      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "You're already on the waitlist",
            description: "We already have your email on our waitlist. We'll notify you when you're invited to the alpha.",
            variant: "default",
          });
        } else {
          console.error('Error submitting to waitlist:', error);
          toast({
            title: "Submission error",
            description: "There was a problem adding you to the waitlist. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        setIsSubmitted(true);
        toast({
          title: "You're on the list!",
          description: "Thanks for joining our waitlist. We'll notify you when you're invited to the alpha.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission error",
        description: "There was a problem adding you to the waitlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle email login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast({
        title: "Missing information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoggingIn(true);
      
      // Direct Supabase auth login with persist session option
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
        options: {
          // These options help ensure the session persists properly
          persistSession: true
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Signed in successfully",
        description: "Welcome to VGE Alpha.",
        variant: "default",
      });
      
      // Store a login flag in localStorage
      localStorage.setItem('vge_user_authenticated', 'true');
      localStorage.setItem('vge_auth_timestamp', Date.now().toString());
      
      // Ensure the session was created properly
      console.log("Login success, session established:", !!data.session);
      
      // Completely reload the application rather than just navigating
      // This forces a clean auth state reload
      window.location.href = '/';
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: "Authentication error",
        description: error.message || "There was a problem signing in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    try {
      // Use direct Supabase auth
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback',
          persistSession: true
        }
      });
      
      if (error) throw error;
      
      // The OAuth callback will handle the redirect
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast({
        title: "Authentication error",
        description: "There was a problem signing in with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            {/* Use the logo from the rest of the app */}
            <div className="h-8 mr-2">
              {/* App Logo - Using a simple text logo as a fallback */}
              <img 
                src="/logo.svg" 
                alt="VGE Alpha" 
                className="h-full"
                onError={(e) => {
                  // If logo fails to load, fall back to text
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML += `<span class="font-bold text-2xl text-primary">VGE Alpha</span>`;
                }}
              />
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => setShowDevAuth(!showDevAuth)} 
            size="sm"
          >
            {showDevAuth ? 'Hide Developer Access' : 'Developer Access'}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-10 flex flex-col items-center justify-center">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* Left Column - Main Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                Property Investment Analytics Platform
              </h1>
              <p className="text-lg text-muted-foreground">
                Discover high-yield investment properties, analyze market trends, and make data-driven decisions.
              </p>
            </div>
            
            <div className="space-y-6">
              <Card className="p-6 border-muted shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-foreground">
                  {isSubmitted ? 'Thanks for joining our waitlist!' : 'Join our waitlist'}
                </h2>
                
                {!isSubmitted ? (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="email"
                          placeholder="you@example.com"
                          className="pl-10"
                          autoComplete="email"
                          {...register('email')}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                      )}
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Join Waitlist'}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                    
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      We'll notify you when you're invited to our alpha release.
                    </p>
                  </form>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <ShieldCheck className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-muted-foreground">
                      We've added your email to our waitlist. We'll notify you when you're invited to try out our platform.
                    </p>
                  </div>
                )}
              </Card>
              
              {showDevAuth && (
                <Card className="p-6 border-muted bg-muted/30 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center">
                    <Zap className="mr-2 h-5 w-5 text-yellow-500" />
                    Developer Access
                  </h2>
                  
                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="loginEmail">Email</Label>
                      <Input
                        id="loginEmail"
                        type="email"
                        placeholder="developer@vgealpha.com"
                        autoComplete="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="loginPassword">Password</Label>
                      <Input
                        id="loginPassword"
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoggingIn}
                    >
                      {isLoggingIn ? 'Signing in...' : 'Sign in with Email'}
                    </Button>
                  </form>
                  

                </Card>
              )}
            </div>
            
            {/* Features section for mobile - will only show on small screens */}
            <div className="md:hidden mt-10">
              <Card className="p-6 border-muted">
                <h3 className="text-lg font-semibold text-foreground mb-4">Platform Features</h3>
                <div className="space-y-4">
                  <FeatureItem 
                    title="Property Analytics"
                    description="Comprehensive analysis of potential investments"
                    color="bg-blue-500"
                  />
                  
                  <FeatureItem 
                    title="Market Trends"
                    description="Up-to-date information on property market changes"
                    color="bg-green-500"
                  />
                  
                  <FeatureItem 
                    title="Investment ROI"
                    description="Calculate potential returns on property investments"
                    color="bg-purple-500"
                  />
                  
                  <FeatureItem 
                    title="AI Recommendations"
                    description="Smart suggestions based on your investment criteria"
                    color="bg-orange-500"
                  />
                </div>
              </Card>
            </div>
          </div>
          
          {/* Right Column - Features (desktop only) */}
          <div className="hidden md:block">
            <div className="relative rounded-lg overflow-hidden border border-border shadow-md">
              <div className="aspect-video bg-muted p-6 flex flex-col justify-center">
                <h3 className="text-xl font-semibold text-foreground mb-4">Features</h3>
                
                <div className="space-y-4">
                  <FeatureItem 
                    title="Property Analytics"
                    description="Comprehensive analysis of potential investments"
                    color="bg-blue-500"
                  />
                  
                  <FeatureItem 
                    title="Market Trends"
                    description="Up-to-date information on property market changes"
                    color="bg-green-500"
                  />
                  
                  <FeatureItem 
                    title="Investment ROI"
                    description="Calculate potential returns on property investments"
                    color="bg-purple-500"
                  />
                  
                  <FeatureItem 
                    title="AI Recommendations"
                    description="Smart suggestions based on your investment criteria"
                    color="bg-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Feature Item component for the features list
function FeatureItem({ title, description, color }: { title: string; description: string; color: string }) {
  return (
    <div className="flex items-start space-x-3">
      <div className={`${color} h-5 w-1 rounded-full mt-1`} />
      <div>
        <h4 className="font-medium text-foreground">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
} 