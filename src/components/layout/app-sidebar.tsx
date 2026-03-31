"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LuLayoutDashboard,
  LuFileText,
  LuBrain,
  LuPlus,
  LuBolt,
} from "react-icons/lu";

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-slate-900 flex flex-col shrink-0 h-full overflow-y-auto">
      {/* Brand */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-accent-600 flex items-center justify-center shrink-0">
            <LuBolt className="h-4 w-4 text-white" />
          </div>
          <span className="text-white font-bold text-sm leading-tight">
            Agentic Resume
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        <Link
          href="/dashboard?new=true"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors mb-2"
        >
          <LuPlus className="h-4 w-4" />
          New Resume
        </Link>

        <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
          Workspace
        </p>

        {[
          { href: "/dashboard", label: "My Resumes", icon: LuFileText },
          { href: "/knowledge-base", label: "Knowledge Base", icon: LuBrain },
        ].map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? "bg-accent-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
