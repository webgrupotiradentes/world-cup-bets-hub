
-- Teams table
CREATE TABLE public.teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  flag TEXT NOT NULL DEFAULT '🏳️',
  "group" TEXT
);

-- Matches table
CREATE TABLE public.matches (
  id TEXT PRIMARY KEY,
  home_team_id TEXT REFERENCES public.teams(id),
  away_team_id TEXT REFERENCES public.teams(id),
  home_score INTEGER,
  away_score INTEGER,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  stage TEXT NOT NULL DEFAULT 'group',
  "group" TEXT,
  played BOOLEAN NOT NULL DEFAULT false
);

-- Participants table
CREATE TABLE public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT '',
  cup_group TEXT,
  cup_eliminated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bets table
CREATE TABLE public.bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id TEXT REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  participant_id UUID REFERENCES public.participants(id) ON DELETE CASCADE NOT NULL,
  home_score INTEGER NOT NULL,
  away_score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(match_id, participant_id)
);

-- Cup bracket matches
CREATE TABLE public.cup_bracket_matches (
  id TEXT PRIMARY KEY,
  stage TEXT NOT NULL,
  participant1_id UUID REFERENCES public.participants(id),
  participant2_id UUID REFERENCES public.participants(id),
  score1 INTEGER,
  score2 INTEGER,
  winner_id UUID REFERENCES public.participants(id),
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS on all tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cup_bracket_matches ENABLE ROW LEVEL SECURITY;

-- Public read access (no auth yet)
CREATE POLICY "Public read teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Public all teams" ON public.teams FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Public all matches" ON public.matches FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read participants" ON public.participants FOR SELECT USING (true);
CREATE POLICY "Public all participants" ON public.participants FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read bets" ON public.bets FOR SELECT USING (true);
CREATE POLICY "Public all bets" ON public.bets FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read cup_bracket" ON public.cup_bracket_matches FOR SELECT USING (true);
CREATE POLICY "Public all cup_bracket" ON public.cup_bracket_matches FOR ALL USING (true) WITH CHECK (true);
