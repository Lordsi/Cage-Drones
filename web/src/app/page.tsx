import { Landing } from "@/components/landing";
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

  return <Landing auth={auth} />;
}
