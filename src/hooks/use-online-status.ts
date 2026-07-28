import * as React from "react";

/**
 * Tracks browser online/offline transitions. Defaults to `true` for SSR so
 * hydration matches the typical connected state; the effect corrects it.
 */
export function useOnlineStatus() {
  const [online, setOnline] = React.useState(true);

  React.useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return online;
}
