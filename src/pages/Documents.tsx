import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { FolderOpen } from "lucide-react";

const DocumentsPage = () => (
  <AppLayout>
    <div className="mb-6">
      <h1 className="text-[22px] font-semibold text-foreground">Documents</h1>
      <p className="text-muted-foreground text-[15px]">Manage client and policy documents.</p>
    </div>
    <EmptyState icon={FolderOpen} title="No documents yet" description="Upload and manage your documents here once file storage is enabled." />
  </AppLayout>
);

export default DocumentsPage;
