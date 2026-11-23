import { describe, it, expect } from "vitest";
import {
  evaluateBannerProbability,
  calculateFreshness,
  deduplicateEvidence,
  RadarEvidenceItem,
  RadarSource,
} from "./probability-engine";

const mockSourceA: RadarSource = {
  id: "homdgcat",
  name: "HomDGCat Datamines",
  platform: "Community",
  historicalAccuracy: 0.95,
};

const mockSourceB: RadarSource = {
  id: "chalice",
  name: "Team Chalice",
  platform: "Discord",
  historicalAccuracy: 0.85,
};

const mockSourceC: RadarSource = {
  id: "reddit-rumor",
  name: "GenshinLeaks Reddit",
  platform: "Reddit",
  historicalAccuracy: 0.70,
};

const mockSourceOfficial: RadarSource = {
  id: "hoyoverse-official",
  name: "HoYoverse Livestream",
  platform: "Official",
  historicalAccuracy: 1.0,
  isOfficial: true,
};

describe("calculateFreshness", () => {
  it("gives 1.0 score for recent reports within 7 days", () => {
    const recent = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const result = calculateFreshness(recent);
    expect(result.score).toBe(1.0);
    expect(result.ageDays).toBe(2);
  });

  it("penalizes reports older than 90 days", () => {
    const old = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString();
    const result = calculateFreshness(old);
    expect(result.score).toBe(0.10);
    expect(result.ageDays).toBe(100);
  });
});

describe("deduplicateEvidence", () => {
  it("filters out duplicate URLs and explicit reposts", () => {
    const evidence: RadarEvidenceItem[] = [
      {
        id: "ev-1",
        source: mockSourceA,
        url: "https://t.me/homdgcat/123",
        publishedAt: new Date().toISOString(),
        stance: "Supports",
        claimType: "Beta Datamine",
        credibilityScore: 0.95,
      },
      {
        id: "ev-2",
        source: mockSourceC,
        url: "https://t.me/homdgcat/123", // exact duplicate URL
        publishedAt: new Date().toISOString(),
        stance: "Supports",
        claimType: "Speculation",
        credibilityScore: 0.6,
      },
      {
        id: "ev-3",
        source: mockSourceB,
        url: "https://discord.com/channels/1/2",
        publishedAt: new Date().toISOString(),
        stance: "Supports",
        claimType: "Event Leak",
        credibilityScore: 0.85,
        isRepost: true, // tagged repost
      },
    ];

    const { uniqueSupporting, reposts } = deduplicateEvidence(evidence);
    expect(uniqueSupporting.length).toBe(1);
    expect(reposts.length).toBe(2);
  });
});

describe("evaluateBannerProbability", () => {
  it("returns 100% and 'Official' for developer announcements", () => {
    const evidence: RadarEvidenceItem[] = [
      {
        id: "ev-official",
        source: mockSourceOfficial,
        url: "https://genshin.hoyoverse.com/en/news/detail/123",
        publishedAt: new Date().toISOString(),
        stance: "Supports",
        claimType: "Official Teaser",
        credibilityScore: 1.0,
      },
    ];

    const result = evaluateBannerProbability(evidence);
    expect(result.probabilityPercentage).toBe(100);
    expect(result.status).toBe("Officially confirmed");
    expect(result.isOfficiallyConfirmed).toBe(true);
    expect(result.confidenceLevel).toBe("Official");
  });

  it("handles empty / insufficient evidence safely", () => {
    const result = evaluateBannerProbability([]);
    expect(result.hasInsufficientEvidence).toBe(true);
    expect(result.probabilityPercentage).toBe(0);
    expect(result.status).toBe("Unverified");
  });

  it("calculates high probability for multiple independent credible sources", () => {
    const now = new Date().toISOString();
    const evidence: RadarEvidenceItem[] = [
      {
        id: "ev-1",
        source: mockSourceA,
        url: "https://example.com/source-a",
        publishedAt: now,
        stance: "Supports",
        claimType: "Beta Datamine",
        credibilityScore: 0.95,
      },
      {
        id: "ev-2",
        source: mockSourceB,
        url: "https://example.com/source-b",
        publishedAt: now,
        stance: "Supports",
        claimType: "Event Leak",
        credibilityScore: 0.90,
      },
    ];

    const result = evaluateBannerProbability(evidence);
    expect(result.probabilityPercentage).toBeGreaterThanOrEqual(75);
    expect(result.status).toBe("Corroborated");
    expect(result.independentSourceCount).toBe(2);
    expect(result.breakdown.independentSourceAgreement.weightedScore).toBeGreaterThan(0);
  });

  it("penalizes contradictory evidence appropriately", () => {
    const now = new Date().toISOString();
    const cleanEvidence: RadarEvidenceItem[] = [
      {
        id: "ev-1",
        source: mockSourceA,
        url: "https://example.com/source-a",
        publishedAt: now,
        stance: "Supports",
        claimType: "Beta Datamine",
        credibilityScore: 0.90,
      },
    ];

    const conflictingEvidence: RadarEvidenceItem[] = [
      ...cleanEvidence,
      {
        id: "ev-contra",
        source: mockSourceC,
        url: "https://example.com/contra",
        publishedAt: now,
        stance: "Contradicts",
        claimType: "Insider Whisper",
        credibilityScore: 0.70,
      },
    ];

    const cleanResult = evaluateBannerProbability(cleanEvidence);
    const conflictingResult = evaluateBannerProbability(conflictingEvidence);

    expect(conflictingResult.probabilityPercentage).toBeLessThan(cleanResult.probabilityPercentage);
    expect(conflictingResult.contradictingEvidenceCount).toBe(1);
    expect(conflictingResult.breakdown.consistencyWithOtherEvidence.contradictionCount).toBe(1);
  });
});
