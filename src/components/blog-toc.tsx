'use client';

import { TextIcon } from 'lucide-react';
import type { TOCItemType } from 'fumadocs-core/toc';
import { TOCProvider, TOCScrollArea, useTOCItems } from 'fumadocs-ui/components/toc';
import { TOCEmpty, TOCItem, TOCItems } from 'fumadocs-ui/components/toc/clerk';

function TOCList() {
  const items = useTOCItems();
  return (
    <TOCItems>
      {items.length === 0 && <TOCEmpty />}
      {items.map((item) => (
        <TOCItem key={item.url} item={item} />
      ))}
    </TOCItems>
  );
}

export function BlogTOC({ toc }: { toc: TOCItemType[] }) {
  if (toc.length === 0) return null;

  return (
    <TOCProvider toc={toc}>
      <aside className="sticky top-20 hidden h-fit max-h-[calc(100vh-6rem)] w-64 shrink-0 flex-col gap-2 overflow-y-auto pb-8 xl:flex">
        <h3 className="inline-flex items-center gap-1.5 text-sm text-fd-muted-foreground">
          <TextIcon className="size-4" />
          On this page
        </h3>
        <TOCScrollArea className="ms-px">
          <TOCList />
        </TOCScrollArea>
      </aside>
    </TOCProvider>
  );
}
