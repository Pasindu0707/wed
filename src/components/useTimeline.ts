"use client";

import useSWR from "swr";
import { fetchJson } from "@/lib/fetcher";

export type TimelineStatus = "pending" | "done" | "delayed" | "issue";

export type TimelineItem = {
  _id: string;
  weddingId: string;
  time: string;
  title: string;
  location?: string;
  description?: string;
  status: TimelineStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export function useTimeline(weddingSlug: string) {
  return useSWR<{ items: TimelineItem[] }>(
    `/api/timeline?weddingSlug=${encodeURIComponent(weddingSlug)}`,
    fetchJson,
    { refreshInterval: 20000, keepPreviousData: true }
  );
}

