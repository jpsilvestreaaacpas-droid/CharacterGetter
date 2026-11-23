import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Card className="p-8 max-w-md border-border/70 space-y-4">
          <div className="w-12 h-12 rounded-full bg-gold-500/10 text-gold-500 mx-auto flex items-center justify-center">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Lost in Teyvat? (404)</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The page or record you are searching for does not exist or has wandered beyond the boundaries of the map.
          </p>
          <div className="pt-2">
            <Link href="/dashboard">
              <Button variant="fantasy" size="sm" className="text-xs">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
