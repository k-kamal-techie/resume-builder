"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Button from "@/components/ui/button";
import { LuFileText, LuLogOut, LuLayoutDashboard, LuUser } from "react-icons/lu";

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
    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
      <LuUser className="h-4 w-4 text-blue-600" />
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
            <LuFileText className="h-6 w-6 text-blue-600" />
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
