import { ProductEditor } from "@/components/product-editor";
import { getStoreCategories } from "@/lib/categories";

export default async function NewProductPage() {
  const categories = await getStoreCategories();
  return <ProductEditor categories={categories} />;
}
