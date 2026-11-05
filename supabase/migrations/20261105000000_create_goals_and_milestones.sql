-- ============================================================================
-- Flowora / FocusUp: Goals & Milestones Database Migration
-- Tables: public.goals, public.goal_milestones
-- Includes: Foreign Keys, Triggers, Indexes, and Row Level Security (RLS)
-- ============================================================================

-- 1. Create public.goals table
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Personal',
  icon TEXT DEFAULT 'Target',
  color TEXT DEFAULT 'blue',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  tracking_type TEXT DEFAULT 'milestone' CHECK (tracking_type IN ('milestone', 'numeric', 'percentage')),
  target_value NUMERIC(12, 2) DEFAULT NULL,
  current_value NUMERIC(12, 2) DEFAULT 0,
  unit TEXT DEFAULT NULL,
  manual_progress NUMERIC(5, 2) DEFAULT 0,
  start_date DATE DEFAULT CURRENT_DATE,
  target_date DATE DEFAULT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create public.goal_milestones table
CREATE TABLE IF NOT EXISTS public.goal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE DEFAULT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ DEFAULT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_goals_user_status ON public.goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_goals_user_target_date ON public.goals(user_id, target_date);
CREATE INDEX IF NOT EXISTS idx_goal_milestones_goal_id ON public.goal_milestones(goal_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_goal_milestones_user_id ON public.goal_milestones(user_id, is_completed);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_milestones ENABLE ROW LEVEL SECURITY;

-- 5. Goals RLS Policies
CREATE POLICY "Users can view their own goals"
  ON public.goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals"
  ON public.goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
  ON public.goals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
  ON public.goals FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Milestones RLS Policies
CREATE POLICY "Users can view their own goal milestones"
  ON public.goal_milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goal milestones"
  ON public.goal_milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goal milestones"
  ON public.goal_milestones FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goal milestones"
  ON public.goal_milestones FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Automated updated_at trigger helper
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_goals_updated_at ON public.goals;
CREATE TRIGGER trigger_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW
  EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS trigger_goal_milestones_updated_at ON public.goal_milestones;
CREATE TRIGGER trigger_goal_milestones_updated_at
  BEFORE UPDATE ON public.goal_milestones
  FOR EACH ROW
  EXECUTE FUNCTION public.set_current_timestamp_updated_at();
