"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LuFileText,
  LuBrain,
  LuPlus,
  LuBolt,
} from "react-icons/lu";

export default function AppSidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside
      className={`${isExpanded ? "w-60" : "w-14"} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 h-full overflow-hidden transition-all duration-200`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Brand */}
      <div className={`px-3 pt-4 pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center ${isExpanded ? "gap-2.5" : "justify-center"}`}>
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-accent-600 flex items-center justify-center shrink-0">
            <LuBolt className="h-4 w-4 text-white" />
          </div>
          {isExpanded && (
            <span className="text-slate-900 dark:text-white font-bold text-sm leading-tight whitespace-nowrap">
              Agentic Resume
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        <Link
          href="/dashboard?new=true"
          title={!isExpanded ? "New Resume" : undefined}
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mb-2 ${!isExpanded ? "justify-center" : ""}`}
        >
          <LuPlus className="h-4 w-4 shrink-0" />
          {isExpanded && "New Resume"}
        </Link>

        {isExpanded && (
          <p className="px-2.5 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-600">
            Workspace
          </p>
        )}

        {[
          { href: "/dashboard", label: "My Resumes", icon: LuFileText },
          { href: "/knowledge-base", label: "Knowledge Base", icon: LuBrain },
        ].map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              title={!isExpanded ? item.label : undefined}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${!isExpanded ? "justify-center" : ""} ${
                isActive
                  ? "bg-accent-600 text-white"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {isExpanded && item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
