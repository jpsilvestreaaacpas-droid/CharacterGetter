-- =====================================================================
-- CHARACTER GETTER: CENTRALIZED CALCULATION AND EVIDENCE SOURCE SYSTEM
-- Target Database: Supabase PostgreSQL (with Row Level Security)
-- =====================================================================

-- 1. CALCULATION SOURCES
-- Tracks authoritative entities, theorycrafting bodies, official rules, & tools.
CREATE TABLE IF NOT EXISTS public.calculation_sources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'OFFICIAL_HOYOVERSE',
        'KQM_THEORYCRAFTING',
        'KQM_STANDARDS',
        'GENSHIN_OPTIMIZER',
        'GCSIM',
        'COMMUNITY_SHEETS_TESTING',
        'COMMUNITY_DISCUSSION'
    )),
    url TEXT,
    description TEXT NOT NULL,
    priority_rank INT NOT NULL DEFAULT 5, -- 1 = highest authority (Official rules), 7 = lowest (Discussions)
    is_authoritative BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CALCULATION METHODS & FORMULAS
-- Catalog of standardized formulas and algorithms used across M1–M3 and beyond.
CREATE TABLE IF NOT EXISTS public.calculation_methods (
    id TEXT PRIMARY KEY,
    module TEXT NOT NULL CHECK (module IN ('M1_FOUNDATION', 'M2_CHARACTERS', 'M3_PULL_PLANNER', 'M4_PROGRESSION', 'M5_TEAMS', 'M6_RADAR')),
    name TEXT NOT NULL,
    summary TEXT NOT NULL,
    formula_expression TEXT,
    underlying_mechanics TEXT NOT NULL,
    default_assumptions JSONB DEFAULT '[]'::jsonb,
    known_limitations TEXT,
    primary_source_id TEXT REFERENCES public.calculation_sources(id) ON DELETE SET NULL,
    verification_status TEXT NOT NULL DEFAULT 'VERIFIED' CHECK (verification_status IN (
        'VERIFIED',
        'CORROBORATED',
        'EMPIRICAL_SIMULATION',
        'HEURISTIC_ESTIMATE',
        'INSUFFICIENT_EVIDENCE'
    )),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CALCULATION VERSIONS
-- Historic revisions to formulas (e.g. game patch mechanic changes).
CREATE TABLE IF NOT EXISTS public.calculation_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    method_id TEXT NOT NULL REFERENCES public.calculation_methods(id) ON DELETE CASCADE,
    version_tag TEXT NOT NULL, -- e.g. "v1.0.0", "v5.0-natlan-update"
    game_version TEXT, -- e.g. "5.3"
    change_summary TEXT NOT NULL,
    released_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CALCULATION EVIDENCE ITEMS
-- Specific tests, data logs, links, or verification records validating each method.
CREATE TABLE IF NOT EXISTS public.calculation_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    method_id TEXT NOT NULL REFERENCES public.calculation_methods(id) ON DELETE CASCADE,
    source_id TEXT NOT NULL REFERENCES public.calculation_sources(id) ON DELETE CASCADE,
    evidence_type TEXT NOT NULL CHECK (evidence_type IN (
        'IN_GAME_TEST',
        'OFFICIAL_NOTICE',
        'KQM_TCL_ENTRY',
        'SIMULATION_RUN',
        'DATAMINE_RECORD',
        'COMMUNITY_CORROBORATION'
    )),
    title TEXT NOT NULL,
    url TEXT,
    content_excerpt TEXT,
    sample_size INT,
    findings_summary TEXT NOT NULL,
    has_conflicting_findings BOOLEAN DEFAULT FALSE,
    conflicting_notes TEXT,
    verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

ALTER TABLE public.calculation_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculation_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculation_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculation_evidence ENABLE ROW LEVEL SECURITY;

-- Public can read all verified sources, methods, and evidence
CREATE POLICY "Public can view calculation sources"
    ON public.calculation_sources FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Public can view calculation methods"
    ON public.calculation_methods FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Public can view calculation versions"
    ON public.calculation_versions FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Public can view calculation evidence"
    ON public.calculation_evidence FOR SELECT TO anon, authenticated
    USING (true);

-- Authenticated users or admins can submit new evidence for review
CREATE POLICY "Authenticated users can submit calculation evidence"
    ON public.calculation_evidence FOR INSERT TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================================
-- SEED AUTHORITATIVE SOURCES
-- =====================================================================

INSERT INTO public.calculation_sources (id, name, category, url, description, priority_rank, is_authoritative)
VALUES
    ('hoyoverse-official', 'Official HoYoverse Game Details & Rules', 'OFFICIAL_HOYOVERSE', 'https://genshin.hoyoverse.com', 'Official in-game wish detail screens, rulebooks, and patch notes.', 1, TRUE),
    ('kqm-tcl', 'KeqingMains Theorycrafting Library (TCL)', 'KQM_THEORYCRAFTING', 'https://library.keqingmains.com', 'Documented peer-reviewed mechanics repository and empirical findings.', 2, TRUE),
    ('kqm-standards', 'KQM Standardized Calculation Criteria', 'KQM_STANDARDS', 'https://library.keqingmains.com/resources/compendiums/kqm-standards', 'Peer-agreed standard assumptions (weapons, artifacts, rotations).', 3, TRUE),
    ('genshin-optimizer', 'Genshin Optimizer', 'GENSHIN_OPTIMIZER', 'https://frzyc.github.io/genshin-optimizer', 'Verified damage calculator and artifact optimization comparison benchmark.', 4, TRUE),
    ('gcsim', 'gcsim (Team Rotation Simulator)', 'GCSIM', 'https://gcsim.app', 'Monte-Carlo deterministic rotation and energy simulation tool.', 5, TRUE),
    ('community-empirical', 'Community Empirical Spreadsheets', 'COMMUNITY_SHEETS_TESTING', NULL, 'Empirical wish counter datasets (Paimon.moe aggregated logs).', 6, FALSE),
    ('community-discussion', 'Community Forums (Reddit / Discord / YouTube)', 'COMMUNITY_DISCUSSION', NULL, 'Hypotheses, early player reports, and discussion threads.', 7, FALSE)
ON CONFLICT (id) DO NOTHING;
