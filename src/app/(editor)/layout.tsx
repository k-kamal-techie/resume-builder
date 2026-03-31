import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import AppSidebar from "@/components/layout/app-sidebar";
import TopNavbar from "@/components/layout/top-navbar";

export default async function EditorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");
  return (
    <div className="flex h-screen overflow-hidden dark:bg-slate-950">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
