import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Type definitions
interface ScrollPosition {
    x: number;
    y: number;
}

interface ScrollDimensions {
    width: number;
    height: number;
    scrollWidth: number;
    scrollHeight: number;
}

interface ScrollState {
    x: number;
    y: number;
    lastX: number;
    lastY: number;
    directionX: 'left' | 'right' | null;
    directionY: 'up' | 'down' | null;
    isScrolling: boolean;
    progress: number;
    velocity: number;
}

interface ScrollToOptions {
    x?: number;
    y?: number;
    smooth?: boolean;
}

interface UseScrollOptions {
    debounce?: number;
    throttle?: number;
    threshold?: number;
    target?: HTMLElement | Window | null;
    immediate?: boolean;
    onScroll?: (state: ScrollState) => void;
    onScrollUp?: (state: ScrollState) => void;
    onScrollDown?: (state: ScrollState) => void;
    onThresholdReached?: (state: ScrollState) => void;
    passive?: boolean;
}

interface UseScrollReturn extends ScrollState {
    scrollTo: (options: ScrollToOptions) => void;
    scrollToTop: (smooth?: boolean) => void;
    scrollToBottom: (smooth?: boolean) => void;
    isAtTop: boolean;
    isAtBottom: boolean;
    dimensions: ScrollDimensions;
}

/**
 * Custom hook for handling scroll events with performance optimizations
 * @param {UseScrollOptions} options - Configuration options
 * @returns {UseScrollReturn} Scroll state and utility functions
 */
const useScroll = (options: UseScrollOptions = {}): UseScrollReturn => {
    const {
        debounce = 0,
        throttle = 0,
        threshold = 0,
        target = typeof window !== 'undefined' ? window : null,
        immediate = false,
        onScroll,
        onScrollUp,
        onScrollDown,
        onThresholdReached,
        passive = true,
    } = options;

    // State for scroll position and direction
    const [scrollState, setScrollState] = useState<ScrollState>({
        x: 0,
        y: 0,
        lastX: 0,
        lastY: 0,
        directionX: null,
        directionY: null,
        isScrolling: false,
        progress: 0,
        velocity: 0,
    });

    // Refs for performance optimization
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastScrollTimeRef = useRef<number>(Date.now());
    const ticking = useRef<boolean>(false);
    const thresholdReachedRef = useRef<boolean>(false);
    const scrollPositionRef = useRef<ScrollPosition>({ x: 0, y: 0 });

    // Get scroll position with cross-browser support
    const getScrollPosition = useCallback((): ScrollPosition => {
        if (!target) return { x: 0, y: 0 };

        if (target === window) {
            return {
                x: window.pageXOffset || document.documentElement.scrollLeft || 0,
                y: window.pageYOffset || document.documentElement.scrollTop || 0,
            };
        }

        const element = target as HTMLElement;
        return {
            x: element.scrollLeft || 0,
            y: element.scrollTop || 0,
        };
    }, [target]);

    // Get scroll dimensions
    const getScrollDimensions = useCallback((): ScrollDimensions => {
        if (!target) return { width: 0, height: 0, scrollWidth: 0, scrollHeight: 0 };

        if (target === window) {
            return {
                width: window.innerWidth,
                height: window.innerHeight,
                scrollWidth: document.documentElement.scrollWidth || document.body.scrollWidth,
                scrollHeight: document.documentElement.scrollHeight || document.body.scrollHeight,
            };
        }

        const element = target as HTMLElement;
        return {
            width: element.clientWidth,
            height: element.clientHeight,
            scrollWidth: element.scrollWidth,
            scrollHeight: element.scrollHeight,
        };
    }, [target]);

    // Calculate scroll progress (0-100)
    const calculateProgress = useCallback((position: number, dimension: number, scrollDimension: number): number => {
        const maxScroll = scrollDimension - dimension;
        if (maxScroll <= 0) return 0;
        return Math.min(100, Math.max(0, (position / maxScroll) * 100));
    }, []);

    // Calculate scroll velocity
    const calculateVelocity = useCallback((currentPos: number, lastPos: number, deltaTime: number): number => {
        if (deltaTime === 0) return 0;
        return Math.abs(currentPos - lastPos) / deltaTime;
    }, []);

    // Update scroll state with requestAnimationFrame for better performance
    const updateScrollState = useCallback(() => {
        if (!ticking.current) return;

        const position = getScrollPosition();
        const dimensions = getScrollDimensions();
        const currentTime = Date.now();
        const deltaTime = currentTime - lastScrollTimeRef.current;

        const newState: ScrollState = {
            x: position.x,
            y: position.y,
            lastX: scrollPositionRef.current.x,
            lastY: scrollPositionRef.current.y,
            directionX: position.x > scrollPositionRef.current.x ? 'right' : position.x < scrollPositionRef.current.x ? 'left' : null,
            directionY: position.y > scrollPositionRef.current.y ? 'down' : position.y < scrollPositionRef.current.y ? 'up' : null,
            isScrolling: true,
            progress: calculateProgress(position.y, dimensions.height, dimensions.scrollHeight),
            velocity: calculateVelocity(position.y, scrollPositionRef.current.y, deltaTime),
        };

        setScrollState(newState);
        scrollPositionRef.current = position;
        lastScrollTimeRef.current = currentTime;

        // Handle callbacks
        if (onScroll) {
            onScroll(newState);
        }

        if (onScrollUp && newState.directionY === 'up') {
            onScrollUp(newState);
        }

        if (onScrollDown && newState.directionY === 'down') {
            onScrollDown(newState);
        }

        if (onThresholdReached && threshold > 0) {
            const thresholdMet = position.y >= threshold;
            if (thresholdMet && !thresholdReachedRef.current) {
                thresholdReachedRef.current = true;
                onThresholdReached(newState);
            } else if (!thresholdMet && thresholdReachedRef.current) {
                thresholdReachedRef.current = false;
            }
        }

        ticking.current = false;
    }, [
        getScrollPosition,
        getScrollDimensions,
        calculateProgress,
        calculateVelocity,
        onScroll,
        onScrollUp,
        onScrollDown,
        onThresholdReached,
        threshold,
    ]);

    // Debounced scroll handler
    const debouncedScrollHandler = useCallback(() => {
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        scrollTimeoutRef.current = setTimeout(() => {
            setScrollState((prev) => ({ ...prev, isScrolling: false }));
        }, debounce || 150);
    }, [debounce]);

    // Main scroll handler with throttling and RAF
    const handleScroll = useCallback(() => {
        if (!ticking.current) {
            requestAnimationFrame(updateScrollState);
            ticking.current = true;
        }

        debouncedScrollHandler();
    }, [updateScrollState, debouncedScrollHandler]);

    // Throttled scroll handler
    const throttledScrollHandler = useMemo(() => {
        if (throttle <= 0) return handleScroll;

        let lastCall = 0;
        return () => {
            const now = Date.now();
            if (now - lastCall >= throttle) {
                lastCall = now;
                handleScroll();
            }
        };
    }, [throttle, handleScroll]);

    // Utility functions
    const scrollTo = useCallback(
        (options: ScrollToOptions) => {
            const { x = 0, y = 0, smooth = true } = options;

            if (target === window) {
                window.scrollTo({
                    left: x,
                    top: y,
                    behavior: smooth ? 'smooth' : 'auto',
                });
            } else if (target) {
                const element = target as HTMLElement;
                if (smooth && element.scrollTo) {
                    element.scrollTo({
                        left: x,
                        top: y,
                        behavior: 'smooth',
                    });
                } else {
                    element.scrollLeft = x;
                    element.scrollTop = y;
                }
            }
        },
        [target],
    );

    const scrollToTop = useCallback(
        (smooth: boolean = true) => {
            scrollTo({ y: 0, smooth });
        },
        [scrollTo],
    );

    const scrollToBottom = useCallback(
        (smooth: boolean = true) => {
            const dimensions = getScrollDimensions();
            scrollTo({ y: dimensions.scrollHeight, smooth });
        },
        [scrollTo, getScrollDimensions],
    );

    // Initialize and cleanup
    useEffect(() => {
        if (!target) return;

        const scrollHandler = throttle > 0 ? throttledScrollHandler : handleScroll;

        // Set initial scroll position
        if (immediate) {
            handleScroll();
        }

        // Add event listener with passive option for better performance
        const eventOptions: AddEventListenerOptions = { passive };
        target.addEventListener('scroll', scrollHandler, eventOptions);

        // Store refs in local variables for cleanup
        const currentScrollTimeout = scrollTimeoutRef.current;
        const currentThrottleTimeout = throttleTimeoutRef.current;

        return () => {
            target.removeEventListener('scroll', scrollHandler, eventOptions);
            if (currentScrollTimeout) {
                clearTimeout(currentScrollTimeout);
            }
            if (currentThrottleTimeout) {
                clearTimeout(currentThrottleTimeout);
            }
        };
    }, [target, throttledScrollHandler, handleScroll, immediate, passive, throttle]);

    return {
        ...scrollState,
        scrollTo,
        scrollToTop,
        scrollToBottom,
        isAtTop: scrollState.y === 0,
        isAtBottom: scrollState.progress >= 99.9,
        dimensions: useMemo(() => getScrollDimensions(), [getScrollDimensions]),
    };
};

export default useScroll;
export type { ScrollDimensions, ScrollPosition, ScrollState, ScrollToOptions, UseScrollOptions, UseScrollReturn };
