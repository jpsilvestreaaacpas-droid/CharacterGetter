/**
 * Character Getter — Community Banner Radar Probability-of-Truth Engine
 *
 * Implements the 5-factor heuristic probability evaluation model:
 * 1. Historical Source Accuracy: 30%
 * 2. Independent Source Agreement: 25%
 * 3. Evidence Credibility: 20%
 * 4. Evidence Freshness: 15%
 * 5. Consistency with Other Evidence: 10%
 *
 * Requirements:
 * - Detects reposts and duplicate evidence (penalizes copied reports)
 * - Evaluates source independence (distinct platforms / independent leakers)
 * - Penalizes contradictory reports
 * - Decays stale reports over time
 * - Produces transparent "Why this percentage?" factor breakdown
 * - Identifies "Insufficient Evidence" when data is too sparse or low-confidence
 */

export type PredictionStatus =
  | "Unverified"
  | "Developing"
  | "Corroborated"
  | "Disputed"
  | "Officially confirmed"
  | "Disproven"
  | "Stale";

export type ConfidenceLevel = "Official" | "Very High" | "High" | "Moderate" | "Low" | "Insufficient Evidence";

export interface RadarSource {
  id: string;
  name: string;
  platform: "Reddit" | "Discord" | "YouTube" | "X" | "Bilibili" | "Weibo" | "Official" | "Community";
  historicalAccuracy: number; // 0 to 1 (e.g. 0.85 = 85%)
  isOfficial?: boolean;
}

export interface RadarEvidenceItem {
  id: string;
  source: RadarSource;
  url: string;
  publishedAt: string; // ISO date string
  stance: "Supports" | "Contradicts" | "Mentions";
  claimType: "Beta Datamine" | "Story Leak" | "Event Leak" | "Insider Whisper" | "Speculation" | "Official Teaser";
  credibilityScore: number; // 0 to 1 (based on data proof like screenshots, hashes vs mere text)
  isRepost?: boolean;
  repostOfId?: string;
  contentHash?: string;
}

export interface FactorBreakdown {
  historicalSourceAccuracy: {
    weight: number; // 0.30
    rawScore: number; // 0-100
    weightedScore: number;
    explanation: string;
  };
  independentSourceAgreement: {
    weight: number; // 0.25
    rawScore: number; // 0-100
    weightedScore: number;
    independentCount: number;
    explanation: string;
  };
  evidenceCredibility: {
    weight: number; // 0.20
    rawScore: number; // 0-100
    weightedScore: number;
    explanation: string;
  };
  evidenceFreshness: {
    weight: number; // 0.15
    rawScore: number; // 0-100
    weightedScore: number;
    avgAgeDays: number;
    explanation: string;
  };
  consistencyWithOtherEvidence: {
    weight: number; // 0.10
    rawScore: number; // 0-100
    weightedScore: number;
    contradictionCount: number;
    explanation: string;
  };
}

export interface ProbabilityEvaluationResult {
  probabilityPercentage: number; // 0 to 100
  confidenceLevel: ConfidenceLevel;
  status: PredictionStatus;
  isOfficiallyConfirmed: boolean;
  hasInsufficientEvidence: boolean;
  breakdown: FactorBreakdown;
  summaryExplanation: string;
  independentSourceCount: number;
  supportingEvidenceCount: number;
  contradictingEvidenceCount: number;
  repostCount: number;
}

const WEIGHTS = {
  SOURCE_ACCURACY: 0.30,
  INDEPENDENT_AGREEMENT: 0.25,
  CREDIBILITY: 0.20,
  FRESHNESS: 0.15,
  CONSISTENCY: 0.10,
};

/**
 * Calculates evidence freshness score (0 to 1) based on age in days.
 * 0-7 days = 1.0, 8-21 days = 0.85, 22-45 days = 0.60, 46-90 days = 0.30, >90 days = 0.10
 */
export function calculateFreshness(publishedAtIso: string, referenceTimeMs: number = Date.now()): { score: number; ageDays: number } {
  const publishedMs = new Date(publishedAtIso).getTime();
  const diffDays = Math.max(0, (referenceTimeMs - publishedMs) / (1000 * 60 * 60 * 24));

  let score = 1.0;
  if (diffDays <= 7) {
    score = 1.0;
  } else if (diffDays <= 21) {
    score = 0.85;
  } else if (diffDays <= 45) {
    score = 0.60;
  } else if (diffDays <= 90) {
    score = 0.30;
  } else {
    score = 0.10;
  }

  return { score, ageDays: Math.round(diffDays) };
}

/**
 * Identifies duplicate or reposted evidence items by comparing URLs, explicit repost tags, or content hashes.
 */
export function deduplicateEvidence(evidence: RadarEvidenceItem[]): {
  uniqueSupporting: RadarEvidenceItem[];
  uniqueContradicting: RadarEvidenceItem[];
  reposts: RadarEvidenceItem[];
} {
  const seenUrls = new Set<string>();
  const seenHashes = new Set<string>();
  const seenSourceIds = new Set<string>();

  const uniqueSupporting: RadarEvidenceItem[] = [];
  const uniqueContradicting: RadarEvidenceItem[] = [];
  const reposts: RadarEvidenceItem[] = [];

  for (const item of evidence) {
    const isUrlDup = seenUrls.has(item.url);
    const isHashDup = Boolean(item.contentHash && seenHashes.has(item.contentHash));
    const isExplicitRepost = Boolean(item.isRepost || item.repostOfId);

    if (isUrlDup || isHashDup || isExplicitRepost) {
      reposts.push(item);
      continue;
    }

    seenUrls.add(item.url);
    if (item.contentHash) seenHashes.add(item.contentHash);

    if (item.stance === "Contradicts") {
      uniqueContradicting.push(item);
    } else if (item.stance === "Supports") {
      uniqueSupporting.push(item);
    }
  }

  return { uniqueSupporting, uniqueContradicting, reposts };
}

/**
 * Main probability evaluation engine.
 */
export function evaluateBannerProbability(
  evidence: RadarEvidenceItem[],
  options?: { isOfficiallyConfirmed?: boolean; referenceTimeMs?: number }
): ProbabilityEvaluationResult {
  const refTime = options?.referenceTimeMs ?? Date.now();

  // 1. Check for official confirmation
  const officialItem = evidence.find((e) => e.source.isOfficial || e.claimType === "Official Teaser");
  if (options?.isOfficiallyConfirmed || officialItem) {
    return {
      probabilityPercentage: 100,
      confidenceLevel: "Official",
      status: "Officially confirmed",
      isOfficiallyConfirmed: true,
      hasInsufficientEvidence: false,
      breakdown: {
        historicalSourceAccuracy: { weight: 0.3, rawScore: 100, weightedScore: 30, explanation: "Officially announced by game developer." },
        independentSourceAgreement: { weight: 0.25, rawScore: 100, weightedScore: 25, independentCount: 1, explanation: "Verified through official broadcast." },
        evidenceCredibility: { weight: 0.2, rawScore: 100, weightedScore: 20, explanation: "Primary developer source." },
        evidenceFreshness: { weight: 0.15, rawScore: 100, weightedScore: 15, avgAgeDays: 0, explanation: "Current official release." },
        consistencyWithOtherEvidence: { weight: 0.1, rawScore: 100, weightedScore: 10, contradictionCount: 0, explanation: "Definitive announcement." },
      },
      summaryExplanation: "Officially announced in livestream or developer patch notes. High-certainty canon.",
      independentSourceCount: 1,
      supportingEvidenceCount: evidence.length,
      contradictingEvidenceCount: 0,
      repostCount: 0,
    };
  }

  // 2. Deduplicate evidence and extract independent supporting/contradicting sets
  const { uniqueSupporting, uniqueContradicting, reposts } = deduplicateEvidence(evidence);

  // Group independent sources (by unique source ID or platform when independent)
  const independentSupportingSources = new Set(uniqueSupporting.map((e) => e.source.id));
  const independentContradictingSources = new Set(uniqueContradicting.map((e) => e.source.id));
  const totalIndependent = independentSupportingSources.size;

  // 3. Insufficient evidence check
  if (uniqueSupporting.length === 0) {
    return {
      probabilityPercentage: 0,
      confidenceLevel: "Insufficient Evidence",
      status: "Unverified",
      isOfficiallyConfirmed: false,
      hasInsufficientEvidence: true,
      breakdown: {
        historicalSourceAccuracy: { weight: 0.3, rawScore: 0, weightedScore: 0, explanation: "No supporting sources submitted." },
        independentSourceAgreement: { weight: 0.25, rawScore: 0, weightedScore: 0, independentCount: 0, explanation: "No independent corroboration." },
        evidenceCredibility: { weight: 0.2, rawScore: 0, weightedScore: 0, explanation: "No credible evidence items." },
        evidenceFreshness: { weight: 0.15, rawScore: 0, weightedScore: 0, avgAgeDays: 0, explanation: "No recent reports." },
        consistencyWithOtherEvidence: { weight: 0.1, rawScore: 0, weightedScore: 0, contradictionCount: uniqueContradicting.length, explanation: "No verified reports." },
      },
      summaryExplanation: "Insufficient evidence to produce an estimate. Community submissions needed.",
      independentSourceCount: 0,
      supportingEvidenceCount: 0,
      contradictingEvidenceCount: uniqueContradicting.length,
      repostCount: reposts.length,
    };
  }

  // 4. Calculate Factor 1: Historical Source Accuracy (30%)
  const avgSourceAccuracy =
    uniqueSupporting.reduce((sum, e) => sum + (e.source.historicalAccuracy || 0.5), 0) / uniqueSupporting.length;
  const rawScoreAccuracy = Math.round(avgSourceAccuracy * 100);
  const weightedAccuracy = Math.round(rawScoreAccuracy * WEIGHTS.SOURCE_ACCURACY);

  // 5. Calculate Factor 2: Independent Source Agreement (25%)
  // 1 source = 40%, 2 sources = 70%, 3 sources = 88%, 4+ sources = 100%
  let rawScoreAgreement = 40;
  if (totalIndependent >= 4) rawScoreAgreement = 100;
  else if (totalIndependent === 3) rawScoreAgreement = 88;
  else if (totalIndependent === 2) rawScoreAgreement = 70;
  else rawScoreAgreement = 40;
  const weightedAgreement = Math.round(rawScoreAgreement * WEIGHTS.INDEPENDENT_AGREEMENT);

  // 6. Calculate Factor 3: Evidence Credibility (20%)
  // Based on claim type weights & credibility scores
  const claimWeights: Record<string, number> = {
    "Beta Datamine": 0.95,
    "Event Leak": 0.85,
    "Story Leak": 0.75,
    "Insider Whisper": 0.55,
    "Speculation": 0.25,
    "Official Teaser": 1.0,
  };
  const avgCredibility =
    uniqueSupporting.reduce((sum, e) => {
      const typeW = claimWeights[e.claimType] ?? 0.5;
      return sum + (e.credibilityScore * 0.6 + typeW * 0.4);
    }, 0) / uniqueSupporting.length;
  const rawScoreCredibility = Math.round(avgCredibility * 100);
  const weightedCredibility = Math.round(rawScoreCredibility * WEIGHTS.CREDIBILITY);

  // 7. Calculate Factor 4: Evidence Freshness (15%)
  let totalAge = 0;
  let totalFreshnessScore = 0;
  for (const item of uniqueSupporting) {
    const { score, ageDays } = calculateFreshness(item.publishedAt, refTime);
    totalFreshnessScore += score;
    totalAge += ageDays;
  }
  const avgFreshness = totalFreshnessScore / uniqueSupporting.length;
  const avgAgeDays = Math.round(totalAge / uniqueSupporting.length);
  const rawScoreFreshness = Math.round(avgFreshness * 100);
  const weightedFreshness = Math.round(rawScoreFreshness * WEIGHTS.FRESHNESS);

  // 8. Calculate Factor 5: Consistency with Other Evidence (10%)
  // Contradicting reports deduct heavily from consistency
  const contradictionCount = uniqueContradicting.length;
  let rawScoreConsistency = 100;
  if (contradictionCount >= 3) rawScoreConsistency = 10;
  else if (contradictionCount === 2) rawScoreConsistency = 35;
  else if (contradictionCount === 1) rawScoreConsistency = 65;
  const weightedConsistency = Math.round(rawScoreConsistency * WEIGHTS.CONSISTENCY);

  // Sum initial weighted score
  let totalProbability = weightedAccuracy + weightedAgreement + weightedCredibility + weightedFreshness + weightedConsistency;

  // Stale penalty if all evidence is > 60 days old
  const isStale = avgAgeDays > 60;
  if (isStale) {
    totalProbability = Math.round(totalProbability * 0.65);
  }

  // Contradiction penalty deduction on overall score
  if (contradictionCount > 0) {
    const penaltyRatio = Math.min(0.40, contradictionCount * 0.15);
    totalProbability = Math.max(5, Math.round(totalProbability * (1 - penaltyRatio)));
  }

  // Bound to 0 - 95% (Community predictions can never claim 100% without official confirmation)
  totalProbability = Math.max(5, Math.min(95, totalProbability));

  // Determine prediction status
  let status: PredictionStatus = "Developing";
  if (isStale) {
    status = "Stale";
  } else if (contradictionCount >= 2 && contradictionCount >= uniqueSupporting.length) {
    status = "Disputed";
  } else if (totalProbability >= 75 && totalIndependent >= 2) {
    status = "Corroborated";
  } else if (totalProbability >= 50) {
    status = "Developing";
  } else {
    status = "Unverified";
  }

  // Determine confidence level label
  let confidenceLevel: ConfidenceLevel = "Moderate";
  if (totalIndependent < 2 && rawScoreCredibility < 50) {
    confidenceLevel = "Insufficient Evidence";
  } else if (totalProbability >= 80) {
    confidenceLevel = "Very High";
  } else if (totalProbability >= 65) {
    confidenceLevel = "High";
  } else if (totalProbability >= 45) {
    confidenceLevel = "Moderate";
  } else {
    confidenceLevel = "Low";
  }

  const breakdown: FactorBreakdown = {
    historicalSourceAccuracy: {
      weight: 0.30,
      rawScore: rawScoreAccuracy,
      weightedScore: weightedAccuracy,
      explanation: `Sources have an average accuracy rate of ${rawScoreAccuracy}% based on past predictions.`,
    },
    independentSourceAgreement: {
      weight: 0.25,
      rawScore: rawScoreAgreement,
      weightedScore: weightedAgreement,
      independentCount: totalIndependent,
      explanation: `${totalIndependent} independent source(s) corroborate this banner prediction (${reposts.length} duplicate/repost reports filtered).`,
    },
    evidenceCredibility: {
      weight: 0.20,
      rawScore: rawScoreCredibility,
      weightedScore: weightedCredibility,
      explanation: `Credibility assessed at ${rawScoreCredibility}% based on datamines, asset proofs, and claim tiers.`,
    },
    evidenceFreshness: {
      weight: 0.15,
      rawScore: rawScoreFreshness,
      weightedScore: weightedFreshness,
      avgAgeDays,
      explanation: `Average report age is ${avgAgeDays} day(s). ${isStale ? "Penalty applied for stale information." : "Freshness intact."}`,
    },
    consistencyWithOtherEvidence: {
      weight: 0.10,
      rawScore: rawScoreConsistency,
      weightedScore: weightedConsistency,
      contradictionCount,
      explanation: contradictionCount > 0
        ? `${contradictionCount} contradicting report(s) found and penalized.`
        : "No conflicting banner reports recorded.",
    },
  };

  const summaryExplanation = `Estimated probability calculated at ${totalProbability}%. ${
    totalIndependent >= 2 ? `Corroborated by ${totalIndependent} distinct sources.` : "Single-source claim pending independent confirmation."
  } ${contradictionCount > 0 ? `Reduced by ${contradictionCount} conflicting report(s).` : ""}`;

  return {
    probabilityPercentage: totalProbability,
    confidenceLevel,
    status,
    isOfficiallyConfirmed: false,
    hasInsufficientEvidence: confidenceLevel === "Insufficient Evidence",
    breakdown,
    summaryExplanation,
    independentSourceCount: totalIndependent,
    supportingEvidenceCount: uniqueSupporting.length,
    contradictingEvidenceCount: contradictionCount,
    repostCount: reposts.length,
  };
}
