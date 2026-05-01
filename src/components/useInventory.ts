"use client";

import useSWR from "swr";
import { fetchJson } from "@/lib/fetcher";

export type InventoryStatus = "handed_over" | "pending" | "returned" | "missing";

export type InventoryItem = {
  _id: string;
  weddingId: string;
  itemName: string;
  quantity?: number;
  unit?: string;
  handedOverTo?: string;
  status: InventoryStatus;
  notes?: string;
  photoRequired: boolean;
  billRequired: boolean;
  createdAt: string;
  updatedAt: string;
};

export function useInventory(weddingSlug: string) {
  return useSWR<{ items: InventoryItem[] }>(
    `/api/inventory?weddingSlug=${encodeURIComponent(weddingSlug)}`,
    fetchJson,
    { refreshInterval: 20000, keepPreviousData: true }
  );
}

