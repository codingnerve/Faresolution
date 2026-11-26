"use client";

import { usePathname } from "next/navigation";
import { Suspense, useEffect, useEffectEvent, useRef } from "react";

function Listener({ onChange }: { onChange: () => void }) {
  const pathname = usePathname();
  const previous = useRef(pathname);
  const notify = useEffectEvent(onChange);
  useEffect(() => {
    if (previous.current !== pathname) {
      previous.current = pathname;
      notify();
    }
  }, [pathname]);
  return null;
}

/**
 * Calls `onChange` whenever the pathname changes (not on first render),
 * including browser back/forward, so header menus and drawers close on any
 * navigation. Wrapped in its own Suspense boundary because `usePathname` can
 * suspend on routes whose params are only known at request time.
 */
export function RouteChangeListener({ onChange }: { onChange: () => void }) {
  return (
    <Suspense fallback={null}>
      <Listener onChange={onChange} />
    </Suspense>
  );
}
