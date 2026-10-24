import { useEffect, useState } from "react";

type NetworkInformation = { saveData?: boolean };

/**
 * Downloads a video once the page has loaded and the browser is idle, so it never
 * competes with the landing page for bandwidth. Resolves to a blob URL the player
 * can start instantly, or null until then (and when the visitor has Data Saver on).
 */
export function useBackgroundVideo(src: string) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    if (connection?.saveData) return;

    const controller = new AbortController();
    let objectUrl: string | null = null;
    let idleHandle: number | undefined;

    const download = async () => {
      try {
        const response = await fetch(src, { signal: controller.signal });
        if (!response.ok) return;
        objectUrl = URL.createObjectURL(await response.blob());
        setBlobUrl(objectUrl);
      } catch {
        // Aborted or offline: the player falls back to streaming `src`.
      }
    };
    // Safari has no requestIdleCallback.
    const requestIdle = window.requestIdleCallback as typeof window.requestIdleCallback | undefined;
    const cancelIdle = window.cancelIdleCallback as typeof window.cancelIdleCallback | undefined;
    const scheduleDownload = () => {
      idleHandle = requestIdle
        ? requestIdle(() => void download(), { timeout: 5_000 })
        : window.setTimeout(() => void download(), 2_000);
    };

    if (document.readyState === "complete") scheduleDownload();
    else window.addEventListener("load", scheduleDownload, { once: true });

    return () => {
      window.removeEventListener("load", scheduleDownload);
      if (idleHandle !== undefined) {
        if (cancelIdle) cancelIdle(idleHandle);
        else window.clearTimeout(idleHandle);
      }
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  return blobUrl;
}
