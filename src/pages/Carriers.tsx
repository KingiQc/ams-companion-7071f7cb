import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { Building2 } from "lucide-react";

const CarriersPage = () => (
  <AppLayout>
    <div className="mb-6">
      <h1 className="text-[22px] font-semibold text-foreground">Carrier Access</h1>
      <p className="text-muted-foreground text-[15px]">Manage your carrier partnerships.</p>
    </div>
    <EmptyState icon={Building2} title="No carriers yet" description="Add your insurance carrier partners to manage products and access." />
  </AppLayout>
);

export default CarriersPage;
