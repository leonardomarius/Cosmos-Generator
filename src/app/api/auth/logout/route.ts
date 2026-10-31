import { siteUrl } from "@/lib/site-url";
import { sessionClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const supabase = await sessionClient();
  await supabase.auth.signOut();
  return Response.redirect(`${siteUrl(request)}/`, 303);
}
