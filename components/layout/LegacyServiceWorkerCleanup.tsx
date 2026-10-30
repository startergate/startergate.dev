"use client";

import { useEffect } from "react";

/**
 * Unregisters the old Gatsby site's root-scoped service worker if it is still
 * around (see public/sw.js). Only the "/" scope is touched so the /v1/ site
 * keeps its own worker.
 */
export function LegacyServiceWorkerCleanup() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const rootScope = `${location.origin}/`;
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        if (registration.scope === rootScope) registration.unregister();
      }
    });
  }, []);

  return null;
}
