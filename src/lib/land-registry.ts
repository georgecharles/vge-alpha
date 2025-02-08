import { supabase } from "./supabase";

const API_KEY = "adb4216e-a98d-4de9-893d-bccb0d551d68";
const BASE_URL = "https://use-land-property-data.service.gov.uk/api/v1";

interface PropertyOwnership {
  company_name: string;
  property_address: string;
  tenure: string;
  price_paid?: number;
  date_of_transfer?: string;
}

export async function getOverseasCompanyProperties(): Promise<
  PropertyOwnership[]
> {
  try {
    // First try to get from Supabase
    const { data: cachedData, error: cacheError } = await supabase
      .from("overseas_properties")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!cacheError && cachedData && cachedData.length > 0) {
      return cachedData;
    }

    // If no cached data, fetch from API
    const response = await fetch(`${BASE_URL}/overseas-companies`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch overseas company data");
    const data = await response.json();

    // Store in Supabase
    if (data.results && data.results.length > 0) {
      const { error } = await supabase.from("overseas_properties").insert(
        data.results.map((item: any) => ({
          company_name: item.company_name,
          property_address: item.property_address,
          tenure: item.tenure,
          price_paid: item.price_paid,
          date_of_transfer: item.date_of_transfer,
          created_at: new Date().toISOString(),
        })),
      );

      if (error) console.error("Error storing overseas properties:", error);
    }

    return data.results;
  } catch (error) {
    console.error("Error fetching overseas company properties:", error);
    return [];
  }
}

export async function getUKCompanyProperties(): Promise<PropertyOwnership[]> {
  try {
    // First try to get from Supabase
    const { data: cachedData, error: cacheError } = await supabase
      .from("uk_properties")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!cacheError && cachedData && cachedData.length > 0) {
      return cachedData;
    }

    // If no cached data, fetch from API
    const response = await fetch(`${BASE_URL}/uk-companies`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch UK company data");
    const data = await response.json();

    // Store in Supabase
    if (data.results && data.results.length > 0) {
      const { error } = await supabase.from("uk_properties").insert(
        data.results.map((item: any) => ({
          company_name: item.company_name,
          property_address: item.property_address,
          tenure: item.tenure,
          price_paid: item.price_paid,
          date_of_transfer: item.date_of_transfer,
          created_at: new Date().toISOString(),
        })),
      );

      if (error) console.error("Error storing UK properties:", error);
    }

    return data.results;
  } catch (error) {
    console.error("Error fetching UK company properties:", error);
    return [];
  }
}
