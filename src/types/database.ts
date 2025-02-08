export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          subscription_tier: string;
          subscription_status: string;
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          subscription_tier?: string;
          subscription_status?: string;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          subscription_tier?: string;
          subscription_status?: string;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      properties: {
        Row: {
          id: string;
          address: string;
          city: string;
          postcode: string;
          price: number;
          bedrooms: number;
          bathrooms: number;
          square_footage: number;
          description: string;
          images: string[];
          is_featured: boolean;
          is_premium: boolean;
          created_by: string;
          assigned_user_id: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      saved_properties: {
        Row: {
          id: string;
          user_id: string;
          property_id: string;
          notes: string;
          created_at: string;
        };
      };
      market_insights: {
        Row: {
          id: string;
          content: string;
          generated_at: string;
        };
      };
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Property = Database["public"]["Tables"]["properties"]["Row"];
export type SavedProperty =
  Database["public"]["Tables"]["saved_properties"]["Row"];
export type MarketInsight =
  Database["public"]["Tables"]["market_insights"]["Row"];
