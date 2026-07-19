type BlogTitleInput = { title: string; seoTitle?: string };
type BlogDateInput = { date: string; updated?: string };

export function getBlogSeoTitle({ title, seoTitle }: BlogTitleInput) {
  return seoTitle ?? `${title} - Dunlo Blog`;
}

export function getBlogModifiedDate({ date, updated }: BlogDateInput) {
  return updated ?? date;
}
