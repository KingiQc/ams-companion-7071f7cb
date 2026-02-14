import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { MessageSquare } from "lucide-react";

const MessagesPage = () => (
  <AppLayout>
    <div className="mb-6">
      <h1 className="text-[22px] font-semibold text-foreground">Messages</h1>
      <p className="text-muted-foreground text-[15px]">Client messages and communications.</p>
    </div>
    <EmptyState icon={MessageSquare} title="No messages yet" description="Client messages will appear here once integrated with email or SMS." />
  </AppLayout>
);

export default MessagesPage;
