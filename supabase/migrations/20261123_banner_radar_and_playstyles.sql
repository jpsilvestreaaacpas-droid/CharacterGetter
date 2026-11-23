-- =====================================================================
-- CHARACTER GETTER: COMMUNITY BANNER RADAR & PLAYSTYLE ARCHETYPE SCHEMA
-- Target Database: Supabase PostgreSQL (with Row Level Security)
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================
-- 2. COMMUNITY BANNER RADAR SYSTEM
-- =====================================================================

-- Community Sources (Leakers, Creators, Aggregators, Official Accounts)
CREATE TABLE IF NOT EXISTS public.community_sources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('Reddit', 'Discord', 'YouTube', 'X', 'Bilibili', 'Weibo', 'Official', 'Community')),
    url TEXT,
    avatar_url TEXT,
    reliability_score NUMERIC(4,3) DEFAULT 0.500 CHECK (reliability_score >= 0 AND reliability_score <= 1),
    is_verified BOOLEAN DEFAULT FALSE,
    is_official BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Historical Source Accuracy Tracking
CREATE TABLE IF NOT EXISTS public.source_reliability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id TEXT REFERENCES public.community_sources(id) ON DELETE CASCADE,
    total_predictions INT DEFAULT 0,
    correct_predictions INT DEFAULT 0,
    partially_correct_predictions INT DEFAULT 0,
    incorrect_predictions INT DEFAULT 0,
    accuracy_rate NUMERIC(5,2) GENERATED ALWAYS AS (
        CASE WHEN total_predictions > 0 THEN (correct_predictions::NUMERIC / total_predictions::NUMERIC) * 100 ELSE 50.00 END
    ) STORED,
    last_evaluated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community Posts (Collected via API or submitted with source attribution)
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id TEXT REFERENCES public.community_sources(id) ON DELETE SET NULL,
    external_id TEXT,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    author TEXT NOT NULL,
    content TEXT,
    is_original BOOLEAN DEFAULT TRUE,
    repost_of_id UUID REFERENCES public.community_posts(id) ON DELETE SET NULL,
    content_hash TEXT,
    published_at TIMESTAMPTZ NOT NULL,
    collected_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_community_posts_source ON public.community_posts(source_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_hash ON public.community_posts(content_hash);
CREATE INDEX IF NOT EXISTS idx_community_posts_published ON public.community_posts(published_at);

-- Banner Rumors / Predictions
CREATE TABLE IF NOT EXISTS public.banner_rumors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id TEXT NOT NULL,
    version TEXT NOT NULL, -- e.g. "5.5", "5.6"
    phase INT CHECK (phase IN (1, 2, NULL)), -- Phase 1 or 2
    banner_type TEXT DEFAULT 'CHARACTER_EVENT' CHECK (banner_type IN ('CHARACTER_EVENT', 'CHRONICLED_WISH')),
    status TEXT NOT NULL DEFAULT 'Unverified' CHECK (
        status IN ('Unverified', 'Developing', 'Corroborated', 'Disputed', 'Officially confirmed', 'Disproven', 'Stale')
    ),
    is_rerun BOOLEAN DEFAULT TRUE,
    probability_score INT DEFAULT 0 CHECK (probability_score >= 0 AND probability_score <= 100),
    confidence_level TEXT DEFAULT 'Low' CHECK (confidence_level IN ('Low', 'Moderate', 'High', 'Very High', 'Official')),
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (character_id, version, phase, banner_type)
);

CREATE INDEX IF NOT EXISTS idx_banner_rumors_char ON public.banner_rumors(character_id);
CREATE INDEX IF NOT EXISTS idx_banner_rumors_ver ON public.banner_rumors(version);
CREATE INDEX IF NOT EXISTS idx_banner_rumors_status ON public.banner_rumors(status);

-- Rumor Evidence (Supports, corroborates, or refutes a rumor)
CREATE TABLE IF NOT EXISTS public.rumor_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rumor_id UUID REFERENCES public.banner_rumors(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
    source_id TEXT REFERENCES public.community_sources(id) ON DELETE SET NULL,
    stance TEXT NOT NULL CHECK (stance IN ('Supports', 'Contradicts', 'Mentions')),
    claim_type TEXT NOT NULL CHECK (claim_type IN ('Beta Datamine', 'Story Leak', 'Event Leak', 'Insider Whisper', 'Speculation', 'Official Teaser')),
    credibility_weight NUMERIC(3,2) DEFAULT 0.50,
    freshness_score NUMERIC(3,2) DEFAULT 1.00,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rumor_evidence_rumor ON public.rumor_evidence(rumor_id);

-- Rumor Status History (Audit trail of probability and status adjustments)
CREATE TABLE IF NOT EXISTS public.rumor_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rumor_id UUID REFERENCES public.banner_rumors(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    old_probability INT,
    new_probability INT NOT NULL,
    change_reason TEXT,
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community Submissions (Moderation queue for user-submitted links)
CREATE TABLE IF NOT EXISTS public.community_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    character_id TEXT NOT NULL,
    version TEXT NOT NULL,
    phase INT,
    source_url TEXT NOT NULL,
    source_platform TEXT NOT NULL,
    evidence_description TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'duplicate')),
    moderator_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prediction Outcomes (Verification when official banners drop)
CREATE TABLE IF NOT EXISTS public.prediction_outcomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rumor_id UUID REFERENCES public.banner_rumors(id) ON DELETE CASCADE,
    actual_character_id TEXT NOT NULL,
    actual_version TEXT NOT NULL,
    actual_phase INT,
    was_correct BOOLEAN NOT NULL,
    evaluated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 3. CHARACTER PLAYSTYLE & BUILD ARCHETYPE SYSTEM
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.character_playstyles (
    id TEXT PRIMARY KEY, -- e.g. "furina-subdps", "furina-healer", "furina-c6-dps"
    character_id TEXT NOT NULL,
    name TEXT NOT NULL, -- e.g. "Off-Field Sub-DPS & Buffer"
    combat_role TEXT NOT NULL CHECK (combat_role IN ('Main DPS', 'Sub DPS', 'Support', 'Healer', 'Shielder', 'Driver')),
    description TEXT NOT NULL,
    gameplay_mechanics TEXT NOT NULL,
    scaling_attributes TEXT[] NOT NULL, -- e.g. ARRAY['HP', 'Energy Recharge', 'CRIT']
    investment_level TEXT NOT NULL CHECK (investment_level IN ('Low', 'Medium', 'High', 'Very High')),
    is_community_tested BOOLEAN DEFAULT TRUE,
    is_official_confirmed BOOLEAN DEFAULT TRUE,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_playstyles_char ON public.character_playstyles(character_id);

CREATE TABLE IF NOT EXISTS public.playstyle_weapons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playstyle_id TEXT REFERENCES public.character_playstyles(id) ON DELETE CASCADE,
    weapon_name TEXT NOT NULL,
    weapon_type TEXT NOT NULL,
    rarity INT NOT NULL,
    tier TEXT NOT NULL CHECK (tier IN ('Best-in-Slot', 'Competitive Alternative', 'Free-to-Play', 'Comfort Option')),
    refinement_recommended TEXT DEFAULT 'R1',
    why_recommended TEXT NOT NULL,
    display_order INT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.playstyle_artifacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playstyle_id TEXT REFERENCES public.character_playstyles(id) ON DELETE CASCADE,
    set_names TEXT[] NOT NULL,
    piece_bonus TEXT NOT NULL CHECK (piece_bonus IN ('4-Piece', '2-Piece + 2-Piece', 'Special')),
    tier TEXT NOT NULL CHECK (tier IN ('Best-in-Slot', 'Viable Alternative', 'Transitional')),
    why_recommended TEXT NOT NULL,
    display_order INT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.playstyle_stat_priorities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playstyle_id TEXT REFERENCES public.character_playstyles(id) ON DELETE CASCADE UNIQUE,
    sands_main TEXT[] NOT NULL,
    goblet_main TEXT[] NOT NULL,
    circlet_main TEXT[] NOT NULL,
    substat_priority TEXT[] NOT NULL,
    er_requirement TEXT NOT NULL,
    target_benchmarks JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.playstyle_team_compositions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playstyle_id TEXT REFERENCES public.character_playstyles(id) ON DELETE CASCADE,
    team_name TEXT NOT NULL,
    reaction_focus TEXT NOT NULL,
    slot_1 TEXT NOT NULL,
    slot_2 TEXT NOT NULL,
    slot_3 TEXT NOT NULL,
    slot_4 TEXT NOT NULL,
    rotation_notes TEXT
);

CREATE TABLE IF NOT EXISTS public.playstyle_rotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playstyle_id TEXT REFERENCES public.character_playstyles(id) ON DELETE CASCADE,
    step_number INT NOT NULL,
    character_name TEXT NOT NULL,
    action_description TEXT NOT NULL,
    energy_notes TEXT
);

CREATE TABLE IF NOT EXISTS public.playstyle_constellation_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playstyle_id TEXT REFERENCES public.character_playstyles(id) ON DELETE CASCADE,
    constellation_level INT NOT NULL CHECK (constellation_level BETWEEN 1 AND 6),
    mechanical_change TEXT NOT NULL,
    gameplay_impact TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.playstyle_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playstyle_id TEXT REFERENCES public.character_playstyles(id) ON DELETE CASCADE,
    source_name TEXT NOT NULL, -- e.g. "KeqingMains (KQM)", "Zajef77", "Community Theorycrafting"
    url TEXT,
    last_verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

ALTER TABLE public.community_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_reliability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banner_rumors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rumor_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rumor_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_playstyles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playstyle_weapons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playstyle_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playstyle_stat_priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playstyle_team_compositions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playstyle_rotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playstyle_constellation_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playstyle_sources ENABLE ROW LEVEL SECURITY;

-- Public Reference Data: Read-only for all users (anon and authenticated)
CREATE POLICY "Public read for community_sources" ON public.community_sources FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read for source_reliability" ON public.source_reliability FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read for community_posts" ON public.community_posts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read for banner_rumors" ON public.banner_rumors FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read for rumor_evidence" ON public.rumor_evidence FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read for rumor_status_history" ON public.rumor_status_history FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read for prediction_outcomes" ON public.prediction_outcomes FOR SELECT TO anon, authenticated USING (true);

-- Playstyles: Public read for all reference builds
CREATE POLICY "Public read for character_playstyles" ON public.character_playstyles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read for playstyle_weapons" ON public.playstyle_weapons FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read for playstyle_artifacts" ON public.playstyle_artifacts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read for playstyle_stat_priorities" ON public.playstyle_stat_priorities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read for playstyle_team_compositions" ON public.playstyle_team_compositions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read for playstyle_rotations" ON public.playstyle_rotations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read for playstyle_constellation_changes" ON public.playstyle_constellation_changes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read for playstyle_sources" ON public.playstyle_sources FOR SELECT TO anon, authenticated USING (true);

-- Community Submissions: Users can submit new links and view their own submissions
CREATE POLICY "Authenticated users can submit" ON public.community_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users can view submissions" ON public.community_submissions FOR SELECT TO anon, authenticated USING (true);
