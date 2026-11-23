import { PlaystyleArchetype } from "../data/playstyles";

export interface PlayerCharacterState {
  characterId: string;
  level: number;
  constellation: number;
  talentNormal: number;
  talentSkill: number;
  talentBurst: number;
  equippedWeaponName?: string;
  equippedArtifactSet1?: string;
  equippedArtifactSet2?: string;
  sandsMainStat?: string;
  gobletMainStat?: string;
  circletMainStat?: string;
}

export interface PlaystyleEvaluationReport {
  overallSuitabilityScore: number; // 0 - 100%
  weaponAssessment: {
    isEquipped: boolean;
    weaponName?: string;
    tier?: string;
    isOptimal: boolean;
    recommendation: string;
    alternativesToConsider: string[];
  };
  artifactAssessment: {
    setMatch: "Perfect 4pc" | "Viable 2pc+2pc" | "Mismatched" | "Not Set";
    currentSets: string[];
    recommendation: string;
    statPrioritiesNotice: string;
  };
  talentAssessment: {
    currentSummary: string;
    recommendedPriority: string;
    actionableAdvice: string;
  };
  constellationImpact: {
    currentConstellation: number;
    activeBuffs: string[];
    nextPowerSpike?: string;
  };
  teamCompatibility: {
    compatiblePresetTeams: {
      teamName: string;
      ownedTeammates: string[];
      missingTeammates: string[];
      isFullTeamOwned: boolean;
      synergyDescription: string;
    }[];
  };
  upgradeChecklist: string[];
}

export function analyzePlayerBuildAgainstPlaystyle(
  playerChar: PlayerCharacterState,
  playstyle: PlaystyleArchetype,
  ownedCharacterIds: string[] = []
): PlaystyleEvaluationReport {
  const upgradeChecklist: string[] = [];
  let score = 100;

  // 1. Weapon Assessment
  const equippedWeapon = playstyle.recommendedWeapons.find(
    (w) => w.name.toLowerCase() === (playerChar.equippedWeaponName || "").toLowerCase()
  );
  const isBisWeapon = equippedWeapon?.tier === "Best-in-Slot";
  const isViableWeapon = Boolean(equippedWeapon);

  let weaponRec = "";
  if (!playerChar.equippedWeaponName) {
    score -= 25;
    weaponRec = `Equip a recommended weapon. Best option: ${playstyle.recommendedWeapons[0]?.name} (${playstyle.recommendedWeapons[0]?.tier}). F2P option: ${
      playstyle.recommendedWeapons.find((w) => w.tier === "Free-to-Play")?.name ?? "Craftable alternative"
    }.`;
    upgradeChecklist.push("Equip recommended weapon");
  } else if (isBisWeapon) {
    weaponRec = `✓ ${playerChar.equippedWeaponName} is the Best-in-Slot choice: ${equippedWeapon?.whyRecommended}`;
  } else if (isViableWeapon) {
    score -= 5;
    weaponRec = `${playerChar.equippedWeaponName} is a solid ${equippedWeapon?.tier}. To maximize damage, consider aiming for ${playstyle.recommendedWeapons[0]?.name}.`;
  } else {
    score -= 18;
    weaponRec = `${playerChar.equippedWeaponName} does not synergize well with this playstyle. Switch to ${playstyle.recommendedWeapons[0]?.name} or ${
      playstyle.recommendedWeapons.find((w) => w.tier === "Free-to-Play")?.name || "Favonius weapon"
    }.`;
    upgradeChecklist.push(`Replace ${playerChar.equippedWeaponName} with a synergy weapon`);
  }

  // 2. Artifact Assessment
  let setMatch: "Perfect 4pc" | "Viable 2pc+2pc" | "Mismatched" | "Not Set" = "Not Set";
  let artifactRec = "";

  const bisArtifact = playstyle.recommendedArtifacts.find((a) => a.tier === "Best-in-Slot");
  const s1 = playerChar.equippedArtifactSet1;
  const s2 = playerChar.equippedArtifactSet2;

  if (s1 && bisArtifact?.pieceBonus === "4-Piece" && bisArtifact.setNames.includes(s1)) {
    setMatch = "Perfect 4pc";
    artifactRec = `✓ 4-Piece ${s1} is active. Full bonus utilized: ${bisArtifact.whyRecommended}`;
  } else if (s1 && s2) {
    setMatch = "Viable 2pc+2pc";
    score -= 8;
    artifactRec = `Running 2pc ${s1} + 2pc ${s2}. Viable transitional setup, but 4pc ${bisArtifact?.setNames[0]} provides a higher damage ceiling.`;
    upgradeChecklist.push(`Farm 4-Piece ${bisArtifact?.setNames[0]}`);
  } else if (!s1) {
    setMatch = "Not Set";
    score -= 20;
    artifactRec = `No artifact set registered. Farm 4-Piece ${bisArtifact?.setNames[0] ?? "recommended set"}.`;
    upgradeChecklist.push(`Equip 4-Piece ${bisArtifact?.setNames[0] ?? "recommended set"}`);
  } else {
    setMatch = "Mismatched";
    score -= 15;
    artifactRec = `Equipped set does not match ${playstyle.name} recommendations. Target: ${bisArtifact?.setNames.join(" / ")}.`;
    upgradeChecklist.push(`Swap to 4-Piece ${bisArtifact?.setNames[0]}`);
  }

  // 3. Talent Assessment
  const { normal, skill, burst, notes } = playstyle.talentPriority;
  const talentParts: string[] = [];
  if (normal === 1 && playerChar.talentNormal < 9) {
    upgradeChecklist.push(`Level Normal Attack (currently Lv ${playerChar.talentNormal}, priority 1)`);
    score -= 6;
  }
  if (skill === 1 && playerChar.talentSkill < 9) {
    upgradeChecklist.push(`Level Elemental Skill (currently Lv ${playerChar.talentSkill}, priority 1)`);
    score -= 6;
  }
  if (burst === 1 && playerChar.talentBurst < 9) {
    upgradeChecklist.push(`Level Elemental Burst (currently Lv ${playerChar.talentBurst}, priority 1)`);
    score -= 6;
  }

  // 4. Constellations
  const activeConstellationBuffs: string[] = [];
  let nextPowerSpike: string | undefined;

  for (const c of playstyle.constellationChanges) {
    if (playerChar.constellation >= c.level) {
      activeConstellationBuffs.push(`C${c.level}: ${c.impact}`);
    } else if (!nextPowerSpike) {
      nextPowerSpike = `C${c.level}: ${c.mechanicalChange} — ${c.impact}`;
    }
  }

  // 5. Team Compatibility
  const ownedSet = new Set(ownedCharacterIds);
  ownedSet.add(playerChar.characterId); // ensure self is counted

  const compatibleTeams = playstyle.recommendedTeams.map((team) => {
    const ownedTeammates: string[] = [];
    const missingTeammates: string[] = [];

    for (const slot of team.slots) {
      if (ownedSet.has(slot.characterId)) {
        ownedTeammates.push(slot.characterId);
      } else {
        missingTeammates.push(slot.characterId);
      }
    }

    return {
      teamName: team.teamName,
      ownedTeammates,
      missingTeammates,
      isFullTeamOwned: missingTeammates.length === 0,
      synergyDescription: team.synergyNotes,
    };
  });

  const hasFullTeam = compatibleTeams.some((t) => t.isFullTeamOwned);
  if (!hasFullTeam && compatibleTeams.length > 0) {
    score -= 10;
  }

  return {
    overallSuitabilityScore: Math.max(10, Math.min(100, score)),
    weaponAssessment: {
      isEquipped: Boolean(playerChar.equippedWeaponName),
      weaponName: playerChar.equippedWeaponName,
      tier: equippedWeapon?.tier,
      isOptimal: isBisWeapon,
      recommendation: weaponRec,
      alternativesToConsider: playstyle.recommendedWeapons.map((w) => `${w.name} (${w.tier})`),
    },
    artifactAssessment: {
      setMatch,
      currentSets: [s1, s2].filter(Boolean) as string[],
      recommendation: artifactRec,
      statPrioritiesNotice: `Main Stats: Sands (${playstyle.statPriorities.sandsMain.join("/")}), Goblet (${playstyle.statPriorities.gobletMain.join("/")}), Circlet (${playstyle.statPriorities.circletMain.join("/")}). Substats: ${playstyle.statPriorities.substatPriority.join(" > ")}. Target ER: ${playstyle.statPriorities.energyRechargeBenchmark}`,
    },
    talentAssessment: {
      currentSummary: `Normal: Lv ${playerChar.talentNormal} | Skill: Lv ${playerChar.talentSkill} | Burst: Lv ${playerChar.talentBurst}`,
      recommendedPriority: `Priority order: ${burst === 1 ? "Burst > " : ""}${skill === 1 ? "Skill > " : ""}${normal === 1 ? "Normal > " : ""}${notes}`,
      actionableAdvice: upgradeChecklist.find((u) => u.startsWith("Level")) ?? "Talents meet current progression threshold.",
    },
    constellationImpact: {
      currentConstellation: playerChar.constellation,
      activeBuffs: activeConstellationBuffs,
      nextPowerSpike,
    },
    teamCompatibility: {
      compatiblePresetTeams: compatibleTeams,
    },
    upgradeChecklist,
  };
}
