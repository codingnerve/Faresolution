"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { searchParamsToRecord } from "@/lib/directory/query";
import { DirectoryView, type DirectoryViewProps } from "./DirectoryView";

/**
 * Reads the URL query on the client and renders the listing for it. Must sit
 * inside `<Suspense>`: on this static route `useSearchParams` makes the
 * boundary render in the browser, while the fallback (the unfiltered
 * listing) is what the prerendered HTML contains.
 */
export function DirectoryClient(props: Omit<DirectoryViewProps, "params">) {
  const searchParams = useSearchParams();
  const params = useMemo(() => searchParamsToRecord(searchParams), [searchParams]);
  return <DirectoryView {...props} params={params} />;
}
