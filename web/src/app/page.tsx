import { Landing, type LandingCohort } from "@/components/landing";
import { createClient } from "@/lib/supabase/server";
import { getProfile, homePathForRole, roleDisplayLabel } from "@/lib/profile";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let auth = null as
    | null
    | {
        displayName: string;
        roleLabel: string;
        dashboardHref: string;
      };

  if (user) {
    const profile = await getProfile(supabase);
    if (profile) {
      auth = {
        displayName: profile.display_name,
        roleLabel: roleDisplayLabel(profile.role),
        dashboardHref: homePathForRole(profile.role),
      };
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data: cohortsData } = await supabase
    .from("training_cohorts")
    .select("id, code, title, location, starts_on, ends_on, status")
    .gte("starts_on", today)
    .in("status", ["open", "waitlist"])
    .order("starts_on", { ascending: true })
    .limit(8);

  const cohorts: LandingCohort[] = (cohortsData ?? []).map((c) => ({
    id: c.id as string,
    code: c.code as string,
    title: c.title as string,
    location: (c.location as string) ?? "",
    starts_on: c.starts_on as string,
    ends_on: (c.ends_on as string | null) ?? null,
    status: c.status as string,
  }));

  return <Landing auth={auth} cohorts={cohorts} />;
}
