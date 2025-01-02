import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react-hooks";
import { useBrowserType } from "../use-browser-type";

describe("useBrowserType (with UA-CH)", () => {
  it("should return true if navigator.userAgentData is available and brand includes Chrome", async () => {
    Object.defineProperty(navigator, "userAgentData", {
      value: {
        getHighEntropyValues: vi.fn().mockResolvedValue({
          brands: [
            { brand: "Chromium", version: "112" },
            { brand: "Google Chrome", version: "112" },
            { brand: "Not:A-Brand", version: "99" },
          ],
        }),
      },
      configurable: true,
    });

    const { result, waitForNextUpdate } = renderHook(() => useBrowserType());

    await waitForNextUpdate();

    expect(result.current.isChrome).toBe(true);
  });

  it("should return false if UA-CH brands do not include Chrome", async () => {
    Object.defineProperty(navigator, "userAgentData", {
      value: {
        getHighEntropyValues: vi.fn().mockResolvedValue({
          brands: [{ brand: "Not-A-Brand", version: "100" }],
        }),
      },
      configurable: true,
    });
    const { result, waitForNextUpdate } = renderHook(() => useBrowserType());
    expect(result.current.isChrome).toBe(false);
  });
});

describe("useBrowserType (fallback to userAgent)", () => {
  it("should return true for Chrome user agent (fallback path)", () => {
    Object.defineProperty(navigator, "userAgentData", {
      value: undefined,
      configurable: true,
    });

    Object.defineProperty(window.navigator, "userAgent", {
      value:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) " +
        "Chrome/58.0.3029.110 Safari/537.3",
      configurable: true,
    });
    Object.defineProperty(window.navigator, "vendor", {
      value: "Google Inc.",
      configurable: true,
    });
    const { result } = renderHook(() => useBrowserType());
    expect(result.current.isChrome).toBe(true);
  });

  it("should return false for Firefox user agent (fallback path)", () => {
    Object.defineProperty(navigator, "userAgentData", {
      value: undefined,
      configurable: true,
    });
    Object.defineProperty(window.navigator, "userAgent", {
      value:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:54.0) " +
        "Gecko/20100101 Firefox/54.0",
      configurable: true,
    });
    Object.defineProperty(window.navigator, "vendor", {
      value: "",
      configurable: true,
    });
    const { result } = renderHook(() => useBrowserType());
    expect(result.current.isChrome).toBe(false);
  });
});
