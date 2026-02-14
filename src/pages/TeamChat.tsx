import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { MessagesSquare } from "lucide-react";

const TeamChatPage = () => (
  <AppLayout>
    <div className="mb-6">
      <h1 className="text-[22px] font-semibold text-foreground">Team Chat</h1>
      <p className="text-muted-foreground text-[15px]">Communicate with your team.</p>
    </div>
    <EmptyState icon={MessagesSquare} title="Team Chat Coming Soon" description="Real-time team messaging will be available soon." />
  </AppLayout>
);

export default TeamChatPage;
