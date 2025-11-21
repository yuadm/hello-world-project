/**
 * UK Postcode Lookup Service using postcodes.io API
 * Free, no API key required
 */

export interface PostcodeAddress {
  line1: string;
  line2?: string;
  town: string;
  postcode: string;
  county?: string;
  country?: string;
}

export interface GetAddressResult {
  line_1: string;
  line_2: string;
  line_3: string;
  line_4: string;
  locality: string;
  town_or_city: string;
  county: string;
  formatted_address: string[];
}

export interface AddressListItem {
  formatted: string;
  line1: string;
  line2: string;
  town: string;
  county: string;
}

export interface PostcodeResult {
  postcode: string;
  latitude: number;
  longitude: number;
  region: string;
  admin_district: string;
  admin_county: string;
  admin_ward: string;
  parish: string;
  country: string;
}

/**
 * Lookup a UK postcode and return address details
 */
export async function lookupPostcode(postcode: string): Promise<PostcodeResult | null> {
  try {
    // Clean postcode - remove spaces and convert to uppercase
    const cleanPostcode = postcode.replace(/\s/g, "").toUpperCase();
    
    const response = await fetch(`https://api.postcodes.io/postcodes/${cleanPostcode}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // Postcode not found
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 200 && data.result) {
      return data.result;
    }
    
    return null;
  } catch (error) {
    console.error("Postcode lookup error:", error);
    throw new Error("Failed to lookup postcode. Please check your connection and try again.");
  }
}

/**
 * Validate a UK postcode format
 */
export function validatePostcode(postcode: string): boolean {
  // UK postcode regex pattern
  const postcodeRegex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;
  return postcodeRegex.test(postcode.trim());
}

/**
 * Format postcode to standard UK format (uppercase with space)
 */
export function formatPostcode(postcode: string): string {
  const clean = postcode.replace(/\s/g, "").toUpperCase();
  
  // Insert space before last 3 characters (e.g., SW1A1AA -> SW1A 1AA)
  if (clean.length >= 5) {
    return `${clean.slice(0, -3)} ${clean.slice(-3)}`;
  }
  
  return clean;
}

/**
 * Convert PostcodeResult to simplified address format
 */
export function postcodeResultToAddress(result: PostcodeResult, addressLine1: string = ""): PostcodeAddress {
  return {
    line1: addressLine1,
    line2: result.admin_ward || "",
    town: result.admin_district || result.region || "",
    postcode: result.postcode,
    county: result.admin_county || "",
    country: result.country || "England",
  };
}

/**
 * Lookup addresses using getAddress.io API
 */
export async function lookupAddressesByPostcode(postcode: string): Promise<AddressListItem[]> {
  const apiKey = "jWbrYO6OSEqT52cM2_hBsA48837";
  
  if (!apiKey) {
    throw new Error("getAddress.io API key not configured");
  }

  try {
    const cleanPostcode = postcode.replace(/\s/g, "").toLowerCase();
    const response = await fetch(
      `https://api.getAddress.io/find/${cleanPostcode}?api-key=${apiKey}&expand=true`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      if (response.status === 401) {
        throw new Error("Invalid API key");
      }
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.addresses && Array.isArray(data.addresses)) {
      return data.addresses.map((addr: GetAddressResult, index: number) => {
        const line1 = addr.line_1 || "";
        const line2 = addr.line_2 || "";
        const town = addr.town_or_city || addr.locality || "";
        const county = addr.county || "";
        
        // Create formatted display string
        const parts = [line1, line2, town].filter(Boolean);
        const formatted = parts.join(", ");

        return {
          formatted,
          line1,
          line2,
          town,
          county,
        };
      });
    }

    return [];
  } catch (error) {
    console.error("Address lookup error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to lookup addresses. Please try again.");
  }
}
