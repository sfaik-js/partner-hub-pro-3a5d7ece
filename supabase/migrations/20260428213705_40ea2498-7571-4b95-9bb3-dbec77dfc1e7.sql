
-- Table principale des partenaires
CREATE TABLE public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_code text UNIQUE NOT NULL,

  -- Informations générales
  name text NOT NULL,
  partner_type text NOT NULL,
  intervention_domain text,
  sub_sector text,
  geographic_zone text,
  region text,
  city text,
  country text,
  contact_name text,
  contact_role text,
  email text,
  phone text,
  preferred_channel text,

  -- Partenariat
  partnership_status text DEFAULT 'Prospect',
  strategic_level text,
  collaboration_type text,
  partnership_duration text,
  first_contact_date date,
  partnership_start_date date,
  mou_signed boolean DEFAULT false,
  involved_team text,
  internal_manager text,

  -- Suivi relationnel
  last_interaction_date date,
  last_interaction_type text,
  exchange_frequency text,
  next_action text,
  next_action_deadline date,
  follow_up_status text,

  -- Analyse stratégique
  relational_score integer CHECK (relational_score BETWEEN 1 AND 10),
  impact_score text,
  strategic_alignment text,
  opportunities text,
  relational_risks text,
  comments text,
  objectives_summary text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_partners_status ON public.partners(partnership_status);
CREATE INDEX idx_partners_type ON public.partners(partner_type);
CREATE INDEX idx_partners_created ON public.partners(created_at DESC);

-- Génération auto du code partenaire (PAR-001, PAR-002, ...)
CREATE SEQUENCE IF NOT EXISTS partner_code_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_partner_code()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.partner_code IS NULL OR NEW.partner_code = '' THEN
    NEW.partner_code := 'PAR-' || LPAD(nextval('partner_code_seq')::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_partners_code
BEFORE INSERT ON public.partners
FOR EACH ROW EXECUTE FUNCTION public.generate_partner_code();

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_partners_updated
BEFORE UPDATE ON public.partners
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS : accès public (CRUD ouvert) — V1 sans auth
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read partners"
  ON public.partners FOR SELECT
  USING (true);

CREATE POLICY "Public insert partners"
  ON public.partners FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update partners"
  ON public.partners FOR UPDATE
  USING (true) WITH CHECK (true);

CREATE POLICY "Public delete partners"
  ON public.partners FOR DELETE
  USING (true);
