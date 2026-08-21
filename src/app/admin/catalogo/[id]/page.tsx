import { ProductEditor } from "@/components/product-editor";
import { getStoreCategories } from "@/lib/categories";
import { getProductAdmin } from "@/lib/catalog";
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
  const categories = await getStoreCategories();
  if (id === "nuovo") return <ProductEditor saved={saved} categories={categories} />;
  const product = await getProductAdmin(id);
  if (!product) notFound();
  return <ProductEditor product={product} productId={id} saved={saved} categories={categories} />;
}
