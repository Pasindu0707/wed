"use client";

import useSWR from "swr";
import { fetchJson } from "@/lib/fetcher";

export type Wedding = {
  _id: string;
  slug: string;
  coupleName: string;
  date: string;
  churchName: string;
  hotelName: string;
  locations: { name: string; type: string; mapUrl?: string }[];
  notes?: string;
};

export function useWeddingBySlug(slug: string) {
  return useSWR<{ wedding: Wedding }>(`/api/wedding/by-slug/${encodeURIComponent(slug)}`, fetchJson, {
    refreshInterval: 15000,
    keepPreviousData: true
  });
}

