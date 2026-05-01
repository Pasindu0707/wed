"use client";

import useSWR from "swr";
import { fetchJson } from "@/lib/fetcher";

export type ShotStatus = "pending" | "captured" | "missed";

export type MediaShot = {
  _id: string;
  weddingId: string;
  category: string;
  title: string;
  description?: string;
  required: boolean;
  status: ShotStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export function useShots(weddingSlug: string) {
  return useSWR<{ items: MediaShot[] }>(
    `/api/media-shots?weddingSlug=${encodeURIComponent(weddingSlug)}`,
    fetchJson,
    { refreshInterval: 20000, keepPreviousData: true }
  );
}

