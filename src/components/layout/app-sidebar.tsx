"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme, colorPresets } from "@/components/providers/theme-provider";
import {
  LuLayoutDashboard,
  LuFileText,
  LuBrain,
  LuPlus,
  LuLogOut,
  LuUser,
  LuBolt,
} from "react-icons/lu";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LuLayoutDashboard },
  { href: "/dashboard", label: "My Resumes", icon: LuFileText, match: "/dashboard" },
  { href: "/knowledge-base", label: "Knowledge Base", icon: LuBrain },
];

function UserAvatar({ src, name }: { src?: string | null; name?: string | null }) {
  const [imgError, setImgError] = useState(false);
  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name || ""}
        className="h-8 w-8 rounded-full object-cover"
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
      <LuUser className="h-4 w-4 text-slate-300" />
    </div>
  );
}

export default function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { preset, setPreset } = useTheme();

  return (
    <aside className="w-60 bg-slate-900 flex flex-col shrink-0 h-screen sticky top-0 overflow-y-auto">
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

      {/* User profile */}
      {session?.user && (
        <div className="px-4 py-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <UserAvatar src={session.user.image} name={session.user.name} />
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{session.user.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{session.user.email}</p>
            </div>
          </div>
        </div>
      )}

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

      {/* Bottom section: theme + signout */}
      <div className="px-3 py-3 border-t border-slate-800 space-y-3">
        <div>
          <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            Accent Color
          </p>
          <div className="flex items-center gap-1.5 px-3">
            {colorPresets.map((p) => (
              <button
                key={p.name}
                onClick={() => setPreset(p.name)}
                title={p.label}
                className={`h-5 w-5 rounded-full transition-all ${
                  preset === p.name ? "ring-2 ring-white ring-offset-1 ring-offset-slate-900 scale-110" : "hover:scale-110 opacity-70 hover:opacity-100"
                }`}
                style={{ backgroundColor: p.colors[600] }}
              />
            ))}
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <LuLogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
