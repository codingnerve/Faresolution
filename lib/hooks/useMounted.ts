"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/** True once hydrated on the client (portals need `document`). */
export function useMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
