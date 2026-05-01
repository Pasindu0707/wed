"use client";

import useSWR from "swr";
import { fetchJson } from "@/lib/fetcher";

export type ChecklistStatus = "pending" | "in_progress" | "done" | "issue";
export type Priority = "low" | "medium" | "high" | "critical";
export type Section =
  | "Church"
  | "Hotel"
  | "Inventory"
  | "PhotoVideo"
  | "Timeline"
  | "RobeShoot"
  | "FinalHandover"
  | "Other";

export type ChecklistItem = {
  _id: string;
  weddingId: string;
  section: Section;
  title: string;
  description?: string;
  notes?: string;
  priority: Priority;
  status: ChecklistStatus;
  dueTime?: string;
  assignedTo?: string;
  imageRefs?: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export function useChecklist(weddingSlug: string) {
  return useSWR<{ items: ChecklistItem[] }>(
    `/api/checklist?weddingSlug=${encodeURIComponent(weddingSlug)}`,
    fetchJson,
    {
      refreshInterval: 20000,
      keepPreviousData: true
    }
  );
}

