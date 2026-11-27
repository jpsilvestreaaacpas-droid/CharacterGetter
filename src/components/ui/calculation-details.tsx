import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalculationMeta, VerificationStatus } from "@/lib/services/calculation-service";
import {
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  Info,
  Calendar,
  X,
} from "lucide-react";

interface CalculationDetailsProps {
  meta: CalculationMeta;
  explanation?: string;
  triggerLabel?: string;
  className?: string;
}

const STATUS_BADGES: Record<
  VerificationStatus,
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  VERIFIED: {
    label: "Officially Verified",
    color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    icon: ShieldCheck,
  },
  CORROBORATED: {
    label: "Peer Corroborated",
    color: "bg-gold-500/15 text-gold-400 border-gold-500/30",
    icon: ShieldCheck,
  },
  EMPIRICAL_SIMULATION: {
    label: "Empirical / Simulated",
    color: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    icon: BookOpen,
  },
  HEURISTIC_ESTIMATE: {
    label: "Heuristic Estimate",
    color: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    icon: AlertTriangle,
  },
  INSUFFICIENT_EVIDENCE: {
    label: "Insufficient Evidence",
    color: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    icon: AlertTriangle,
  },
};

export function CalculationDetailsTrigger({
  meta,
  explanation,
  triggerLabel = "How was this calculated?",
  className,
}: CalculationDetailsProps) {
  const [open, setOpen] = React.useState(false);

  const statusConfig = STATUS_BADGES[meta.verificationStatus] ?? STATUS_BADGES.VERIFIED;
  const StatusIcon = statusConfig.icon;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1 text-[11px] font-medium text-gold-400/90 hover:text-gold-300 transition-colors underline decoration-dotted underline-offset-2 ${className ?? ""}`}
        title="View calculation sources, formulas, and assumptions"
      >
        <HelpCircle className="w-3 h-3 shrink-0" />
        <span>{triggerLabel}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Calculation Details: ${meta.methodName}`}
            className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl border border-gold-500/30 bg-[#0c1424] text-foreground shadow-2xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/70 bg-muted/20">
              <div className="space-y-0.5 min-w-0 pr-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-sm sm:text-base text-foreground truncate">
                    {meta.methodName}
                  </h3>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${statusConfig.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    <span>{statusConfig.label}</span>
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground font-mono">
                  Method ID: {meta.methodId} • {meta.version}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground shrink-0"
                onClick={() => setOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto text-xs">
              {/* Natural explanation if provided */}
              {explanation && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs">
                  <p className="font-medium">{explanation}</p>
                </div>
              )}

              {/* Mathematical Formula */}
              <div className="space-y-1">
                <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                  Mathematical Formula
                </span>
                <div className="p-2.5 rounded-lg bg-black/40 border border-border/60 font-mono text-gold-300 text-[11px] break-all">
                  {meta.formula}
                </div>
              </div>

              {/* Underlying Mechanics */}
              <div className="space-y-1">
                <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                  Game Mechanics & Rules
                </span>
                <p className="text-muted-foreground leading-relaxed">
                  {meta.underlyingMechanics}
                </p>
              </div>

              {/* Input Assumptions */}
              {meta.assumptions.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                    Assumptions & Baseline Models
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground/90 pl-1">
                    {meta.assumptions.map((assump, idx) => (
                      <li key={idx} className="leading-snug">{assump}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Authoritative Sources */}
              <div className="space-y-2 pt-2 border-t border-border/50">
                <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                  Source Attribution & Citations
                </span>
                <div className="space-y-2">
                  {meta.sources.map((source) => (
                    <div
                      key={source.id}
                      className="p-2.5 rounded-lg bg-muted/30 border border-border/60 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-xs text-foreground">{source.name}</p>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-muted/60 text-muted-foreground">
                            Priority #{source.priorityRank}
                          </span>
                          {source.isAuthoritative && (
                            <span className="text-[9px] font-semibold text-emerald-400">Authoritative</span>
                          )}
                        </div>
                        {source.notes && (
                          <p className="text-[11px] text-muted-foreground">{source.notes}</p>
                        )}
                      </div>
                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gold-400 hover:text-gold-300 p-1 shrink-0"
                          title="Open source reference"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Known Limitations */}
              {meta.knownLimitations && (
                <div className="p-2.5 rounded-lg bg-muted/20 border border-border/50 text-[11px] text-muted-foreground flex gap-2">
                  <Info className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" />
                  <span><strong>Known Limitations:</strong> {meta.knownLimitations}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-2.5 border-t border-border/60 bg-muted/30 flex items-center justify-between text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1 font-mono">
                <Calendar className="w-3 h-3" /> Last verified: {meta.lastUpdated}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
