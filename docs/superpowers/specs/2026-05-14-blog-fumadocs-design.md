# Blog Marketing — Design Spec

**Date:** 2026-05-14  
**App:** `apps/web` (TanStack Start)  
**Approach:** Fumadocs MDX pipeline + UI custom  

---

## Objectif

Ajouter un blog marketing accessible à `/blog` pour attirer des prospects SaaS via du contenu SEO (tutoriels, guides sur la récupération de paiements Stripe). Les articles sont rédigés en MDX dans le repo git, sans CMS externe.

---

## Architecture

### Nouveaux fichiers

```
apps/web/
├── content/
│   └── blog/
│       └── *.mdx                     # Articles MDX
├── src/
│   ├── routes/
│   │   ├── blog.tsx                  # /blog — liste des articles
│   │   └── blog.$slug.tsx            # /blog/$slug — article individuel
│   └── lib/
│       └── blog.ts                   # getAllPosts(), getPost(slug)
└── vite.config.ts                    # plugin fumadocs-mdx ajouté
```

### Packages ajoutés

- `fumadocs-mdx` — plugin Vite pour transformer les `.mdx` en modules JS
- `fumadocs-core` — utilitaires : collection de contenu, frontmatter typé avec Zod
- `@tailwindcss/typography` — plugin Tailwind pour styler le rendu MDX (prose)

### Flow de données

```
content/blog/*.mdx
  → fumadocs-mdx (Vite plugin, build time)
  → objets TypeScript typés (frontmatter + contenu)
  → lib/blog.ts (getAllPosts, getPost)
  → routes TanStack Start (loader → composant React)
```

---

## Contenu & Frontmatter

Schéma Zod pour chaque article :

```mdx
---
title: "Comment récupérer vos paiements Stripe échoués"
description: "Guide complet pour automatiser la relance des paiements..."
date: "2026-05-14"
published: true
tags: ["stripe", "paiements échoués", "récupération revenue"]
keywords: ["failed payments", "stripe recovery", "dunning"]
---
```

| Champ | Type | Requis | Usage |
|---|---|---|---|
| `title` | string | oui | `<title>` + card |
| `description` | string | oui | `<meta description>` + card |
| `date` | string ISO | oui | tri par date |
| `published` | boolean | non (défaut `true`) | masquer les drafts |
| `tags` | string[] | non | affichage pills, filtre futur |
| `keywords` | string[] | non | `<meta keywords>` SEO |

---

## `lib/blog.ts`

Deux fonctions exposées :

- **`getAllPosts()`** — retourne tous les articles `published: true`, triés par date décroissante. Expose : `slug`, `title`, `description`, `date`, `tags`. Le `slug` est dérivé du nom de fichier MDX (ex: `recuperer-paiements-stripe.mdx` → slug `recuperer-paiements-stripe`).
- **`getPost(slug)`** — retourne un article complet avec son contenu MDX rendu en HTML/JSX.

---

## Pages UI

### `/blog` — Liste des articles

- Header : titre "Blog" + sous-titre descriptif
- Grille 2 colonnes desktop / 1 colonne mobile
- Chaque card : `rounded-2xl`, `border`, hover subtil
  - Contenu : titre, description, date formatée, pills de tags
- Chargement via loader TanStack Start (`getAllPosts()`)

### `/blog/$slug` — Article individuel

- Layout centré, colonne max `720px`
- En-tête : `h1` titre, date, pills tags (`bg-dunlo/20 text-dunlo-deep rounded-full`)
- Corps : rendu MDX stylisé via `@tailwindcss/typography` (classe `prose`)
- SEO : `<title>`, `<meta name="description">`, `<meta name="keywords">` injectés via le loader
- Bouton "← Retour au blog" en haut à gauche
- Pas de sidebar, pas de TOC

---

## Hors scope (pour l'instant)

- Pagination
- Filtre par tag (`/blog?tag=stripe`)
- Recherche full-text
- Sitemap XML automatique
- CMS headless
