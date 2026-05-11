import { useEffect, useState } from 'react';
import { useAppTheme } from "@/components/AppThemeProvider";

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const { scheme } = useAppTheme();

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (hasHydrated) {
    return scheme;
  }

  return 'light';
}
