"use client";

import useSWR from "swr";
import { fetchJson } from "@/lib/fetcher";

export type Wedding = {
  _id: string;
  coupleName: string;
  date: string;
  churchName: string;
  hotelName: string;
  locations: { name: string; type: string; mapUrl?: string }[];
  notes?: string;
};

export function useWedding() {
  return useSWR<{ weddings: Wedding[] }>(`/api/wedding`, fetchJson, {
    refreshInterval: 15000,
    keepPreviousData: true
  });
}

export function pickDefaultWeddingId(weddings: Wedding[]) {
  const target = weddings.find((w) => w.coupleName === "Suhashi & Darshana");
  return target?._id ?? weddings[0]?._id ?? null;
}

