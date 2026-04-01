"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { fetchUserSettings, updateUserSettings } from "@/lib/services/user-settings";
import { LuSettings, LuSave, LuEye, LuEyeOff, LuCheck, LuTriangleAlert } from "react-icons/lu";

const MODEL_OPTIONS = [
  { value: "claude-opus-4-6", label: "Claude Opus 4", description: "Most capable" },
  { value: "claude-sonnet-4-6", label: "Claude Sonnet 4", description: "Balanced" },
  { value: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5", description: "Fastest" },
  { value: "custom", label: "Custom model ID", description: "Enter your own" },
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [token, setToken] = useState("");
  const [hasExistingToken, setHasExistingToken] = useState(false);
  const [tokenPreview, setTokenPreview] = useState("");
  const [selectedModel, setSelectedModel] = useState("claude-sonnet-4-6");
  const [customModel, setCustomModel] = useState("");
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    fetchUserSettings()
      .then((settings) => {
        setHasExistingToken(settings.hasToken);
        setTokenPreview(settings.tokenPreview);
        const matchesPreset = MODEL_OPTIONS.some(
          (o) => o.value !== "custom" && o.value === settings.anthropicModel
        );
        if (matchesPreset) {
          setSelectedModel(settings.anthropicModel);
        } else {
          setSelectedModel("custom");
          setCustomModel(settings.anthropicModel);
        }
      })
      .catch(() => setError("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);

    const model = selectedModel === "custom" ? customModel : selectedModel;
    if (!model) {
      setError("Please select or enter a model");
      setSaving(false);
      return;
    }

    try {
      const params: { anthropicToken?: string; anthropicModel: string } = {
        anthropicModel: model,
      };
      if (token) {
        params.anthropicToken = token;
      }

      const result = await updateUserSettings(params);
      setHasExistingToken(result.hasToken);
      setTokenPreview(result.tokenPreview);
      setToken("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <LuSettings className="h-5 w-5 text-accent-600" />
            Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Configure your AI provider and preferences
          </p>
        </div>
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saved ? <LuCheck className="h-4 w-4 mr-1" /> : <LuSave className="h-4 w-4 mr-1" />}
          {saving ? "Saving..." : saved ? "Saved" : "Save"}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-6 space-y-8">
          {/* API Token Section */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
              Anthropic API Key
            </h2>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
              {hasExistingToken && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                  <LuCheck className="h-4 w-4" />
                  <span>API key configured ({tokenPreview})</span>
                </div>
              )}

              <div className="relative">
                <Input
                  label={hasExistingToken ? "Replace API key" : "API key"}
                  type={showToken ? "text" : "password"}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder={hasExistingToken ? "Enter new key to replace" : "sk-ant-..."}
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-[2.1rem] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showToken ? <LuEyeOff className="h-4 w-4" /> : <LuEye className="h-4 w-4" />}
                </button>
              </div>

              <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                Your API key is encrypted with AES-256 before storage. Get your key from{" "}
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-600 hover:underline"
                >
                  console.anthropic.com
                </a>
              </p>
            </div>
          </section>

          {/* Model Selection */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
              Model
            </h2>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
              {MODEL_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    selectedModel === option.value
                      ? "border-accent-500 bg-accent-50 dark:bg-accent-600/10"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="model"
                    value={option.value}
                    checked={selectedModel === option.value}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="accent-accent-600"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {option.label}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 ml-2">
                      {option.description}
                    </span>
                    {option.value !== "custom" && (
                      <span className="block text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                        {option.value}
                      </span>
                    )}
                  </div>
                </label>
              ))}

              {selectedModel === "custom" && (
                <div className="pt-1">
                  <Input
                    label="Custom model ID"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    placeholder="claude-opus-4-6"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl px-4 py-3">
              <LuTriangleAlert className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
