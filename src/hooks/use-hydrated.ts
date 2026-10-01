"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** False during SSR and hydration, true once running on the client. */
export function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
