import { useEffect, useRef, useState } from 'react';

interface useRevealOnScrollOptions extends IntersectionObserverInit {
  once?: boolean;
}

export function useRevealOnScroll<T extends HTMLElement>(options: useRevealOnScrollOptions = {}) {
  const { once = true, threshold = 0.15, rootMargin = '0px', root = null } = options;

  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin, root }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold, rootMargin, root]);

  return { ref, isVisible };
}
