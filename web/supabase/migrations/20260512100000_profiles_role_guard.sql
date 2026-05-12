-- Only admins (or server-side without a JWT) may change profiles.role
CREATE OR REPLACE FUNCTION public.profiles_enforce_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF auth.uid() IS NOT NULL AND NOT public.is_admin(auth.uid()) THEN
      RAISE EXCEPTION 'only_admin_can_change_role';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS profiles_enforce_role_change ON public.profiles;
CREATE TRIGGER profiles_enforce_role_change
  BEFORE UPDATE OF role ON public.profiles
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role)
  EXECUTE PROCEDURE public.profiles_enforce_role_change();
