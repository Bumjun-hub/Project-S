// 이 파일은 persist된 Zustand 스토어가 복구될 때까지 기다립니다.
type PersistHandles = {
  hasHydrated?: () => boolean;
  onFinishHydration?: (cb: () => void) => void | (() => void);
};

export function waitPersistHydration(handles: PersistHandles[]): Promise<void> {
  return Promise.all(
    handles.map(
      (h) =>
        new Promise<void>((resolve) => {
          if (h.hasHydrated?.()) {
            resolve();
            return;
          }
          if (h.onFinishHydration) {
            h.onFinishHydration(() => resolve());
            return;
          }
          queueMicrotask(() => resolve());
        }),
    ),
  ).then(() => undefined);
}
