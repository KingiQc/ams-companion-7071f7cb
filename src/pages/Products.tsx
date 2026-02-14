import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { Package } from "lucide-react";

const ProductsPage = () => (
  <AppLayout>
    <div className="mb-6">
      <h1 className="text-[22px] font-semibold text-foreground">Products</h1>
      <p className="text-muted-foreground text-[15px]">Available insurance products from carriers.</p>
    </div>
    <EmptyState icon={Package} title="No products yet" description="Insurance products will appear here once carriers and their offerings are added." />
  </AppLayout>
);

export default ProductsPage;
