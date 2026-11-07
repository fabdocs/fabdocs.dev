'use client';

import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import {
  ArrowRight,
  BookOpen,
  Calculator,
  ChevronDown,
  Gauge,
  GitCompare,
  History,
  Layers,
  Terminal,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/cn';

// Two independent dropdowns on the desktop nav — Tools (surfaces the 5
// interactive calculators/references under /docs/tools, which otherwise sit
// a couple of clicks deep) and More (Compare, Changelog, and Glossary on
// non-docs pages — pages with no top-nav presence at all today).
//
// The trigger's on-screen position differs a lot between the home layout
// (Tools sits right after the logo) and the docs/Notebook layout (it sits
// after a search bar and the Glossary link, much further right) — opening
// the panel flush-left under the trigger overflows off the right edge of
// the viewport on the docs layout. `useClampedOffset` measures the trigger
// once on mount (and on resize) and translates the panel just enough to
// keep it on screen.
//
// This is deliberately NOT tied to open/close state. An earlier version
// made the Root a controlled component (owning `value` itself) purely to
// know when to re-measure on open — that fought Radix's own internal
// open/close state machine for no real benefit (the trigger's position
// doesn't move when the panel opens) and caused the panel to intermittently
// start closing itself almost immediately after opening. The trigger's
// position is static apart from a window resize, so there's no need to
// recompute on every open at all.

const EDGE = 16;

function useClampedOffset(widthPx: number) {
  const anchorRef = useRef<HTMLLIElement>(null);
  const [offset, setOffset] = useState(0);

  useLayoutEffect(() => {
    function recompute() {
      if (!anchorRef.current) return;
      const triggerLeft = anchorRef.current.getBoundingClientRect().left;
      const panelWidth = Math.min(widthPx, window.innerWidth - EDGE * 2);
      const clamped = Math.max(EDGE, Math.min(triggerLeft, window.innerWidth - panelWidth - EDGE));
      setOffset(clamped - triggerLeft);
    }
    recompute();
    window.addEventListener('resize', recompute);
    return () => window.removeEventListener('resize', recompute);
  }, [widthPx]);

  return { anchorRef, offset };
}

const triggerClass =
  'group inline-flex items-center gap-1 rounded-md p-2 text-sm text-fd-muted-foreground outline-none transition-colors hover:text-fd-accent-foreground focus-visible:ring-2 focus-visible:ring-fd-ring data-[state=open]:text-fd-accent-foreground';

const headingClass =
  'mb-2 px-2.5 font-mono text-[0.68rem] tracking-[0.14em] text-fd-muted-foreground/80 uppercase';

// A fixed width matching the panel's own Content exactly, not Radix's
// measured `--radix-navigation-menu-viewport-width` var. That var tracks
// this same element's own rendered size on every open, including whatever
// residual scale the open/close keyframe animation has applied at the
// moment Radix's ResizeObserver fires — each reopen measured a slightly
// smaller box than the last and fed it back in as the new target width, so
// the panel visibly shrank a little more on every single open until it
// collapsed to nothing. A static width sidesteps that feedback loop
// entirely; height is left to size naturally to its content.
const viewportClass =
  'nav-menu-viewport absolute left-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-fd-border bg-fd-popover text-fd-popover-foreground shadow-2xl shadow-black/20';

interface NavLinkInfo {
  href: string;
  title: string;
  icon: LucideIcon;
}

const CALCULATORS: NavLinkInfo[] = [
  { href: '/docs/tools/cu-cost-calculator', title: 'CU cost & capacity calculator', icon: Calculator },
  { href: '/docs/tools/spark-pool-sizer', title: 'Spark pool sizing estimator', icon: Gauge },
  { href: '/docs/tools/direct-lake-advisor', title: 'Direct Lake vs Import advisor', icon: Workflow },
];

const REFERENCE: NavLinkInfo[] = [
  { href: '/docs/tools/capacity-sku-reference', title: 'Capacity SKU reference', icon: Layers },
  { href: '/docs/tools/vscode-sync', title: 'VS Code sync & extension guide', icon: Terminal },
];

const MORE_LINKS_BASE: NavLinkInfo[] = [
  { href: '/compare', title: 'Compare', icon: GitCompare },
  { href: '/changelog', title: 'Changelog', icon: History },
];

const GLOSSARY_LINK: NavLinkInfo = { href: '/glossary', title: 'Glossary', icon: BookOpen };

function MenuLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <NavigationMenu.Link asChild>
      <Link href={href} className={cn('outline-none focus-visible:ring-2 focus-visible:ring-fd-ring', className)}>
        {children}
      </Link>
    </NavigationMenu.Link>
  );
}

function ItemLink({ item }: { item: NavLinkInfo }) {
  return (
    <li>
      <MenuLink
        href={item.href}
        className="group/item flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-fd-foreground transition-colors hover:bg-fd-accent"
      >
        <item.icon className="size-4 shrink-0 text-fd-muted-foreground transition-colors group-hover/item:text-fd-primary" />
        {item.title}
      </MenuLink>
    </li>
  );
}

function Trigger({ children, active }: { children: ReactNode; active?: boolean }) {
  return (
    <NavigationMenu.Trigger className={cn(triggerClass, active && 'text-fd-primary')}>
      {children}
      <ChevronDown
        aria-hidden
        className="size-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180"
      />
    </NavigationMenu.Trigger>
  );
}

const TOOLS_WIDTH = 608; // 38rem

export function ToolsMenu() {
  const pathname = usePathname();
  const active = pathname.startsWith('/docs/tools');
  const { anchorRef, offset } = useClampedOffset(TOOLS_WIDTH);

  return (
    <li ref={anchorRef} className="relative list-none">
      <NavigationMenu.Root delayDuration={80} skipDelayDuration={300}>
        <NavigationMenu.List>
          <NavigationMenu.Item>
            <Trigger active={active}>Tools</Trigger>
            <NavigationMenu.Content>
              <div className="grid w-[min(38rem,calc(100vw-2rem))] grid-cols-1 sm:grid-cols-2">
                <div className="p-4">
                  <p className={headingClass}>Calculators</p>
                  <ul className="flex flex-col gap-0.5">
                    {CALCULATORS.map((item) => (
                      <ItemLink key={item.href} item={item} />
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col items-start gap-1 border-fd-border p-4 max-sm:col-span-full max-sm:border-t sm:border-l">
                  <p className={headingClass}>Reference</p>
                  <ul className="flex w-full flex-col gap-0.5">
                    {REFERENCE.map((item) => (
                      <ItemLink key={item.href} item={item} />
                    ))}
                  </ul>
                  <MenuLink
                    href="/docs/tools"
                    className="mt-2 inline-flex items-center gap-1.5 rounded-md px-1 py-1 text-sm font-medium text-fd-muted-foreground transition-colors hover:text-fd-primary"
                  >
                    All tools
                    <ArrowRight className="size-3.5" />
                  </MenuLink>
                </div>
              </div>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>
        <NavigationMenu.Viewport
          className={cn(viewportClass, 'w-[min(38rem,calc(100vw-2rem))]')}
          style={{ left: offset }}
        />
      </NavigationMenu.Root>
    </li>
  );
}

const MORE_WIDTH = 224; // 14rem

export function MoreMenu({ showGlossary }: { showGlossary: boolean }) {
  const links = showGlossary ? [...MORE_LINKS_BASE, GLOSSARY_LINK] : MORE_LINKS_BASE;
  const { anchorRef, offset } = useClampedOffset(MORE_WIDTH);

  return (
    <li ref={anchorRef} className="relative list-none">
      <NavigationMenu.Root delayDuration={80} skipDelayDuration={300}>
        <NavigationMenu.List>
          <NavigationMenu.Item>
            <Trigger>More</Trigger>
            <NavigationMenu.Content>
              <div className="w-56 p-4">
                <p className={headingClass}>More</p>
                <ul className="flex flex-col gap-0.5">
                  {links.map((item) => (
                    <ItemLink key={item.href} item={item} />
                  ))}
                </ul>
              </div>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>
        <NavigationMenu.Viewport className={cn(viewportClass, 'w-56')} style={{ left: offset }} />
      </NavigationMenu.Root>
    </li>
  );
}
