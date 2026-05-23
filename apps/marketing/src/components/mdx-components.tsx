import type { HTMLAttributes } from "react";

type AnchorProps = HTMLAttributes<HTMLAnchorElement> & { href?: string };
type HeadingProps = HTMLAttributes<HTMLHeadingElement>;

export const mdxComponents = {
  h2: ({ children, ...props }: HeadingProps) => (
    <h2
      {...props}
      className="mt-12 mb-4 text-2xl font-bold tracking-tight text-foreground border-l-[3px] border-dunlo pl-4"
    >
      {children}
    </h2>
  ),

  h3: ({ children, ...props }: HeadingProps) => (
    <h3
      {...props}
      className="mt-8 mb-3 text-xl font-semibold tracking-tight text-foreground"
    >
      {children}
    </h3>
  ),

  h4: ({ children, ...props }: HeadingProps) => (
    <h4
      {...props}
      className="mt-6 mb-2 text-base font-semibold uppercase tracking-widest text-dunlo-dim"
    >
      {children}
    </h4>
  ),

  pre: ({ children, ...props }: HTMLAttributes<HTMLPreElement>) => (
    <pre
      {...props}
      className="overflow-x-auto rounded-xl bg-zinc-900 p-5 font-mono text-sm text-zinc-100 my-6 border border-zinc-800"
    >
      {children}
    </pre>
  ),

  code: ({ children, ...props }: HTMLAttributes<HTMLElement>) => (
    <code
      {...props}
      className="rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.85em] text-zinc-800 border border-zinc-200"
    >
      {children}
    </code>
  ),

  a: ({ children, href, ...props }: AnchorProps) => (
    <a
      {...props}
      href={href}
      className="text-dunlo-dim underline underline-offset-2 decoration-dunlo/40 hover:decoration-dunlo-dim transition-colors duration-150"
    >
      {children}
    </a>
  ),

  blockquote: ({ children, ...props }: HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      {...props}
      className="my-6 border-l-[3px] border-dunlo/40 pl-5 text-muted-foreground italic bg-dunlo/5 py-3 pr-4 rounded-r-lg"
    >
      {children}
    </blockquote>
  ),

  hr: (props: HTMLAttributes<HTMLHRElement>) => (
    <hr {...props} className="my-10 border-border" />
  ),

  ul: ({ children, ...props }: HTMLAttributes<HTMLUListElement>) => (
    <ul {...props} className="my-4 space-y-1.5 pl-6 list-none">
      {children}
    </ul>
  ),

  li: ({ children, ...props }: HTMLAttributes<HTMLLIElement>) => (
    <li {...props} className="relative pl-5 before:absolute before:left-0 before:top-[0.6em] before:w-1.5 before:h-1.5 before:rounded-full before:bg-dunlo/60">
      {children}
    </li>
  ),

  strong: ({ children, ...props }: HTMLAttributes<HTMLElement>) => (
    <strong {...props} className="font-semibold text-foreground">
      {children}
    </strong>
  ),
};
