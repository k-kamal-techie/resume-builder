import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import AppSidebar from "@/components/layout/app-sidebar";

export default async function EditorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
