"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * Detects a browser capability without breaking hydration.
 *
 * Reading `window` in a `useState` initialiser makes the server render the
 * unsupported branch and the client the supported one, which is a hydration
 * mismatch (React error #418). `useSyncExternalStore` is built for this: it
 * hydrates with the server snapshot, then re-renders if the client value
 * differs.
 */
export function useBrowserSupport(check: () => boolean): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    check,
    // Assume supported on the server: the vast majority of visitors are on
    // Chrome/Edge, so this is the branch that usually hydrates cleanly.
    () => true
  );
}
