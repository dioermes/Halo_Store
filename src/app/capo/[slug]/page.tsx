import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product-detail";
import { ProductJsonLd } from "@/components/structured-data";
import { getProductBySlug } from "@/lib/catalog";
import { productPath } from "@/lib/product-path";
import { storeConfig } from "@/lib/store-config";

export const dynamic = "force-dynamic";

function absUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  const base = storeConfig.siteUrl.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Capo" };

  const title = product.subtitle ? `${product.name} · ${product.subtitle}` : product.name;
  const description = product.description || product.subtitle || `${product.name} da Halo Store Conversano.`;
  const url = absUrl(productPath(product.id));
  const image = absUrl(product.image);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "it_IT",
      title: `${title} · Halo Store Conversano`,
      description,
      url,
      siteName: "Halo Store",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function CapoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <article className="halo-section">
      <div className="halo-shell">
        <ProductJsonLd product={product} />
        <ProductDetail product={product} layout="page" />
      </div>
    </article>
  );
}
