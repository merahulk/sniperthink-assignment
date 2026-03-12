import { useState, useEffect, useRef } from 'react';

/**
 * useInView - returns true when the element enters the viewport.
 */
export function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (options.once) observer.unobserve(el);
        } else if (!options.once) {
          setInView(false);
        }
      },
      { threshold: options.threshold || 0.2, ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options.threshold, options.once]);

  return [ref, inView];
}

/**
 * useScrollProgress - returns 0–1 scroll progress through an element.
 */
export function useScrollProgress() {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;
      const total = rect.height - windowH;
      if (total <= 0) {
        setProgress(0);
        return;
      }
      const scrolled = Math.max(0, -rect.top);
      setProgress(Math.min(1, scrolled / total));
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return [ref, progress];
}

/**
 * useWindowScroll - returns raw scrollY
 */
export function useWindowScroll() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return scrollY;
}
