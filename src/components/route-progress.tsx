'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function isInternalNavigation(anchor: HTMLAnchorElement): boolean {
  if (anchor.target && anchor.target !== '_self') return false;
  if (anchor.hasAttribute('download')) return false;
  if (anchor.origin !== window.location.origin) return false;
  if (anchor.href.split('#')[0] === window.location.href.split('#')[0]) return false;
  return true;
}

/** Slim progress bar above the navbar during client-side route transitions. */
export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const loadingRef = useRef(false);
  const trickleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const start = () => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      setVisible(true);
      setProgress(12);
      trickleRef.current = setInterval(() => {
        setProgress((p) => (p >= 90 ? p : p + (90 - p) * 0.1));
      }, 200);
    };

    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = e.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest('a');
      if (!anchor) return;
      if (!isInternalNavigation(anchor)) return;
      start();
    };

    document.addEventListener('click', onClick);
    window.addEventListener('popstate', start);
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('popstate', start);
      if (trickleRef.current) clearInterval(trickleRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!loadingRef.current) return;
    loadingRef.current = false;
    if (trickleRef.current) clearInterval(trickleRef.current);
    setProgress(100);
    hideTimeoutRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 250);
    // Route change (pathname/search) is what marks a navigation as finished.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2.5px]">
      <div
        className="h-full bg-fd-primary shadow-[0_0_8px_var(--color-fd-primary)] transition-[width,opacity] duration-200 ease-out motion-reduce:transition-none"
        style={{ width: `${progress}%`, opacity: visible ? 1 : 0 }}
      />
    </div>
  );
}
