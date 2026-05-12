import type { HTMLAttributes } from 'react';

type AnchorProps = HTMLAttributes<HTMLAnchorElement> & { href?: string };

export const mdxComponents = {
  pre: ({ children, ...props }: HTMLAttributes<HTMLPreElement>) => (
    <pre
      {...props}
      className="overflow-x-auto rounded-xl bg-gray-900 p-4 font-mono text-sm text-gray-100"
    >
      {children}
    </pre>
  ),
  code: ({ children, ...props }: HTMLAttributes<HTMLElement>) => (
    <code
      {...props}
      className="rounded bg-gray-100 px-1 py-0.5 font-mono text-sm text-gray-800"
    >
      {children}
    </code>
  ),
  a: ({ children, href, ...props }: AnchorProps) => (
    <a
      {...props}
      href={href}
      className="text-dunlo-dim underline underline-offset-2 hover:text-dunlo transition-colors"
    >
      {children}
    </a>
  ),
  blockquote: ({ children, ...props }: HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      {...props}
      className="border-l-4 border-dunlo/30 pl-4 italic text-gray-600"
    >
      {children}
    </blockquote>
  ),
};
