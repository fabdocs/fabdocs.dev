'use client';

import { type ComponentProps, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';
import { cn } from '@/lib/cn';
import { useAISearchContextOptional } from '@/components/ai/search';

/**
 * Drop-in replacement for the default MDX `pre`: the standard Fumadocs code
 * block plus an "Ask AI" action that opens the chat panel pre-seeded with the
 * snippet. Each use spends one question against the daily limit (same pool as
 * the free-form chat) — that's intentional pressure toward Pro.
 */
export function AICodeBlock(props: ComponentProps<'pre'>) {
  const figureRef = useRef<HTMLElement>(null);
  const ai = useAISearchContextOptional();

  return (
    <CodeBlock
      {...props}
      ref={figureRef}
      Actions={({ className, children }) => (
        <div className={cn('flex items-center gap-1 empty:hidden', className)}>
          {children}
          {ai ? (
            <button
              type="button"
              aria-label="Ask AI about this code"
              title="Ask AI about this code"
              className="rounded-md p-1.5 transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground [&_svg]:size-3.5 [&_svg]:text-fd-primary"
              onClick={() => {
                const code = figureRef.current?.querySelector('pre')?.textContent?.trim() ?? '';
                if (!code) return;
                const pageTitle =
                  document.querySelector('main h1')?.textContent?.trim() ?? 'this page';

                ai.setOpen(true);
                void ai.chat.sendMessage({
                  role: 'user',
                  parts: [
                    { type: 'data-client', data: { location: location.href } },
                    {
                      type: 'text',
                      text: `Explain this code from the fabdocs.dev page "${pageTitle}". Say what it does, when to use it, and flag any CU-cost or correctness gotchas.\n\n\`\`\`\n${code}\n\`\`\``,
                    },
                  ],
                });
              }}
            >
              <Sparkles />
            </button>
          ) : null}
        </div>
      )}
    >
      <Pre>{props.children}</Pre>
    </CodeBlock>
  );
}
