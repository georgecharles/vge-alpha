import { supabase } from "./supabase";
import type { Property, SavedProperty } from "../types/database";

export async function getFeaturedProperties() {
  const { data, error } = await supabase
    .from("properties")
    .select(
      `
      *,
      assigned_user:profiles!properties_assigned_user_id_fkey(full_name, email),
      author:profiles!properties_created_by_fkey(full_name, email)
    `,
    )
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  return (
    data?.map((property) => ({
      ...property,
      images: property.images || [
        `https://images.unsplash.com/photo-${Math.floor(Math.random() * 10) + 1}-house?auto=format&fit=crop&q=80&w=800&h=600`,
      ],
    })) || []
  );
}

export async function searchProperties(searchTerm: string) {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .or(
      `address.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,postcode.ilike.%${searchTerm}%`,
    )
    .limit(20);

  if (error) throw error;
  return data as Property[];
}

export async function getProperty(id: string) {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Property;
}

export async function saveProperty(
  propertyId: string,
  userId: string,
  notes: string = "",
) {
  const { data, error } = await supabase
    .from("saved_properties")
    .insert([
      {
        property_id: propertyId,
        user_id: userId,
        notes,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data as SavedProperty;
}

export async function getSavedProperties(userId: string) {
  const { data, error } = await supabase
    .from("saved_properties")
    .select(
      `
      *,
      property:properties(*)
    `,
    )
    .eq("user_id", userId);

  if (error) throw error;
  return data;
}
