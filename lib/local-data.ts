export const WORKPULSE_STORAGE_PREFIX = "workpulse.";

export type RemovableStorage = {
  key(index: number): string | null;
  readonly length: number;
  removeItem(key: string): void;
};

export type LocalDataClearResult = {
  failedKeys: string[];
  removedKeys: string[];
};

export function listWorkPulseLocalDataKeys(
  storage: Pick<RemovableStorage, "key" | "length">,
): string[] {
  const keys: string[] = [];

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key?.startsWith(WORKPULSE_STORAGE_PREFIX)) keys.push(key);
  }

  return keys;
}

export function clearWorkPulseLocalData(
  storage: RemovableStorage,
): LocalDataClearResult {
  const removedKeys: string[] = [];
  const failedKeys: string[] = [];
  let keys: string[];

  try {
    keys = listWorkPulseLocalDataKeys(storage);
  } catch {
    return { failedKeys: [WORKPULSE_STORAGE_PREFIX], removedKeys };
  }

  for (const key of keys) {
    try {
      storage.removeItem(key);
      removedKeys.push(key);
    } catch {
      failedKeys.push(key);
    }
  }

  return { failedKeys, removedKeys };
}
