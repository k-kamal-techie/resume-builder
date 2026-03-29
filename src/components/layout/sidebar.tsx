"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuLayoutDashboard, LuPlus, LuFileText } from "react-icons/lu";

const navItems = [
  { href: "/dashboard", label: "My Resumes", icon: LuLayoutDashboard },
  { href: "/templates", label: "Templates", icon: LuFileText },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-gray-200 bg-gray-50 min-h-[calc(100vh-4rem)]">
      <div className="p-4">
        <Link
          href="/dashboard?new=true"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <LuPlus className="h-4 w-4" />
          New Resume
        </Link>
      </div>
      <nav className="px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
