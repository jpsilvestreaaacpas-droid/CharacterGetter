"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { CommunityDatasetImportSchema } from "@/lib/data/schemas";
import { Settings, FileJson, CheckCircle2, AlertTriangle, RefreshCw, User, Save, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRegionalBackground, REGIONAL_BACKGROUNDS, RegionalBackgroundId } from "@/components/theme/background-context";

export default function SettingsPage() {
  const { currentBackground, setBackground } = useRegionalBackground();
  const [profile, setProfile] = React.useState({
    travelerName: "Lumine",
    adventureRank: 58,
    worldLevel: 8,
    primogems: 14880,
    intertwinedFates: 12,
    signature: "Collecting stars across Teyvat ✨",
  });
  const [saved, setSaved] = React.useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
        </div>
      </div>
    </AppShell>
  );
}
