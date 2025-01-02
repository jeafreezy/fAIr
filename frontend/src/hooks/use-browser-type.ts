import { useEffect, useMemo, useState } from 'react';

/**
 * Custom hook to detect if the current browser is Google Chrome.
 *
 * @returns { isChrome: boolean } - An object containing a boolean value indicating if the browser is Chrome.
 *
 */
export const useBrowserType = (): { isChrome: boolean } => {
  const [isChrome, setIsChrome] = useState<boolean>(false);

  useEffect(() => {
    const uaData = (navigator as any).userAgentData;
    if (uaData && typeof uaData.getHighEntropyValues === "function") { 
      uaData
        .getHighEntropyValues(["brands"])
        .then((data: { brands: Array<{ brand: string; version: string }> }) => {
          const isChromeBrowser = data.brands.some((b) =>
            b.brand.toLowerCase().includes("chrome")
          );
          setIsChrome(isChromeBrowser);
        })
        .catch((err) => {
          setIsChrome(
            /Chrome/.test(navigator.userAgent) &&
            /Google Inc/.test(navigator.vendor)
          );
        });
    } else {
      setIsChrome(
        /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
      );
    }
  }, []);

  return { isChrome };
};

