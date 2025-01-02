import useCopyToClipboard from '@/hooks/use-clipboard';
import { act, renderHook } from '@testing-library/react-hooks';
import {
  afterEach,
  describe,
  expect,
  it,
  vi
  } from 'vitest';
import { showErrorToast, showSuccessToast } from '@/utils';

vi.mock("@/utils", () => ({
  showErrorToast: vi.fn(),
  showSuccessToast: vi.fn(),
}));

Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

describe("useCopyToClipboard", () => {
  vi.useFakeTimers();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should copy text to clipboard and show success toast", async () => {
    const { result } = renderHook(() => useCopyToClipboard());
    const textToCopy = "Hello, World!";

    await act(async () => {
      await result.current.copyToClipboard(textToCopy);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(textToCopy);
    expect(result.current.isCopied).toBe(true);
    expect(showSuccessToast).toHaveBeenCalledWith("Copied to clipboard!");

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.isCopied).toBe(false);
  });

  it("should show error toast when copy fails", async () => {
    const { result } = renderHook(() => useCopyToClipboard());
    const textToCopy = "Hello, World!";
    const errorMessage = "Failed to copy!";
    navigator.clipboard.writeText.mockRejectedValueOnce(
      new Error("Copy failed"),
    );
    await act(async () => {
      await result.current.copyToClipboard(textToCopy);
    });
    expect(showErrorToast).toHaveBeenCalledWith(undefined, errorMessage);
  });
});
