"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Button from "@/components/ui/button";
import { useTheme, colorPresets } from "@/components/providers/theme-provider";
import { LuFileText, LuLogOut, LuLayoutDashboard, LuUser, LuPalette } from "react-icons/lu";

function Avatar({ src, name }: { src?: string | null; name?: string | null }) {
  const [imgError, setImgError] = useState(false);

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name || ""}
        className="h-8 w-8 rounded-full"
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className="h-8 w-8 rounded-full bg-accent-100 flex items-center justify-center">
      <LuUser className="h-4 w-4 text-accent-600" />
    </div>
  );
}

function ThemePicker() {
  const [open, setOpen] = useState(false);
  const { preset, setPreset } = useTheme();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
        title="Change accent color"
      >
        <LuPalette className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50 flex gap-1.5">
          {colorPresets.map((p) => (
            <button
              key={p.name}
              onClick={() => { setPreset(p.name); setOpen(false); }}
              className={`w-6 h-6 rounded-full transition-all ${
                preset === p.name ? "ring-2 ring-offset-1 ring-gray-400 scale-110" : "hover:scale-110"
              }`}
              style={{ backgroundColor: p.colors[600] }}
              title={p.label}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <LuFileText className="h-6 w-6 text-accent-600" />
            <span className="text-xl font-bold text-gray-900">ResumeAI</span>
          </Link>

          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <LuLayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <ThemePicker />
                <div className="flex items-center gap-3">
                  <Avatar src={session.user?.image} name={session.user?.name} />
                  <span className="text-sm text-gray-700">{session.user?.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LuLogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <Link href="/login">
                <Button size="sm">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
