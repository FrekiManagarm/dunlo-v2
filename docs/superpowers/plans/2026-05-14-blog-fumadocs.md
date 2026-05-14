# Blog Marketing Fumadocs — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a marketing blog at `/blog` and `/blog/$slug` using Fumadocs MDX as the content pipeline and a fully custom Tailwind UI.

**Architecture:** Fumadocs-mdx Vite plugin processes `.mdx` files in `content/blog/` at build time and generates a typed `.source/server.ts` collection. `lib/blog.ts` wraps the fumadocs-core loader to expose `getAllPosts()` and `getPost(slug)`. Two TanStack Start routes render the list and individual posts with custom Tailwind layouts; the MDX body component is consumed directly in the React component (not serialized through the loader).

**Tech Stack:** `fumadocs-mdx@15`, `fumadocs-core@16`, `@tailwindcss/typography`, TanStack Start file-based routing, Tailwind CSS v4, Zod.

---

## File Map

**New files:**
- `apps/web/source.config.ts` — Fumadocs blog collection definition (Zod schema for frontmatter)
- `apps/web/content/blog/5-raisons-echec-paiement-stripe.mdx` — Article exemple 1
- `apps/web/content/blog/guide-dunning-saas.mdx` — Article exemple 2
- `apps/web/src/lib/blog.ts` — `getAllPosts()` and `getPost(slug)` helpers
- `apps/web/src/routes/blog.tsx` — `/blog` list page
- `apps/web/src/routes/blog.$slug.tsx` — `/blog/$slug` article page

**Modified files:**
- `apps/web/vite.config.ts` — Add fumadocs-mdx Vite plugin
- `packages/ui/src/styles/globals.css` — Add `@plugin "@tailwindcss/typography"`
- `apps/web/package.json` — Add `@tailwindcss/typography` dependency

---

## Task 1: Install @tailwindcss/typography

**Files:**
- Modify: `apps/web/package.json`
- Modify: `packages/ui/src/styles/globals.css`

- [ ] **Step 1: Install the package**

```bash
bun add @tailwindcss/typography --cwd apps/web
```

Expected: package appears in `apps/web/package.json` dependencies.

- [ ] **Step 2: Register the plugin in globals.css**

In `packages/ui/src/styles/globals.css`, add after the last `@import` line (after `@import "shadcn/tailwind.css"`):

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@plugin "@tailwindcss/typography";
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/package.json packages/ui/src/styles/globals.css
git commit -m "feat(blog): add @tailwindcss/typography"
```

---

## Task 2: Create source.config.ts (Fumadocs collection)

**Files:**
- Create: `apps/web/source.config.ts`

- [ ] **Step 1: Create the file**

```typescript
// apps/web/source.config.ts
import { defineCollections } from "fumadocs-mdx/config";
import { z } from "zod";

export const blog = defineCollections({
  type: "doc",
  dir: "./content/blog",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    published: z.boolean().default(true),
    tags: z.array(z.string()).default([]),
    keywords: z.array(z.string()).default([]),
  }),
});
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/source.config.ts
git commit -m "feat(blog): add fumadocs source.config with blog collection"
```

---

## Task 3: Add fumadocs-mdx Vite plugin

**Files:**
- Modify: `apps/web/vite.config.ts`

- [ ] **Step 1: Update vite.config.ts**

Replace the entire file content with:

```typescript
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";
import mdx from "fumadocs-mdx/vite";
import * as MdxConfig from "./source.config.js";

export default defineConfig({
  server: {
    port: 3001,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    mdx(MdxConfig),
    tailwindcss(),
    nitro(),
    tanstackStart({
      nitro: {
        plugins: ["./server/plugins/email-scheduler.ts"],
        ...(process.env.VERCEL && { preset: "vercel" }),
      },
    }),
    viteReact(),
  ],
});
```

Note: `mdx(MdxConfig)` must be listed **before** the other plugins.

- [ ] **Step 2: Commit**

```bash
git add apps/web/vite.config.ts
git commit -m "feat(blog): add fumadocs-mdx vite plugin"
```

---

## Task 4: Create sample MDX articles

**Files:**
- Create: `apps/web/content/blog/5-raisons-echec-paiement-stripe.mdx`
- Create: `apps/web/content/blog/guide-dunning-saas.mdx`

- [ ] **Step 1: Create article 1**

```mdx
---
title: "5 raisons pour lesquelles vos paiements Stripe échouent"
description: "Comprendre les causes fréquentes d'échec de paiements Stripe pour mieux les anticiper et les récupérer automatiquement."
date: "2026-05-10"
published: true
tags: ["stripe", "paiements", "guide"]
keywords: ["stripe échec paiement", "failed payment stripe", "card declined"]
---

## Pourquoi les paiements échouent

Les paiements Stripe peuvent échouer pour de nombreuses raisons, souvent indépendantes de votre produit. Identifier la cause est la première étape pour récupérer ces revenus perdus.

## 1. Carte expirée

La raison la plus courante. Le client a changé de carte bancaire sans mettre à jour ses informations de facturation. Stripe renvoie le code `card_expired`.

**Comment récupérer :** Envoyer un email automatique avec un lien de mise à jour de paiement dans les 24h.

## 2. Fonds insuffisants

Le prélèvement a échoué par manque de provision. Stripe renvoie `insufficient_funds`. Ce type d'échec est souvent temporaire.

**Comment récupérer :** Attendre 3-5 jours et relancer. Le taux de récupération sur ce type d'échec dépasse 60%.

## 3. Carte bloquée par la banque

La banque a refusé la transaction pour suspicion de fraude. Code : `card_declined`. Une simple vérification auprès de la banque suffit souvent à débloquer la situation.

## 4. Paiement 3DS requis

Certaines banques européennes imposent une authentification forte. Si votre flow ne gère pas le 3DS correctement, le paiement est refusé silencieusement.

## 5. Carte perdue ou volée

Le client a déclaré sa carte perdue ou volée. Dans ce cas, seul un nouveau moyen de paiement permettra de récupérer l'abonnement.

## Conclusion

Chacun de ces échecs peut être récupéré avec la bonne stratégie d'automatisation. C'est exactement ce que Dunlo fait pour vous.
```

- [ ] **Step 2: Create article 2**

```mdx
---
title: "Dunning : le guide complet pour les SaaS"
description: "Le dunning est la stratégie de relance automatique des paiements échoués. Voici comment le mettre en place efficacement pour votre SaaS."
date: "2026-05-14"
published: true
tags: ["dunning", "saas", "stratégie"]
keywords: ["dunning saas", "relance paiement automatique", "churn involontaire"]
---

## Qu'est-ce que le dunning ?

Le **dunning** est le processus d'envoi automatique de communications aux clients dont le paiement a échoué, dans le but de récupérer les abonnements avant annulation.

## Pourquoi c'est critique pour les SaaS

Le churn involontaire — les désabonnements dus à un échec de paiement et non à une insatisfaction — représente en moyenne **20 à 40 %** du churn total d'un SaaS.

C'est de l'argent laissé sur la table alors que le client voulait rester.

## Les 3 piliers d'une stratégie dunning efficace

### 1. La séquence d'emails

Une bonne séquence dunning comprend :
- **J+0** : Email immédiat informant de l'échec
- **J+3** : Rappel avec lien de mise à jour direct
- **J+7** : Dernière chance avant suspension

### 2. Le timing

Relancer trop tôt (dans les heures suivant l'échec) génère de la friction. Attendre trop longtemps fait oublier l'abonnement au client.

### 3. Le lien de mise à jour direct

Chaque email doit contenir un lien unique et sécurisé qui amène le client directement sur le formulaire de mise à jour de sa carte — sans login requis.

## Comment Dunlo automatise tout ça

Dunlo connecte votre compte Stripe en 2 minutes et gère l'intégralité du flux dunning : détection des échecs, envoi des emails, suivi des récupérations.
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/content/
git commit -m "feat(blog): add 2 sample MDX articles"
```

---

## Task 5: Create lib/blog.ts helpers

**Files:**
- Create: `apps/web/src/lib/blog.ts`

Note: The `.source/server.ts` file is auto-generated by the fumadocs-mdx Vite plugin when the dev server starts or a build runs. Do not create it manually.

- [ ] **Step 1: Create the file**

```typescript
// apps/web/src/lib/blog.ts
import { blog } from "collections/server";
import { loader } from "fumadocs-core/source";

const blogSource = loader({
  baseUrl: "/blog",
  source: blog.toFumadocsSource(),
});

export function getAllPosts() {
  return blogSource
    .getPages()
    .filter((p) => p.data.published)
    .sort(
      (a, b) =>
        new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
    );
}

export function getPost(slug: string) {
  return blogSource.getPage([slug]);
}
```

- [ ] **Step 2: Verify TypeScript resolves (start dev server to generate .source/)**

```bash
cd apps/web && bun run dev
```

Expected: dev server starts, no TypeScript errors about `collections/server`. If `.source/server.ts` is not generated, check that `source.config.ts` is correct and the Vite plugin is loaded (Task 3).

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/lib/blog.ts
git commit -m "feat(blog): add blog source and getAllPosts/getPost helpers"
```

---

## Task 6: Create /blog list route

**Files:**
- Create: `apps/web/src/routes/blog.tsx`

- [ ] **Step 1: Create the route file**

```tsx
// apps/web/src/routes/blog.tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { getAllPosts } from "@/lib/blog";

export const Route = createFileRoute("/blog")({
  loader: () => {
    const posts = getAllPosts();
    return posts.map((p) => ({
      slug: p.slugs[0]!,
      title: p.data.title,
      description: p.data.description,
      date: p.data.date,
      tags: p.data.tags,
    }));
  },
  head: () => ({
    meta: [
      { title: "Blog — Dunlo" },
      {
        name: "description",
        content:
          "Guides et tutoriels pour récupérer vos paiements Stripe échoués et réduire le churn involontaire.",
      },
    ],
  }),
  component: BlogPage,
});

function BlogPage() {
  const posts = Route.useLoaderData();

  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-3">Blog</h1>
        <p className="text-muted-foreground text-lg">
          Guides pratiques pour récupérer vos paiements Stripe échoués.
        </p>
      </div>

      {posts.length === 0 && (
        <p className="text-muted-foreground">Aucun article pour l'instant.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            to="/blog/$slug"
            params={{ slug: post.slug }}
            className="group block p-6 rounded-2xl border border-border bg-card hover:border-dunlo/40 transition-colors"
          >
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-0.5 rounded-full bg-dunlo/20 text-dunlo-deep font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-lg font-semibold mb-2 group-hover:text-dunlo-dim transition-colors leading-snug">
              {post.title}
            </h2>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {post.description}
            </p>
            <time className="text-xs text-muted-foreground">
              {new Date(post.date).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
          </Link>
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify in browser**

Navigate to `http://localhost:3001/blog`. Expected: list of 2 article cards with tags, titles, descriptions, dates.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/routes/blog.tsx
git commit -m "feat(blog): add /blog list route"
```

---

## Task 7: Create /blog/$slug article route

**Files:**
- Create: `apps/web/src/routes/blog.$slug.tsx`

- [ ] **Step 1: Create the route file**

```tsx
// apps/web/src/routes/blog.$slug.tsx
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getPost } from "@/lib/blog";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return {
      title: post.data.title,
      description: post.data.description,
      date: post.data.date,
      tags: post.data.tags,
      keywords: post.data.keywords,
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title} — Dunlo Blog` },
      { name: "description", content: loaderData?.description },
      { name: "keywords", content: loaderData?.keywords?.join(", ") },
    ],
  }),
  component: BlogPostPage,
});

function BlogPostPage() {
  const { slug } = Route.useParams();
  const { title, date, tags } = Route.useLoaderData();

  const post = getPost(slug)!;
  const MDX = post.data.body;

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <Link
        to="/blog"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-dunlo-dim transition-colors mb-10"
      >
        ← Retour au blog
      </Link>

      <header className="mb-10">
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-0.5 rounded-full bg-dunlo/20 text-dunlo-deep font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4 leading-tight">
          {title}
        </h1>
        <time className="text-sm text-muted-foreground">
          {new Date(date).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </time>
      </header>

      <article className="prose prose-zinc max-w-none">
        <MDX />
      </article>
    </main>
  );
}
```

- [ ] **Step 2: Verify in browser**

Navigate to `http://localhost:3001/blog/5-raisons-echec-paiement-stripe`. Expected: full article rendered with styled prose, tags, date, back button. Check `<title>` in browser tab.

Navigate to `http://localhost:3001/blog/article-inexistant`. Expected: 404 page (TanStack Router notFound handler).

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/routes/blog.$slug.tsx
git commit -m "feat(blog): add /blog/$slug article route"
```

---

## Task 8: Final verification

- [ ] **Step 1: Run type check**

```bash
bun run check-types
```

Expected: 0 errors.

- [ ] **Step 2: Check SEO meta tags**

Open `http://localhost:3001/blog/guide-dunning-saas` in browser. Open DevTools → Elements → `<head>`. Verify:
- `<title>` = `Dunning : le guide complet pour les SaaS — Dunlo Blog`
- `<meta name="description">` is present
- `<meta name="keywords">` contains the keywords array

- [ ] **Step 3: Verify SSR renders correctly**

Run `curl http://localhost:3001/blog` and confirm the HTML response contains the article titles (not just an empty React shell). This confirms SSR is working.

- [ ] **Step 4: Final commit if any cleanup needed**

```bash
git add -p
git commit -m "chore(blog): final cleanup"
```
