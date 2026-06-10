import { useState, useEffect, useCallback } from "react";

// ─── dogapi.dog v2 response types ────────────────────────────────────────────
// GET https://dogapi.dog/api/v2/breeds
// Response shape (JSON:API spec):
// {
//   data: [
//     {
//       id: "68f47c5a-5115-47cd-9849-e45d3a33a57e",
//       type: "breed",
//       attributes: {
//         name: "Labrador Retriever",
//         description: "...",
//         life: { min: 10, max: 12 },
//         male_weight: { min: 29, max: 36 },
//         female_weight: { min: 25, max: 32 },
//         hypoallergenic: false
//       }
//     }
//   ],
//   links: {
//     self: "https://dogapi.dog/api/v2/breeds?page[number]=1",
//     current: "...",
//     next: "https://dogapi.dog/api/v2/breeds?page[number]=2",
//     last: "https://dogapi.dog/api/v2/breeds?page[number]=10"
//   }
// }

export interface DogBreed {
  id: string;
  name: string;
  description: string;
  lifeMin: number;
  lifeMax: number;
  hypoallergenic: boolean;
}

interface ApiBreedAttributes {
  name: string;
  description: string;
  life: { min: number; max: number };
  male_weight: { min: number; max: number };
  female_weight: { min: number; max: number };
  hypoallergenic: boolean;
}

interface ApiBreedResource {
  id: string;
  type: string;
  attributes: ApiBreedAttributes;
}

interface ApiResponse {
  data: ApiBreedResource[];
  links: {
    self: string;
    current?: string;
    next?: string | null;
    last?: string;
  };
}

const BASE_URL = "https://dogapi.dog/api/v2/breeds";
const PAGE_SIZE = 100; // max out to reduce pagination calls

function mapBreed(resource: ApiBreedResource): DogBreed {
  return {
    id: resource.id,
    name: resource.attributes.name,
    description: resource.attributes.description,
    lifeMin: resource.attributes.life?.min ?? 0,
    lifeMax: resource.attributes.life?.max ?? 0,
    hypoallergenic: resource.attributes.hypoallergenic,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export interface UseDogBreedsReturn {
  breeds: DogBreed[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useDogBreeds(): UseDogBreedsReturn {
  const [breeds, setBreeds] = useState<DogBreed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const retry = useCallback(() => setTrigger((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function fetchAllBreeds() {
      setLoading(true);
      setError(null);

      try {
        const allBreeds: DogBreed[] = [];
        let nextUrl: string | null = `${BASE_URL}?page[number]=1&page[size]=${PAGE_SIZE}`;

        // paginate through all pages
        while (nextUrl) {
          const res = await fetch(nextUrl, {
            headers: { Accept: "application/json" },
          });

          if (!res.ok) {
            throw new Error(`DogAPI returned ${res.status}: ${res.statusText}`);
          }

          const json: ApiResponse = await res.json();

          if (!cancelled) {
            const mapped = (json.data ?? []).map(mapBreed);
            allBreeds.push(...mapped);
          }

          // follow pagination until there's no next page
          nextUrl = json.links?.next ?? null;

          // safety: if next === current/self, stop to avoid infinite loop
          if (nextUrl === json.links?.self || nextUrl === json.links?.current) {
            nextUrl = null;
          }
        }

        if (!cancelled) {
          // sort alphabetically
          allBreeds.sort((a, b) => a.name.localeCompare(b.name));
          setBreeds(allBreeds);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load breeds.";
          setError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAllBreeds();
    return () => { cancelled = true; };
  }, [trigger]);

  return { breeds, loading, error, retry };
}