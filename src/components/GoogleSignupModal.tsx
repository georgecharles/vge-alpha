import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { supabase } from '../lib/supabase';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Check, Crown, Star } from 'lucide-react';

interface GoogleSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  googleUser: any;
}

const subscriptionPlans = [
  {
    id: 'free',
    name: 'Free',
    description: 'Basic access to property listings',
    price: '£0/month',
    icon: Star,
    features: ['Basic property search', 'Limited market insights', 'Email support']
  },
  {
    id: 'basic',
    name: 'Basic',
    description: 'Enhanced property insights',
    price: '£9.99/month',
    icon: Check,
    features: ['Advanced search filters', 'Market trends access', 'Priority support']
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Full access to all features',
    price: '£19.99/month',
    icon: Crown,
    features: ['Full market analysis', 'Investment predictions', '24/7 support', 'Deal alerts']
  }
];

export function GoogleSignupModal({ isOpen, onClose, googleUser }: GoogleSignupModalProps) {
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [selectedPlan, setSelectedPlan] = React.useState('free');
  const [isLoading, setIsLoading] = React.useState(false);
  const [step, setStep] = React.useState(1); // 1 for name input, 2 for subscription

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }

    setIsLoading(true);
    console.log('Starting profile creation for user:', {
      id: googleUser.id,
      email: googleUser.email,
      auth: await supabase.auth.getUser()
    });

    try {
      // First check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', googleUser.id)
        .single();

      if (checkError && !checkError.message.includes('not found')) {
        console.error('Error checking existing profile:', checkError);
        throw checkError;
      }

      if (existingProfile) {
        console.log('Profile already exists:', existingProfile);
        onClose();
        return;
      }

      // Create new profile
      const profileData = {
        id: googleUser.id,
        email: googleUser.email,
        full_name: `${firstName} ${lastName}`,
        role: 'user',
        subscription_tier: selectedPlan,
        subscription_status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('Attempting to create profile with data:', profileData);

      // First try to insert
      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select('*')
        .single(); // Add single() to get just one row

      if (error) {
        console.error('Detailed profile creation error:', error);
        throw error;
      }

      // Verify the profile was created
      if (!data) {
        console.error('No profile data returned after creation');
        throw new Error('Failed to create profile - no data returned');
      }

      console.log('Profile created successfully:', data);

      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
          subscription_tier: selectedPlan
        }
      });

      if (authError) {
        console.error('Auth metadata update error:', authError);
        // Don't throw here, as profile is already created
      }

      // Verify the profile exists after creation
      const { data: verifyProfile, error: verifyError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', googleUser.id)
        .single();

      if (verifyError || !verifyProfile) {
        console.error('Profile verification failed:', verifyError);
        throw new Error('Profile creation could not be verified');
      }

      console.log('Profile verified:', verifyProfile);

      onClose();
      window.location.reload(); // Refresh to update auth state
    } catch (error) {
      console.error('Full error details:', error);
      alert(`Failed to create profile: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? 'Complete Your Profile' : 'Choose Your Subscription'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 ? (
            <>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Next
              </Button>
            </>
          ) : (
            <>
              <RadioGroup
                value={selectedPlan}
                onValueChange={setSelectedPlan}
                className="grid grid-cols-1 gap-4 pt-2"
              >
                {subscriptionPlans.map((plan) => (
                  <div key={plan.id}>
                    <RadioGroupItem
                      value={plan.id}
                      id={plan.id}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={plan.id}
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <plan.icon className="mb-3 h-6 w-6" />
                      <div className="mb-2 text-lg font-semibold">{plan.name}</div>
                      <div className="text-sm text-muted-foreground mb-2">{plan.description}</div>
                      <div className="text-lg font-bold">{plan.price}</div>
                      <ul className="mt-2 text-sm text-muted-foreground">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-center">
                            <Check className="mr-2 h-4 w-4" /> {feature}
                          </li>
                        ))}
                      </ul>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Creating Profile...' : 'Complete Sign Up'}
              </Button>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
} 