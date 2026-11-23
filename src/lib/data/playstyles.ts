export interface PlaystyleWeapon {
  name: string;
  type: string;
  rarity: number;
  tier: "Best-in-Slot" | "Competitive Alternative" | "Free-to-Play" | "Comfort Option";
  refinement: string;
  whyRecommended: string;
}

export interface PlaystyleArtifactSet {
  setNames: string[];
  pieceBonus: "4-Piece" | "2-Piece + 2-Piece" | "Special";
  tier: "Best-in-Slot" | "Viable Alternative" | "Transitional";
  whyRecommended: string;
}

export interface PlaystyleStatPriority {
  sandsMain: string[];
  gobletMain: string[];
  circletMain: string[];
  substatPriority: string[];
  energyRechargeBenchmark: string;
  statBenchmarks?: Record<string, string>;
}

export interface PlaystyleTeam {
  teamName: string;
  reactionFocus: string;
  slots: { characterId: string; role: string }[];
  synergyNotes: string;
}

export interface PlaystyleRotationStep {
  stepNumber: number;
  characterName: string;
  action: string;
  notes?: string;
}

export interface ConstellationChange {
  level: number;
  mechanicalChange: string;
  impact: string;
}

export interface PlaystyleArchetype {
  id: string; // e.g. "furina-subdps"
  characterId: string;
  characterName: string;
  name: string;
  combatRole: "Main DPS" | "Sub DPS" | "Support" | "Healer" | "Shielder" | "Driver";
  description: string;
  gameplayMechanics: string;
  scalingAttributes: string[];
  investmentLevel: "Low" | "Medium" | "High" | "Very High";
  talentPriority: {
    normal: number; // 1 to 3 priority (1 is highest)
    skill: number;
    burst: number;
    notes: string;
  };
  recommendedWeapons: PlaystyleWeapon[];
  recommendedArtifacts: PlaystyleArtifactSet[];
  statPriorities: PlaystyleStatPriority;
  recommendedTeams: PlaystyleTeam[];
  rotation: PlaystyleRotationStep[];
  constellationChanges: ConstellationChange[];
  sourceReference: {
    author: string;
    publication: string;
    url?: string;
    lastUpdated: string;
  };
}

export const CANONICAL_PLAYSTYLES: PlaystyleArchetype[] = [
  // ── FURINA ────────────────────────────────────────────────────────────
  {
    id: "furina-subdps",
    characterId: "furina",
    characterName: "Furina",
    name: "Off-Field Sub-DPS & Universal Buffer",
    combatRole: "Sub DPS",
    description: "Furina summons Salon Solitaire members to deal continuous Hydro DMG while draining party HP to fuel her Elemental Burst Fanfare buff.",
    gameplayMechanics: "Maintain Ousia Elemental Skill (Salon Solitaire) at 100% uptime. Cast Burst (Let the People Rejoice) off-cooldown. Pair with a teamwide healer to rapidly stack Fanfare points.",
    scalingAttributes: ["Max HP", "Energy Recharge", "CRIT Rate / DMG", "Hydro DMG"],
    investmentLevel: "High",
    talentPriority: {
      burst: 1,
      skill: 2,
      normal: 3,
      notes: "Prioritize Burst for higher Fanfare team DMG bonus, then Skill for personal off-field damage.",
    },
    recommendedWeapons: [
      {
        name: "Splendor of Tranquil Waters",
        type: "Sword",
        rarity: 5,
        tier: "Best-in-Slot",
        refinement: "R1",
        whyRecommended: "Highest personal damage ceiling; buffs Skill DMG and Max HP based on party HP fluctuation.",
      },
      {
        name: "Fleuve Cendre Ferryman",
        type: "Sword",
        rarity: 4,
        tier: "Free-to-Play",
        refinement: "R5",
        whyRecommended: "Excellent F2P weapon obtainable via Fontaine fishing. Provides ER% and Skill CRIT Rate.",
      },
      {
        name: "Favonius Sword",
        type: "Sword",
        rarity: 4,
        tier: "Comfort Option",
        refinement: "R3+",
        whyRecommended: "Top-tier team energy generation. Greatly lowers Furina's personal 160-200% ER requirement.",
      },
    ],
    recommendedArtifacts: [
      {
        setNames: ["Golden Troupe"],
        pieceBonus: "4-Piece",
        tier: "Best-in-Slot",
        whyRecommended: "Provides up to +70% Elemental Skill DMG when Furina is off-field. Unmatched damage boost.",
      },
      {
        setNames: ["Tenacity of the Millelith", "Vourukasha's Glow"],
        pieceBonus: "2-Piece + 2-Piece",
        tier: "Viable Alternative",
        whyRecommended: "Provides +40% Max HP. Strong transitional option while farming Golden Troupe.",
      },
    ],
    statPriorities: {
      sandsMain: ["HP%", "Energy Recharge"],
      gobletMain: ["HP%", "Hydro DMG Bonus"],
      circletMain: ["CRIT Rate", "CRIT DMG", "HP%"],
      substatPriority: ["Energy Recharge (until threshold)", "CRIT Rate / CRIT DMG", "HP%", "Flat HP"],
      energyRechargeBenchmark: "160-180% with double Hydro; 200-220% as solo Hydro.",
      statBenchmarks: {
        "Max HP": "36,000 - 40,000",
        "CRIT Ratio": "70% / 140%+",
      },
    },
    recommendedTeams: [
      {
        teamName: "Neuvillette Hyper-Carry",
        reactionFocus: "Hydro Resonance & Hypercharge",
        slots: [
          { characterId: "neuvillette", role: "Main DPS" },
          { characterId: "furina", role: "Sub DPS & Buffer" },
          { characterId: "kaedehara-kazuha", role: "VV Shred & Buffer" },
          { characterId: "zhongli", role: "Shielder / Interruption RES" },
        ],
        synergyNotes: "Neuvillette's massive self-healing and HP drain stacks Furina's Fanfare almost instantly.",
      },
    ],
    rotation: [
      { stepNumber: 1, characterName: "Furina", action: "Elemental Skill (E) -> Elemental Burst (Q)", notes: "Begins Salon Solitaire attacks and Fanfare accumulation." },
      { stepNumber: 2, characterName: "Zhongli", action: "Hold Skill (E)", notes: "Provides 20% universal RES shred and impenetrable shield." },
      { stepNumber: 3, characterName: "Kazuha", action: "Skill (Hold E) -> Plunge -> Burst (Q)", notes: "Swirls Hydro, granting 40% VV shred and 30%+ Elemental DMG bonus." },
      { stepNumber: 4, characterName: "Neuvillette", action: "Skill -> Burst -> 2x Charged Attacks", notes: "Deals maximized hydro beam damage." },
    ],
    constellationChanges: [
      { level: 1, mechanicalChange: "Grants 150 Fanfare points upon Burst cast and raises cap to 400.", impact: "Immediate 37.5% DMG bonus to entire party from second one." },
      { level: 2, mechanicalChange: "Fanfare accumulation speed increased by 250%; excess stacks increase Furina's Max HP by up to 140%.", impact: "Massive spike in both team buff ramp-up and personal Skill DPS." },
      { level: 6, mechanicalChange: "Normal attacks gain Hydro infusion and can party-heal or deal massive burst damage.", impact: "Enables Furina to consolidate team healing or play on-field Main DPS." },
    ],
    sourceReference: {
      author: "KeqingMains (KQM)",
      publication: "Furina Extended Theorycrafting Guide",
      url: "https://keqingmains.com/furina/",
      lastUpdated: "2024-11-15",
    },
  },
  {
    id: "furina-healer",
    characterId: "furina",
    characterName: "Furina",
    name: "Pneuma Sustained Healer",
    combatRole: "Healer",
    description: "Utilizes Furina's Pneuma Singer of Many Waters form to provide single-target and co-op healing without draining party HP.",
    gameplayMechanics: "Switch arkhe alignment to Pneuma using Charged Attack. Cast Skill to deploy healing singer. Recommended for co-op or overworld exploration where party HP drain is undesirable.",
    scalingAttributes: ["Max HP", "Healing Bonus", "Energy Recharge"],
    investmentLevel: "Low",
    talentPriority: {
      skill: 1,
      burst: 2,
      normal: 3,
      notes: "Singer healing scales purely with Elemental Skill talent level and Max HP.",
    },
    recommendedWeapons: [
      {
        name: "The Dockhand's Assistant",
        type: "Sword",
        rarity: 4,
        tier: "Best-in-Slot",
        refinement: "R1+",
        whyRecommended: "High HP% substat directly increases healing per second.",
      },
      {
        name: "Favonius Sword",
        type: "Sword",
        rarity: 4,
        tier: "Comfort Option",
        refinement: "R1+",
        whyRecommended: "Ensures burst uptime when needed.",
      },
    ],
    recommendedArtifacts: [
      {
        setNames: ["Maiden Beloved", "Ocean-Hued Clam"],
        pieceBonus: "2-Piece + 2-Piece",
        tier: "Best-in-Slot",
        whyRecommended: "+15% Healing Bonus with Max HP bonus for sustained survival.",
      },
    ],
    statPriorities: {
      sandsMain: ["HP%"],
      gobletMain: ["HP%"],
      circletMain: ["Healing Bonus", "HP%"],
      substatPriority: ["HP%", "Flat HP", "Energy Recharge"],
      energyRechargeBenchmark: "140-160%",
    },
    recommendedTeams: [
      {
        teamName: "Overworld Exploration",
        reactionFocus: "Utility & Sustain",
        slots: [
          { characterId: "furina", role: "Healer & Water Walker" },
          { characterId: "kaedehara-kazuha", role: "Mobility & Grouping" },
          { characterId: "zhongli", role: "Mining & Shield" },
          { characterId: "nahida", role: "Resource Gathering" },
        ],
        synergyNotes: "Full utility team with passive healing and exploration advantages.",
      },
    ],
    rotation: [
      { stepNumber: 1, characterName: "Furina", action: "Charged Attack (swap to Pneuma) -> Skill (E)", notes: "Summons healing spirit." },
    ],
    constellationChanges: [],
    sourceReference: {
      author: "Community Theorycrafting",
      publication: "Genshin Alternative Builds Archive",
      lastUpdated: "2024-10-20",
    },
  },

  // ── RAIDEN SHOGUN ─────────────────────────────────────────────────────
  {
    id: "raiden-national",
    characterId: "raiden-shogun",
    characterName: "Raiden Shogun",
    name: "National Driver & Team Battery",
    combatRole: "Driver",
    description: "Classic premier archetype. Drives Xiangling's Pyronado and Xingqiu's Raincutters while refunding massive team energy with Musou Shinsetsu.",
    gameplayMechanics: "Cast Skill at start of rotation. Cycle through party bursts to accumulate Resolve stacks. Unleash Burst and perform 3x Normal+Charged combos to batterise entire team.",
    scalingAttributes: ["Energy Recharge", "ATK%", "Electro DMG Bonus", "CRIT Rate / DMG"],
    investmentLevel: "Medium",
    talentPriority: {
      burst: 1,
      skill: 2,
      normal: 3,
      notes: "Burst damage is the primary contribution; Skill boosts party Burst DMG. Normal attacks during burst scale from Burst talent.",
    },
    recommendedWeapons: [
      {
        name: "Engulfing Lightning",
        type: "Polearm",
        rarity: 5,
        tier: "Best-in-Slot",
        refinement: "R1",
        whyRecommended: "Converts excess Energy Recharge above 100% into bonus ATK%. Peak synergy.",
      },
      {
        name: "The Catch",
        type: "Polearm",
        rarity: 4,
        tier: "Free-to-Play",
        refinement: "R5",
        whyRecommended: "Free fishing weapon offering +32% Burst DMG and +12% Burst CRIT Rate with ER% substat.",
      },
    ],
    recommendedArtifacts: [
      {
        setNames: ["Emblem of Severed Fate"],
        pieceBonus: "4-Piece",
        tier: "Best-in-Slot",
        whyRecommended: "Increases Elemental Burst DMG by 25% of Energy Recharge (up to 75% max). Irreplaceable.",
      },
    ],
    statPriorities: {
      sandsMain: ["Energy Recharge", "ATK%"],
      gobletMain: ["Electro DMG Bonus", "ATK%"],
      circletMain: ["CRIT Rate", "CRIT DMG"],
      substatPriority: ["Energy Recharge (up to 250-270%)", "CRIT Rate / CRIT DMG", "ATK%"],
      energyRechargeBenchmark: "230-270%",
      statBenchmarks: {
        "Energy Recharge": "250%+",
        "CRIT Ratio": "60% / 120%+",
      },
    },
    recommendedTeams: [
      {
        teamName: "Raiden National (Rational)",
        reactionFocus: "Vaporize, Overloaded, Electro-Charged",
        slots: [
          { characterId: "raiden-shogun", role: "Driver & Energy Battery" },
          { characterId: "xiangling", role: "Off-field Pyro DPS" },
          { characterId: "xingqiu", role: "Off-field Hydro DPS" },
          { characterId: "bennett", role: "Attack Buffer & Healer" },
        ],
        synergyNotes: "Triple simultaneous reactions while Raiden refunds the 80-cost bursts of Xiangling and Xingqiu.",
      },
    ],
    rotation: [
      { stepNumber: 1, characterName: "Raiden", action: "Skill (E)", notes: "Buffs all team Burst DMG." },
      { stepNumber: 2, characterName: "Xingqiu", action: "Burst (Q) -> Skill (E)", notes: "Hydro application and Rain Swords." },
      { stepNumber: 3, characterName: "Bennett", action: "Burst (Q) -> Skill (E)", notes: "Massive flat ATK field." },
      { stepNumber: 4, characterName: "Xiangling", action: "Burst (Q) -> Skill (E)", notes: "Snapshots Bennett ATK buff." },
      { stepNumber: 5, characterName: "Raiden", action: "Burst (Q) -> 3x (N3C) + N1C", notes: "Massive damage & energy refund." },
    ],
    constellationChanges: [
      { level: 2, mechanicalChange: "Musou no Hitotachi and Musou Isshin attacks ignore 60% of opponents' DEF.", impact: "~44% personal damage jump. Transforms Raiden into an SSS-tier Hypercarry." },
    ],
    sourceReference: {
      author: "KeqingMains (KQM)",
      publication: "Raiden Shogun Guide & ER Calculator",
      url: "https://keqingmains.com/raiden/",
      lastUpdated: "2024-10-10",
    },
  },
  {
    id: "raiden-hyperbloom",
    characterId: "raiden-shogun",
    characterName: "Raiden Shogun",
    name: "Full EM Hyperbloom Trigger",
    combatRole: "Sub DPS",
    description: "Builds pure Elemental Mastery to trigger Dendro cores with Raiden's 0.9s coordinated Electro Skill strikes from off-field.",
    gameplayMechanics: "Press Skill every 25 seconds. Never use Burst. Raiden stays off-field while her Skill automatically snipes Dendro cores from range.",
    scalingAttributes: ["Elemental Mastery", "Character Level (Level 90 is mandatory)"],
    investmentLevel: "Low",
    talentPriority: {
      skill: 1,
      burst: 3,
      normal: 3,
      notes: "Hyperbloom damage scales ONLY with character level and Elemental Mastery; talents can be level 1.",
    },
    recommendedWeapons: [
      {
        name: "Dragon's Bane",
        type: "Polearm",
        rarity: 4,
        tier: "Best-in-Slot",
        refinement: "R1+",
        whyRecommended: "Highest EM substat (221 EM) on a readily available 4-star polearm.",
      },
      {
        name: "Moonpiercer",
        type: "Polearm",
        rarity: 4,
        tier: "Free-to-Play",
        refinement: "R1+",
        whyRecommended: "Craftable Sumeru polearm offering EM substat and ATK leaf drop.",
      },
    ],
    recommendedArtifacts: [
      {
        setNames: ["Flower of Paradise Lost"],
        pieceBonus: "4-Piece",
        tier: "Best-in-Slot",
        whyRecommended: "Increases Hyperbloom damage by up to 140% based on stacks.",
      },
      {
        setNames: ["Gilded Dreams"],
        pieceBonus: "4-Piece",
        tier: "Viable Alternative",
        whyRecommended: "Provides up to 230 EM when teammates are non-Electro. Easier domain to farm.",
      },
    ],
    statPriorities: {
      sandsMain: ["Elemental Mastery"],
      gobletMain: ["Elemental Mastery"],
      circletMain: ["Elemental Mastery"],
      substatPriority: ["Elemental Mastery", "Energy Recharge"],
      energyRechargeBenchmark: "Irrelevant; Burst is not cast.",
      statBenchmarks: {
        "Elemental Mastery": "900 - 1,050 EM",
        "Character Level": "90 (Crucial for transformative reaction base damage)",
      },
    },
    recommendedTeams: [
      {
        teamName: "Nahida Hyperbloom",
        reactionFocus: "Hyperbloom (Dendro + Hydro + Electro)",
        slots: [
          { characterId: "nahida", role: "On-field Dendro Enabler" },
          { characterId: "xingqiu", role: "Hydro Enabler" },
          { characterId: "raiden-shogun", role: "Hyperbloom Trigger (EM)" },
          { characterId: "zhongli", role: "Shield & Universal Shred" },
        ],
        synergyNotes: "Automatic 30,000+ damage Hyperbloom missiles firing every second.",
      },
    ],
    rotation: [
      { stepNumber: 1, characterName: "Raiden", action: "Skill (E)", notes: "25 second duration active." },
      { stepNumber: 2, characterName: "Zhongli", action: "Hold Skill (E)", notes: "Res shred and shield." },
      { stepNumber: 3, characterName: "Xingqiu", action: "Burst (Q) -> Skill (E)", notes: "Hydro application." },
      { stepNumber: 4, characterName: "Nahida", action: "Skill (Hold E) -> Burst (Q) -> Normal Attacks", notes: "Generates continuous Dendro cores." },
    ],
    constellationChanges: [],
    sourceReference: {
      author: "Zajef77",
      publication: "Comprehensive Transformative Reaction Breakdown",
      lastUpdated: "2024-09-18",
    },
  },

  // ── NEUVILLETTE ───────────────────────────────────────────────────────
  {
    id: "neuvillette-hypercarry",
    characterId: "neuvillette",
    characterName: "Neuvillette",
    name: "Sourcewater Torrent Hypercarry",
    combatRole: "Main DPS",
    description: "Dominates the battlefield with continuous Hydro beam Charged Attacks (Equitable Judgment) powered by Sourcewater Droplets.",
    gameplayMechanics: "Trigger 3 distinct Hydro elemental reactions to max out his Past Draconic Glories talent (+160% Charged Attack DMG). Absorb 3 Droplets for instant beam charge.",
    scalingAttributes: ["Max HP", "CRIT Rate / CRIT DMG", "Hydro DMG Bonus", "Energy Recharge"],
    investmentLevel: "Medium",
    talentPriority: {
      normal: 1,
      burst: 2,
      skill: 3,
      notes: "Normal Attack talent levels his Charged Attack beam. Must be crowned first.",
    },
    recommendedWeapons: [
      {
        name: "Tome of the Eternal Flow",
        type: "Catalyst",
        rarity: 5,
        tier: "Best-in-Slot",
        refinement: "R1",
        whyRecommended: "Immense 88.2% CRIT DMG, +16% Max HP, +42% Charged Attack DMG and energy refund.",
      },
      {
        name: "Sacrificial Jade",
        type: "Catalyst",
        rarity: 4,
        tier: "Competitive Alternative",
        refinement: "R5",
        whyRecommended: "Battle Pass catalyst offering 36.8% CRIT Rate and +64% Max HP at R5.",
      },
      {
        name: "Prototype Amber",
        type: "Catalyst",
        rarity: 4,
        tier: "Free-to-Play",
        refinement: "R5",
        whyRecommended: "Craftable weapon giving 41.3% HP, team healing, and 18 flat energy per burst.",
      },
    ],
    recommendedArtifacts: [
      {
        setNames: ["Marechaussee Hunter"],
        pieceBonus: "4-Piece",
        tier: "Best-in-Slot",
        whyRecommended: "Provides +15% Normal/Charged DMG and +36% free CRIT Rate as Neuvillette drains and heals HP.",
      },
    ],
    statPriorities: {
      sandsMain: ["HP%"],
      gobletMain: ["Hydro DMG Bonus", "HP%"],
      circletMain: ["CRIT DMG", "HP%"],
      substatPriority: ["CRIT DMG", "HP%", "CRIT Rate (up to 64% with 4pc Marechaussee)", "Energy Recharge"],
      energyRechargeBenchmark: "120-130% with Prototype Amber; 140% with signature weapon.",
      statBenchmarks: {
        "Max HP": "38,000 - 45,000",
        "CRIT Ratio": "55-64% CRIT Rate / 220%+ CRIT DMG",
      },
    },
    recommendedTeams: [
      {
        teamName: "Rainbow Draconic Glory",
        reactionFocus: "Vaporize, Electro-Charged, Swirl (Max Draconic Stacks)",
        slots: [
          { characterId: "neuvillette", role: "Main DPS" },
          { characterId: "furina", role: "Sub DPS & Fanfare Buffer" },
          { characterId: "kaedehara-kazuha", role: "VV Shred & Hydro DMG Buffer" },
          { characterId: "zhongli", role: "Interruption Immunity & Res Shred" },
        ],
        synergyNotes: "With C0 Neuvillette, Furina takes 1 stack of Draconic Glory but her Fanfare buff more than compensates.",
      },
    ],
    rotation: [
      { stepNumber: 1, characterName: "Neuvillette", action: "Skill (E)", notes: "Creates 3 Droplets." },
      { stepNumber: 2, characterName: "Furina", action: "Skill (E) -> Burst (Q)", notes: "Buff and summon." },
      { stepNumber: 3, characterName: "Kazuha", action: "Skill (E) -> Plunge", notes: "Swirls Hydro." },
      { stepNumber: 4, characterName: "Zhongli", action: "Hold Skill (E)", notes: "Shields." },
      { stepNumber: 5, characterName: "Neuvillette", action: "Absorb Droplets -> Charged Attack -> Burst (Q) -> 2x Charged Attacks", notes: "Extended beam devastation." },
    ],
    constellationChanges: [
      { level: 1, mechanicalChange: "Starts with 1 stack of Past Draconic Glories automatically and grants complete interruption immunity during Charged Attacks.", impact: "Completely frees team building from shielders like Zhongli; allows full Furina synergy without losing third Draconic stack." },
    ],
    sourceReference: {
      author: "KeqingMains (KQM)",
      publication: "Neuvillette In-Depth Guide",
      url: "https://keqingmains.com/neuvillette/",
      lastUpdated: "2024-11-01",
    },
  },
];

export function getPlaystylesForCharacter(characterId: string): PlaystyleArchetype[] {
  return CANONICAL_PLAYSTYLES.filter((p) => p.characterId === characterId);
}
