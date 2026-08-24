import { ProductEditor } from "@/components/product-editor";
import { getStoreCategories } from "@/lib/categories";
import { getCatalogMerch } from "@/lib/site";

export default async function NewProductPage() {
  const [categories, merch] = await Promise.all([getStoreCategories(), getCatalogMerch()]);
  return <ProductEditor categories={categories} tags={merch.tags} />;
}
