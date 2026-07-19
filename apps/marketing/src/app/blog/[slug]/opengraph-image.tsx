import { notFound } from "next/navigation";
import { getPost } from "@/lib/blog";
import { createDunloOgImage, ogImageSize } from "@/lib/og";

type BlogPostOgImageProps = {
  params: Promise<{ slug: string }>;
};

export const alt = "Dunlo blog article";
export const size = ogImageSize;
export const contentType = "image/png";

export default async function Image({ params }: BlogPostOgImageProps) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return createDunloOgImage({
    title: post.data.title,
    description: post.data.description,
    badge: post.data.tags[0] ?? "Dunlo blog",
  });
}
