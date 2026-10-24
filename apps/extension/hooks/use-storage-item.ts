import { useEffect, useState } from "react";

import type { StorageItem } from "../lib/storage-item";

/** Live value of a storage item: `initialValue` until the first read, then every change. */
export function useStorageItem<T>(item: StorageItem<T>, initialValue: T) {
  const [state, setState] = useState({ value: initialValue, isLoading: true });

  useEffect(() => {
    let active = true;
    let receivedUpdate = false;
    const unsubscribe = item.subscribe((value) => {
      receivedUpdate = true;
      setState({ value, isLoading: false });
    });
    void item.get().then((value) => {
      if (active && !receivedUpdate) setState({ value, isLoading: false });
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [item]);

  return state;
}
