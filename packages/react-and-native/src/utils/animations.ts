// ==========================================
// Animation Utilities for Content Rendering
// React hooks for smooth UI animations using
// requestAnimationFrame and CSS transitions.
// ==========================================

import { useEffect, useRef, useState, useCallback } from 'react';

// ------------------------------------------
// Types
// ------------------------------------------

export type EasingFunction =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'cubic-bezier';

// ------------------------------------------
// useFadeIn
// ------------------------------------------

/**
 * Hook that fades in an element when it mounts.
 *
 * @param duration - Fade duration in ms (default 300)
 * @param delay - Delay before fade starts in ms (default 0)
 */
export function useFadeIn(
  duration: number = 300,
  delay: number = 0
): {
  ref: React.RefObject<HTMLDivElement>;
  style: React.CSSProperties;
  isVisible: boolean;
} {
  const ref = useRef<HTMLDivElement>(null!);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const style: React.CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transition: `opacity ${duration}ms ease-out`,
    willChange: 'opacity',
  };

  return { ref, style, isVisible };
}

// ------------------------------------------
// useSlideIn
// ------------------------------------------

/**
 * Hook that slides an element in from a given direction when it mounts.
 *
 * @param direction - Slide direction (default 'up')
 * @param distance - Slide distance in px (default 20)
 * @param duration - Animation duration in ms (default 400)
 */
export function useSlideIn(
  direction: 'up' | 'down' | 'left' | 'right' = 'up',
  distance: number = 20,
  duration: number = 400
): {
  ref: React.RefObject<HTMLDivElement>;
  style: React.CSSProperties;
  isVisible: boolean;
} {
  const ref = useRef<HTMLDivElement>(null!);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger slide-in after mount
    const raf = requestAnimationFrame(() => {
      setIsVisible(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const translateMap: Record<string, string> = {
    up: `translateY(${distance}px)`,
    down: `translateY(-${distance}px)`,
    left: `translateX(${distance}px)`,
    right: `translateX(-${distance}px)`,
  };

  const style: React.CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translate(0, 0)' : translateMap[direction],
    transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
    willChange: 'opacity, transform',
  };

  return { ref, style, isVisible };
}

// ------------------------------------------
// useCollapseAnimation
// ------------------------------------------

/**
 * Hook for animated collapsible sections with a chevron indicator.
 *
 * @param initialOpen - Whether the section starts open (default false)
 * @param duration - Collapse/expand duration in ms (default 250)
 */
export function useCollapseAnimation(
  initialOpen: boolean = false,
  duration: number = 250
): {
  isOpen: boolean;
  toggle: () => void;
  containerStyle: React.CSSProperties;
  contentStyle: React.CSSProperties;
  chevronStyle: React.CSSProperties;
} {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [contentHeight, setContentHeight] = useState<number | 'auto'>(
    initialOpen ? 'auto' : 0
  );
  const contentRef = useRef<HTMLDivElement>(null);

  const toggle = useCallback(() => {
    if (isOpen) {
      // Collapsing: set explicit height first, then animate to 0
      if (contentRef.current) {
        const height = contentRef.current.scrollHeight;
        contentRef.current.style.height = `${height}px`;
        // Force reflow
        void contentRef.current.offsetHeight;
      }
      setContentHeight(0);
    } else {
      // Expanding
      if (contentRef.current) {
        const height = contentRef.current.scrollHeight;
        setContentHeight(height);
        // After transition, set to auto for dynamic content
        const timer = setTimeout(() => {
          setContentHeight('auto');
        }, duration);
        return () => clearTimeout(timer);
      }
      setContentHeight('auto');
    }
    setIsOpen((prev) => !prev);
  }, [isOpen, duration]);

  const containerStyle: React.CSSProperties = {
    overflow: 'hidden',
    height: typeof contentHeight === 'number' ? `${contentHeight}px` : contentHeight,
    transition: `height ${duration}ms ease-in-out`,
    willChange: 'height',
  };

  const contentStyle: React.CSSProperties = {};

  const chevronStyle: React.CSSProperties = {
    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    transition: `transform ${duration}ms ease-in-out`,
    display: 'inline-block',
  };

  return {
    isOpen,
    toggle,
    containerStyle,
    contentStyle,
    chevronStyle,
  };
}

// ------------------------------------------
// useThemeTransition
// ------------------------------------------

/**
 * Hook that applies a smooth crossfade when transitioning between themes.
 *
 * @param prevTheme - Previous theme name (for tracking changes)
 * @param nextTheme - Next theme name (for tracking changes)
 * @param duration - Transition duration in ms (default 300)
 */
export function useThemeTransition(
  prevTheme: string = '',
  nextTheme: string = '',
  duration: number = 300
): {
  style: React.CSSProperties;
  isTransitioning: boolean;
} {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (prevTheme && nextTheme && prevTheme !== nextTheme) {
      // Fade out
      setOpacity(0);
      setIsTransitioning(true);

      const halfDuration = duration / 2;

      // Fade in after half duration (when theme has been applied)
      const fadeInTimer = setTimeout(() => {
        setOpacity(1);
      }, halfDuration);

      // Mark transition complete
      const doneTimer = setTimeout(() => {
        setIsTransitioning(false);
      }, duration);

      return () => {
        clearTimeout(fadeInTimer);
        clearTimeout(doneTimer);
      };
    }
  }, [prevTheme, nextTheme, duration]);

  const style: React.CSSProperties = {
    opacity,
    transition: `opacity ${duration / 2}ms ease-in-out`,
  };

  return { style, isTransitioning };
}

// ------------------------------------------
// useScrollAnimation
// ------------------------------------------

/**
 * Hook that detects scroll position and applies styles when scrolled past a threshold.
 *
 * @param offset - Scroll offset in px to trigger the scrolled state (default 10)
 */
export function useScrollAnimation(
  offset: number = 10
): {
  style: React.CSSProperties;
  isScrolled: boolean;
} {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > offset);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [offset]);

  const style: React.CSSProperties = {
    transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
    ...(isScrolled
      ? {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        }
      : {}),
  };

  return { style, isScrolled };
}

// ------------------------------------------
// useTypewriter
// ------------------------------------------

/**
 * Hook that reveals text character-by-character with a typewriter effect.
 *
 * @param text - The full text to reveal
 * @param speed - Milliseconds between each character (default 50)
 * @param delay - Delay before typing starts in ms (default 0)
 */
export function useTypewriter(
  text: string,
  speed: number = 50,
  delay: number = 0
): {
  displayText: string;
  isComplete: boolean;
  reset: () => void;
} {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const textRef = useRef(text);
  const speedRef = useRef(speed);

  // Keep refs in sync
  textRef.current = text;
  speedRef.current = speed;

  const reset = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
    }
    indexRef.current = 0;
    setDisplayText('');
    setIsComplete(false);
  }, []);

  useEffect(() => {
    if (!text) {
      setDisplayText('');
      setIsComplete(true);
      return;
    }

    reset();

    const startDelay = setTimeout(() => {
      lastTimeRef.current = performance.now();

      const step = (now: number) => {
        const elapsed = now - lastTimeRef.current;

        if (elapsed >= speedRef.current) {
          const charsToAdd = Math.floor(elapsed / speedRef.current);
          const newIndex = Math.min(indexRef.current + charsToAdd, textRef.current.length);
          indexRef.current = newIndex;
          setDisplayText(textRef.current.slice(0, newIndex));
          lastTimeRef.current = now;

          if (newIndex >= textRef.current.length) {
            setIsComplete(true);
            return;
          }
        }

        animFrameRef.current = requestAnimationFrame(step);
      };

      animFrameRef.current = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(startDelay);
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [text, speed, delay, reset]);

  return { displayText, isComplete, reset };
}

// ------------------------------------------
// animateNumber
// ------------------------------------------

/**
 * Animate a number from one value to another using requestAnimationFrame.
 *
 * @param from - Starting value
 * @param to - Target value
 * @param duration - Animation duration in ms (default 500)
 * @param easing - CSS easing name (default 'ease-out')
 */
export function animateNumber(
  from: number,
  to: number,
  duration: number = 500,
  easing: EasingFunction = 'ease-out'
): {
  value: number;
  isAnimating: boolean;
} {
  const [value, setValue] = useState(from);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);

    const startTime = performance.now();
    const diff = to - from;

    const easingFunctions: Record<string, (t: number) => number> = {
      'linear': (t) => t,
      'ease': (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
      'ease-in': (t) => t * t * t,
      'ease-out': (t) => 1 - Math.pow(1 - t, 3),
      'ease-in-out': (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
      'cubic-bezier': (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    };

    const easeFn = easingFunctions[easing] || easingFunctions['ease-out'];

    let raf: number;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeFn(progress);

      setValue(from + diff * easedProgress);

      if (progress < 1) {
        raf = requestAnimationFrame(step);
      } else {
        setValue(to);
        setIsAnimating(false);
      }
    };

    raf = requestAnimationFrame(step);

    return () => cancelAnimationFrame(raf);
  }, [from, to, duration, easing]);

  return { value, isAnimating };
}

// ------------------------------------------
// createStaggerAnimation
// ------------------------------------------

/**
 * Create staggered animation delays for a list of items.
 *
 * @param count - Number of items
 * @param staggerDelay - Delay between each item in ms (default 50)
 */
export function createStaggerAnimation(
  count: number,
  staggerDelay: number = 50
): {
  getItemDelay: (index: number) => number;
  containerStyle: React.CSSProperties;
} {
  const getItemDelay = useCallback(
    (index: number): number => {
      return index * staggerDelay;
    },
    [staggerDelay]
  );

  const containerStyle: React.CSSProperties = {
    // The container itself has no special styling;
    // individual items should use getItemDelay to set their own animation-delay.
  };

  return { getItemDelay, containerStyle };
}

// ------------------------------------------
// getTransitionCSS
// ------------------------------------------

/**
 * Build CSS transition utilities for animating between two style states.
 *
 * @param from - Initial CSS property values
 * @param to - Target CSS property values
 * @param duration - Transition duration in ms (default 300)
 * @param easing - CSS easing function name (default 'ease')
 */
export function getTransitionCSS(
  from: Record<string, string>,
  to: Record<string, string>,
  duration: number = 300,
  easing: string = 'ease'
): {
  transition: string;
  initial: Record<string, string>;
  final: Record<string, string>;
} {
  // Build a combined transition string for all changed properties
  const properties = Object.keys(from);
  const transitions = properties.map((prop) => `${prop} ${duration}ms ${easing}`);
  const transition = transitions.join(', ');

  return {
    transition,
    initial: { ...from },
    final: { ...to },
  };
}

// ------------------------------------------
// Utility: Easing function resolver
// ------------------------------------------

/**
 * Get a cubic-bezier compatible easing function for use with requestAnimationFrame.
 *
 * @param easing - Named easing function
 * @returns A function that maps progress [0, 1] to eased value [0, 1]
 */
export function getEasingFunction(
  easing: EasingFunction
): (t: number) => number {
  const easings: Record<string, (t: number) => number> = {
    linear: (t) => t,
    ease: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    'ease-in': (t) => t * t * t,
    'ease-out': (t) => 1 - Math.pow(1 - t, 3),
    'ease-in-out': (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    'cubic-bezier': (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  };

  return easings[easing] || easings.ease;
}
