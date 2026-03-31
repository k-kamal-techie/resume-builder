"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useTheme, colorPresets } from "@/components/providers/theme-provider";
import { LuSun, LuMoon, LuUser, LuLogOut, LuChevronDown, LuKey, LuCheck, LuEye, LuEyeOff } from "react-icons/lu";
import { getAISettings, saveAISettings } from "@/lib/services/settings";

function UserAvatar({ src, name }: { src?: string | null; name?: string | null }) {
  const [err, setErr] = useState(false);
  if (src && !err) {
    return (
      <img src={src} alt={name || ""} referrerPolicy="no-referrer" onError={() => setErr(true)}
        className="h-8 w-8 rounded-full object-cover ring-2 ring-white/20" />
    );
  }
  return (
    <div className="h-8 w-8 rounded-full bg-accent-600 flex items-center justify-center ring-2 ring-white/20">
      <LuUser className="h-4 w-4 text-white" />
    </div>
  );
}

interface TopNavbarProps {
  title?: string;
}

export default function TopNavbar({ title }: TopNavbarProps) {
  const { data: session } = useSession();
  const { preset, setPreset, mode, setMode } = useTheme();
  const [open, setOpen] = useState(false);

  // AI Settings state
  const [hasApiKey, setHasApiKey] = useState(false);
  const [aiModel, setAiModel] = useState("claude-sonnet-4-6");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open) {
      getAISettings()
        .then((s) => {
          setHasApiKey(s.hasApiKey);
          setAiModel(s.aiModel);
        })
        .catch(() => {});
    }
  }, [open]);

  async function handleSaveAI() {
    setSaving(true);
    try {
      await saveAISettings({
        apiKey: apiKeyInput || undefined,
        aiModel,
      });
      if (apiKeyInput) setHasApiKey(true);
      setApiKeyInput("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  return (
    <header className="h-12 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between px-5 relative z-30">
      {/* Left: title */}
      <div className="flex items-center gap-2">
        {title && (
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</span>
        )}
      </div>

      {/* Right: account */}
      {session?.user && (
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <UserAvatar src={session.user.image} name={session.user.name} />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-none">{session.user.name}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-none">{session.user.email}</p>
            </div>
            <LuChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>

          {/* Backdrop */}
          {open && (
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          )}

          {/* Dropdown panel */}
          {open && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl ring-1 ring-slate-900/10 dark:ring-white/10 z-20 overflow-hidden">
              {/* Account info header */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <UserAvatar src={session.user.image} name={session.user.name} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{session.user.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{session.user.email}</p>
                  </div>
                </div>
              </div>

              {/* AI Engine */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-1.5 mb-3">
                  <LuKey className="h-3 w-3 text-slate-400" />
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    AI Engine
                  </p>
                  {hasApiKey && (
                    <span className="ml-auto text-[10px] font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded-full">
                      Key saved
                    </span>
                  )}
                </div>

                {/* Model selector */}
                <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-xl gap-0.5 mb-3">
                  {[
                    { id: "claude-sonnet-4-6", label: "Sonnet 4.6", desc: "Fast" },
                    { id: "claude-opus-4-6",   label: "Opus 4.6",   desc: "Smart" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setAiModel(m.id)}
                      className={`flex-1 flex flex-col items-center py-1.5 rounded-lg text-xs font-medium transition-all ${
                        aiModel === m.id
                          ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      <span>{m.label}</span>
                      <span className="text-[9px] opacity-60">{m.desc}</span>
                    </button>
                  ))}
                </div>

                {/* API Key input */}
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder={hasApiKey ? "Enter new key to replace…" : "sk-ant-api03-…"}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 pr-8 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-accent-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showKey ? <LuEyeOff className="h-3.5 w-3.5" /> : <LuEye className="h-3.5 w-3.5" />}
                  </button>
                </div>

                <button
                  onClick={handleSaveAI}
                  disabled={saving || (!apiKeyInput && aiModel === (hasApiKey ? aiModel : "claude-sonnet-4-6"))}
                  className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium bg-accent-600 text-white hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saved ? <><LuCheck className="h-3.5 w-3.5" /> Saved</> : saving ? "Saving…" : "Save AI Settings"}
                </button>
              </div>

              {/* Mode toggle */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  Appearance
                </p>
                <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-xl gap-0.5">
                  <button
                    onClick={() => setMode("light")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      mode === "light"
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    <LuSun className="h-3.5 w-3.5" /> Light
                  </button>
                  <button
                    onClick={() => setMode("dark")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      mode === "dark"
                        ? "bg-slate-700 text-white shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    <LuMoon className="h-3.5 w-3.5" /> Dark
                  </button>
                </div>
              </div>

              {/* Accent color */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
                  Accent Color
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {colorPresets.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => setPreset(p.name)}
                      title={p.label}
                      className={`h-6 w-6 rounded-full transition-all ${
                        preset === p.name
                          ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 scale-110"
                          : "hover:scale-110 opacity-60 hover:opacity-100"
                      }`}
                      style={{
                        backgroundColor: p.colors[600],
                        outline: preset === p.name ? `2px solid ${p.colors[600]}` : undefined,
                        outlineOffset: preset === p.name ? "2px" : undefined,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Sign out */}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <LuLogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
