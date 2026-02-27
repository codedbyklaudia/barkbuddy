export interface Coords {
  lat: number;
  lng: number;
}

function extractPostcode(text: string): string | null {
  const match = text.match(/\b([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})\b/i);
  return match ? match[1].replace(/\s+/, " ").trim().toUpperCase() : null;
}

export async function geocodeUKAddress(address: string, postcode: string): Promise<Coords | null> {
  // 1. Try full postcode
  const pc = extractPostcode(postcode) || extractPostcode(address);
  if (pc) {
    try {
      const res  = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(pc)}`);
      const data = await res.json();
      if (data.status === 200 && data.result) {
        return { lat: data.result.latitude, lng: data.result.longitude };
      }
    } catch (err) {
      console.warn("postcodes.io postcode lookup failed:", err);
    }

    // 2. Try outward code only (e.g. "E1" from "E1 6RF")
    const outward = pc.split(" ")[0];
    try {
      const res  = await fetch(`https://api.postcodes.io/outcodes/${encodeURIComponent(outward)}`);
      const data = await res.json();
      if (data.status === 200 && data.result) {
        return { lat: data.result.latitude, lng: data.result.longitude };
      }
    } catch (err) {
      console.warn("postcodes.io outward code lookup failed:", err);
    }
  }

  console.warn("Could not geocode:", address, postcode);
  return null;
}