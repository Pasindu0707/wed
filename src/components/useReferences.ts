"use client";

import useSWR from "swr";
import { fetchJson } from "@/lib/fetcher";

export type ReferenceStatus = "not_checked" | "matches" | "issue";

export type ReferenceImage = {
  _id: string;
  weddingId: string;
  area: "Church" | "Hotel" | "Cake" | "Table" | "Entrance" | "SetteeBack" | "MainTable" | "Other";
  fileName: string;
  expectedDetails?: string;
  description?: string;
  checklistNotes?: string;
  status: ReferenceStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export function useReferences(weddingSlug: string) {
  return useSWR<{ items: ReferenceImage[] }>(
    `/api/reference-images?weddingSlug=${encodeURIComponent(weddingSlug)}`,
    fetchJson,
    { refreshInterval: 20000, keepPreviousData: true }
  );
}

