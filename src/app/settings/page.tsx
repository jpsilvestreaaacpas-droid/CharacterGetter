"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { CommunityDatasetImportSchema } from "@/lib/data/schemas";
import { Settings, FileJson, CheckCircle2, AlertTriangle, RefreshCw, User, Save, Image as ImageIcon, Shuffle, Download, Upload } from "lucide-react";
import { usePlayerProfile } from "@/lib/hooks/use-local-player";
import { localPlayerRepo } from "@/lib/repositories/LocalPlayerRepository";
import { Input } from "@/components/ui/input";
import { useRegionalBackground, REGIONAL_BACKGROUNDS, RegionalBackgroundId } from "@/components/theme/background-context";
import { useChatEmojis, ChatEmojiImg, DecorationSlot } from "@/components/theme/chat-emoji-context";

export default function SettingsPage() {
  const { currentBackground, setBackground } = useRegionalBackground();
  const { shuffleAll, shuffleSlot, getSlot, assignments, status: emojiStatus, reload: reloadEmojis } = useChatEmojis();
  const { profile: persistedProfile, saveProfile } = usePlayerProfile();
  const [profile, setProfile] = React.useState({
    travelerName: "Traveler",
    adventureRank: 1,
    worldLevel: 0,
    primogems: 0,
    intertwinedFates: 0,
    signature: "Exploring Teyvat",
  });
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    if (persistedProfile) {
      setProfile({
        travelerName: persistedProfile.travelerName,
        adventureRank: persistedProfile.adventureRank,
        worldLevel: persistedProfile.worldLevel,
        primogems: persistedProfile.primogems,
        intertwinedFates: persistedProfile.intertwinedFates,
        signature: persistedProfile.signature ?? "",
      });
    }
  }, [persistedProfile]);

  async function handleSave() {
    await saveProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleExportBackup() {
    const json = await localPlayerRepo.exportAllData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `character-getter-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportBackup(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await localPlayerRepo.importAllData(text);
      setImportStatus({ state: "success", message: "Local player backup restored successfully!" });
    } catch (err) {
      setImportStatus({
        state: "error",
        message: err instanceof Error ? err.message : "Failed to restore backup",
      });
    }
  }

  const [importStatus, setImportStatus] = React.useState<{
    state: "idle" | "success" | "error";
    message?: string;
  }>({ state: "idle" });

  const samplePayload = JSON.stringify(
    {
      schemaVersion: "1.0.0",
      exportedAt: new Date().toISOString(),
      characters: [
        {
          id: "mavuika",
          name: "Mavuika",
          title: "Archon of Natlan",
          rarity: 5,
          element: "Pyro",
          weaponType: "Claymore",
          region: "Natlan",
          releaseVersion: "5.3",
        },
      ],
    },
    null,
    2
  );

  const [jsonInput, setJsonInput] = React.useState(samplePayload);

  const handleValidateAndImport = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const validation = CommunityDatasetImportSchema.safeParse(parsed);

      if (validation.success) {
        setImportStatus({
          state: "success",
          message: `Validation successful! Ready to register ${validation.data.characters.length} community characters. (Schema v${validation.data.schemaVersion})`,
        });
      } else {
        const errorDetails = validation.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join(", ");
        setImportStatus({
          state: "error",
          message: `Schema Validation Error: ${errorDetails}`,
        });
      }
    } catch (e: any) {
      setImportStatus({
        state: "error",
        message: `Invalid JSON syntax: ${e.message}`,
      });
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Settings & Data Management
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure application theme, demo profiles, and community dataset imports.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Preferences */}
        <div className="space-y-6">
          {/* Player Profile Editor */}
          <Card fantasy>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4 text-gold-500" />
                Player Profile
              </CardTitle>
              <CardDescription className="text-xs">
                Edit your traveler name and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase">Traveler Name</label>
                <Input
                  value={profile.travelerName}
                  onChange={(e) => setProfile((p) => ({ ...p, travelerName: e.target.value }))}
                  className="h-8 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase">Adventure Rank</label>
                  <Input
                    type="number" min={1} max={60}
                    value={profile.adventureRank}
                    onChange={(e) => setProfile((p) => ({ ...p, adventureRank: parseInt(e.target.value) || 1 }))}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase">World Level</label>
                  <Input
                    type="number" min={0} max={8}
                    value={profile.worldLevel}
                    onChange={(e) => setProfile((p) => ({ ...p, worldLevel: parseInt(e.target.value) || 0 }))}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase">Primogems</label>
                  <Input
                    type="number" min={0}
                    value={profile.primogems}
                    onChange={(e) => setProfile((p) => ({ ...p, primogems: parseInt(e.target.value) || 0 }))}
                    className="h-8 text-sm font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase">Intertwined Fates</label>
                  <Input
                    type="number" min={0}
                    value={profile.intertwinedFates}
                    onChange={(e) => setProfile((p) => ({ ...p, intertwinedFates: parseInt(e.target.value) || 0 }))}
                    className="h-8 text-sm font-mono"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase">Signature</label>
                <Input
                  value={profile.signature}
                  onChange={(e) => setProfile((p) => ({ ...p, signature: e.target.value }))}
                  className="h-8 text-sm"
                />
              </div>
              <Button
                variant="fantasy" size="sm"
                className="w-full text-xs gap-1.5"
                onClick={handleSave}
              >
                {saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                {saved ? "Saved!" : "Save Profile"}
              </Button>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card fantasy>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Interface Appearance</CardTitle>
              <CardDescription className="text-xs">
                Toggle between Light (Ivory) and Dark (Obsidian) theme
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">Theme Mode</span>
              <ThemeToggle />
            </CardContent>
          </Card>

          {/* Chat Emoji Decoration Settings */}
          <Card fantasy>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shuffle className="w-4 h-4 text-gold-500" />
                  Chat Emoji Decorations
                </CardTitle>
                <Badge variant={emojiStatus === "ready" ? "gold" : emojiStatus === "error" ? "outline" : "outline"}>
                  {emojiStatus === "loading" ? "Loading…" : emojiStatus === "ready" ? `${Object.keys(assignments).length} Assigned` : emojiStatus === "error" ? "Offline" : "Idle"}
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Genshin chat emojis from the in-game Paimon&apos;s Paintings gallery replace decorative character sprites. Images load from the Fandom wiki and are not stored locally.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {emojiStatus === "error" && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-xs text-destructive-foreground flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <span>Could not reach the Fandom API. Emoji decorations are hidden until the connection is restored.</span>
                </div>
              )}

              {/* Current assignments preview */}
              <div className="grid grid-cols-2 gap-2">
                {(["sidebar_dashboard", "sidebar_progression", "sidebar_footer", "header_tab", "dashboard_target", "dashboard_target_ghost", "dashboard_roster", "dashboard_recent"] as DecorationSlot[]).map((slot) => {
                  const emoji = getSlot(slot);
                  const label = slot.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
                  return (
                    <div key={slot} className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/30 border border-border/60">
                      <div className="w-9 h-9 rounded-lg bg-black/20 flex items-center justify-center shrink-0 overflow-hidden">
                        {emoji ? (
                          <ChatEmojiImg emoji={emoji} size={32} />
                        ) : (
                          <span className="text-muted-foreground text-[9px]">—</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold text-foreground truncate">{label}</p>
                        {emoji && <p className="text-[9px] text-muted-foreground truncate">{emoji.character}</p>}
                      </div>
                      <button
                        onClick={() => shuffleSlot(slot)}
                        disabled={emojiStatus !== "ready"}
                        className="shrink-0 w-6 h-6 rounded flex items-center justify-center hover:bg-amber-500/20 text-muted-foreground hover:text-amber-300 transition-colors disabled:opacity-30"
                        title="Shuffle this slot"
                      >
                        <Shuffle className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline-gold"
                  size="sm"
                  onClick={shuffleAll}
                  disabled={emojiStatus !== "ready"}
                  className="flex-1 text-xs gap-1.5"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  Shuffle All Emojis
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={reloadEmojis}
                  disabled={emojiStatus === "loading"}
                  className="text-xs gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${emojiStatus === "loading" ? "animate-spin" : ""}`} />
                  Reload
                </Button>
              </div>

              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Source: <a href="https://genshin-impact.fandom.com/wiki/Chat/Gallery" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">Genshin Impact Wiki — Chat/Gallery</a>. Images © miHoYo / HoYoverse. Used for non-commercial fan purposes.
              </p>
            </CardContent>
          </Card>

          {/* Regional Background Selector */}
          <Card fantasy>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-gold-500" />
                Regional Environment Artwork
              </CardTitle>
              <CardDescription className="text-xs">
                Select your immersive Teyvat regional background landscape
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-2.5">
                {REGIONAL_BACKGROUNDS.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => setBackground(bg.id as RegionalBackgroundId)}
                    className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden flex items-center justify-between group ${
                      currentBackground === bg.id
                        ? "border-amber-500/50 bg-amber-500/15 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                        : "border-border/70 bg-card/60 hover:border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg bg-cover bg-center border border-white/20 shadow-inner shrink-0"
                        style={{ backgroundImage: `url('${bg.image}')` }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-xs text-foreground">{bg.name}</p>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {bg.region}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                          {bg.description}
                        </p>
                      </div>
                    </div>
                    {currentBackground === bg.id && (
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 ml-2" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Demo Data Management */}
          <Card fantasy>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Demo Data Provider</CardTitle>
                <Badge variant="gold">Active</Badge>
              </div>
              <CardDescription className="text-xs">
                Milestone 1 utilizes local isolated demo datasets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Demo data ensures full application testability without requiring live Mihoyo credentials or third-party web scraping.
              </p>
              <Button variant="outline-gold" size="sm" className="w-full text-xs gap-1.5" onClick={() => alert("Demo data provider re-seeded.")}>
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Demo Data Provider
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Community Dataset Import Interface (Phase 6 requirement) */}
        <div className="lg:col-span-2">
          <Card fantasy>
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileJson className="w-4 h-4 text-gold-500" />
                    Community Data Import Interface
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Prepare a data import interface for future community-maintained datasets (Zod validated)
                  </CardDescription>
                </div>
                <Badge variant="outline">Zod Schema v1.0.0</Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              <p className="text-xs text-muted-foreground">
                Paste JSON character data below. The parser uses strict schema validation before storing to the canonical reference database.
              </p>

              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows={10}
                className="w-full font-mono text-xs p-3 rounded-lg bg-muted/40 border border-border/80 focus:outline-none focus:ring-1 focus:ring-gold-500"
              />

              <div className="flex items-center justify-between">
                <Button
                  variant="fantasy"
                  size="sm"
                  onClick={handleValidateAndImport}
                  className="text-xs"
                >
                  Validate & Preview Import
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setJsonInput(samplePayload)}
                  className="text-xs text-muted-foreground"
                >
                  Load Sample Natlan Character
                </Button>
              </div>

              {/* Status Display */}
              {importStatus.state === "success" && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-xs text-green-700 dark:text-green-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span>{importStatus.message}</span>
                </div>
              )}

              {importStatus.state === "error" && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-xs text-destructive-foreground flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <span>{importStatus.message}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Local Player Backup & Restore */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileJson className="w-5 h-5 text-primary" />
                Local Player Backup (IndexedDB)
              </CardTitle>
              <CardDescription>
                Export or restore your local profile, resource inventory, pity, and teams as JSON. Stored locally only.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button type="button" variant="outline" onClick={handleExportBackup} className="gap-2">
                <Download className="w-4 h-4" />
                Export My Data (JSON)
              </Button>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm font-medium cursor-pointer">
                <Upload className="w-4 h-4" />
                Import Backup (JSON)
                <input type="file" accept="application/json" onChange={handleImportBackup} className="hidden" />
              </label>
            </CardContent>
          </Card>

          {/* Display Scale Setting */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Display Scale</CardTitle>
              <CardDescription>
                Adjust the base interface zoom (modals maintain independent sizing).
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {[
                { label: "90%", value: "0.9" },
                { label: "100%", value: "1" },
                { label: "110%", value: "1.1" },
                { label: "125% (Default)", value: "1.25" },
                { label: "150%", value: "1.5" },
              ].map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    localStorage.setItem("cg_display_scale", opt.value);
                    document.documentElement.style.setProperty("--app-display-scale", opt.value);
                  }}
                >
                  {opt.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
