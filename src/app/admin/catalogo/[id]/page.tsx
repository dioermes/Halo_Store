import { ProductEditor } from "@/components/product-editor";
import { getStoreCategories } from "@/lib/categories";
import { getProductAdmin } from "@/lib/catalog";
import { getCatalogMerch } from "@/lib/site";
import { notFound } from "next/navigation";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ salvato?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const saved = query.salvato === "1";
  const [categories, merch] = await Promise.all([getStoreCategories(), getCatalogMerch()]);
  if (id === "nuovo") return <ProductEditor saved={saved} categories={categories} tags={merch.tags} />;
  const product = await getProductAdmin(id);
  if (!product) notFound();
  return (
    <ProductEditor
      product={product}
      productId={id}
      saved={saved}
      categories={categories}
      tags={merch.tags}
    />
  );
}
