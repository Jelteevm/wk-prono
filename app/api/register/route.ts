import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const formData = await request.formData();

  const username = String(formData.get("username") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return new Response(null, {
      status: 303,
      headers: {
        Location: `/register?error=${encodeURIComponent(error.message)}`,
      },
    });
  }

  if (data.user) {
    await supabase.from("profiles").insert({
      id: data.user.id,
      username,
      email,
    });
  }

  return new Response(null, {
    status: 303,
    headers: {
      Location: "/login?registered=1",
    },
  });
}