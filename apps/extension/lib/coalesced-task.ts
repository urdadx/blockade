/**
 * Wraps `task` so overlapping calls never run it concurrently: a call made while it
 * runs schedules exactly one more run, and every call resolves once a run that
 * started after it has finished. Errors are logged, not thrown.
 */
export function createCoalescedTask(task: () => Promise<void>, errorMessage: string) {
  let pending = false;
  let running: Promise<void> | null = null;

  const drain = async () => {
    try {
      while (pending) {
        pending = false;
        try {
          await task();
        } catch (error) {
          console.error(errorMessage, error);
        }
      }
    } finally {
      // Runs in the same turn the loop sees `pending` false, so no request can slip in between.
      running = null;
    }
  };

  return () => {
    pending = true;
    running ??= drain();
    return running;
  };
}
