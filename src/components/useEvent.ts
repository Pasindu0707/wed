"use client";

import useSWR from "swr";
import { envEventSlug } from "@/lib/runtime";
import { fetchJson } from "@/lib/fetcher";

export type EventApiResponse = { event: any };

export function useEvent() {
  const slug = envEventSlug();
  return useSWR<EventApiResponse>(`/api/events/${slug}`, fetchJson, {
    refreshInterval: 2500,
    keepPreviousData: true
  });
}

