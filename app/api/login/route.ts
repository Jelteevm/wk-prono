import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const formData = await request.formData();

  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return new Response(null, {
      status: 303,
      headers: {
        Location: `/login?error=${encodeURIComponent(
          error?.message || "Login mislukt"
        )}`,
      },
    });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", data.user.id)
    .single();

  const username = profile?.username || "Speler";

  const headers = new Headers();
  headers.append("Location", "/dashboard");
  headers.append(
    "Set-Cookie",
    `username=${encodeURIComponent(username)}; Path=/; Max-Age=2592000; SameSite=Lax`
  );
  headers.append(
    "Set-Cookie",
    `user_id=${data.user.id}; Path=/; Max-Age=2592000; SameSite=Lax`
  );

  return new Response(null, {
    status: 303,
    headers,
  });
}