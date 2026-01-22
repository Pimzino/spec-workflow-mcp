import { useRef, useCallback, useEffect } from 'react';

export interface ScrollSyncOptions {
  enabled?: boolean;
  throttleMs?: number;
}

export interface ScrollSyncRefs {
  leftRef: React.RefObject<HTMLDivElement>;
  rightRef: React.RefObject<HTMLDivElement>;
}

export interface ScrollSyncHandlers {
  handleLeftScroll: () => void;
  handleRightScroll: () => void;
}

/**
 * Custom hook for bidirectional scroll synchronization between two panels.
 * Uses proportional scroll sync based on scroll percentage.
 */
export function useScrollSync(
  options: ScrollSyncOptions = {}
): ScrollSyncRefs & ScrollSyncHandlers & { isEnabled: boolean } {
  const { enabled = true, throttleMs = 16 } = options; // ~60fps default

  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef<'left' | 'right' | null>(null);
  const scrollTimeoutRef = useRef<number | null>(null);
  const lastScrollTimeRef = useRef<number>(0);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const syncScroll = useCallback((source: HTMLDivElement, target: HTMLDivElement) => {
    if (!enabled) return;

    const sourceScrollHeight = source.scrollHeight - source.clientHeight;
    const targetScrollHeight = target.scrollHeight - target.clientHeight;

    // Avoid division by zero
    if (sourceScrollHeight <= 0 || targetScrollHeight <= 0) return;

    // Calculate scroll percentage and apply to target
    const scrollPercentage = source.scrollTop / sourceScrollHeight;
    target.scrollTop = scrollPercentage * targetScrollHeight;
  }, [enabled]);

  const handleLeftScroll = useCallback(() => {
    if (!enabled) return;

    const now = Date.now();

    // Prevent scroll loop - if right panel initiated scroll, ignore left scroll events
    if (isScrollingRef.current === 'right') return;

    // Throttle scroll events
    if (now - lastScrollTimeRef.current < throttleMs) return;
    lastScrollTimeRef.current = now;

    isScrollingRef.current = 'left';

    if (leftRef.current && rightRef.current) {
      syncScroll(leftRef.current, rightRef.current);
    }

    // Clear the scrolling source after a short delay
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = window.setTimeout(() => {
      isScrollingRef.current = null;
    }, 100);
  }, [enabled, throttleMs, syncScroll]);

  const handleRightScroll = useCallback(() => {
    if (!enabled) return;

    const now = Date.now();

    // Prevent scroll loop - if left panel initiated scroll, ignore right scroll events
    if (isScrollingRef.current === 'left') return;

    // Throttle scroll events
    if (now - lastScrollTimeRef.current < throttleMs) return;
    lastScrollTimeRef.current = now;

    isScrollingRef.current = 'right';

    if (leftRef.current && rightRef.current) {
      syncScroll(rightRef.current, leftRef.current);
    }

    // Clear the scrolling source after a short delay
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = window.setTimeout(() => {
      isScrollingRef.current = null;
    }, 100);
  }, [enabled, throttleMs, syncScroll]);

  return {
    leftRef,
    rightRef,
    handleLeftScroll,
    handleRightScroll,
    isEnabled: enabled,
  };
}
