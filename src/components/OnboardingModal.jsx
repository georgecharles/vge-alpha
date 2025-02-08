import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "./ui/use-toast";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";

export function OnboardingModal(props) {
  const [step, setStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = React.useState({
    profileImage: "",
    bannerImage: "",
    selectedWidgets: [],
  });

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          avatar_url:
            formData.profileImage ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
          banner_url:
            formData.bannerImage ||
            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
          dashboard_widgets: formData.selectedWidgets,
          onboarding_completed: true,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Setup Complete!",
        description: "Your profile has been updated successfully.",
      });
      props.onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: "Profile Image",
      description: "Add a profile image to personalize your account",
      component: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Profile Image URL</Label>
            <Input
              placeholder="Enter image URL or leave blank for default avatar"
              value={formData.profileImage}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  profileImage: e.target.value,
                }))
              }
            />
          </div>
          {formData.profileImage && (
            <img
              src={formData.profileImage}
              alt="Profile Preview"
              className="w-24 h-24 rounded-full object-cover mx-auto"
            />
          )}
        </div>
      ),
    },
    {
      title: "Dashboard Banner",
      description: "Choose a banner image for your dashboard",
      component: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Banner Image URL</Label>
            <Input
              placeholder="Enter banner image URL or leave blank for default"
              value={formData.bannerImage}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  bannerImage: e.target.value,
                }))
              }
            />
          </div>
          {formData.bannerImage && (
            <img
              src={formData.bannerImage}
              alt="Banner Preview"
              className="w-full h-32 object-cover rounded-md"
            />
          )}
        </div>
      ),
    },
    {
      title: "Dashboard Widgets",
      description: "Select the widgets you want to see on your dashboard",
      component: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              "market_trends",
              "property_news",
              "saved_properties",
              "price_alerts",
              "market_insights",
              "investment_calculator",
            ].map((widget) => (
              <Button
                key={widget}
                variant={
                  formData.selectedWidgets.includes(widget)
                    ? "default"
                    : "outline"
                }
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    selectedWidgets: prev.selectedWidgets.includes(widget)
                      ? prev.selectedWidgets.filter((w) => w !== widget)
                      : [...prev.selectedWidgets, widget],
                  }))
                }
                className="h-auto py-4 px-6 text-left flex flex-col items-start space-y-2"
              >
                <span className="font-medium capitalize">
                  {widget.replace("_", " ")}
                </span>
              </Button>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <Dialog open={props.isOpen} onOpenChange={props.onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{steps[step].title}</DialogTitle>
          <DialogDescription>{steps[step].description}</DialogDescription>
        </DialogHeader>

        <div className="py-6">{steps[step].component}</div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            Previous
          </Button>
          <Button
            onClick={() => {
              if (step === steps.length - 1) {
                handleComplete();
              } else {
                setStep((s) => Math.min(steps.length - 1, s + 1));
              }
            }}
            disabled={loading}
          >
            {step === steps.length - 1 ? "Complete Setup" : "Next"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
