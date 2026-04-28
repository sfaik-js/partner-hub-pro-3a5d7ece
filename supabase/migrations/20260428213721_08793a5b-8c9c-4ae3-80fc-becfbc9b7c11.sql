
CREATE OR REPLACE FUNCTION public.generate_partner_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.partner_code IS NULL OR NEW.partner_code = '' THEN
    NEW.partner_code := 'PAR-' || LPAD(nextval('partner_code_seq')::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
