import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("avatar") as File | null;

  const userId = request.headers
    .get("cookie")
    ?.split("; ")
    .find((row) => row.startsWith("user_id="))
    ?.split("=")[1];

  if (!userId || !file) {
    return new Response(null, { status: 303, headers: { Location: "/profiel" } });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const ext = file.name.split(".").pop();
  const path = `${userId}/avatar-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true });

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);

  await supabase
    .from("profiles")
    .update({ avatar_url: data.publicUrl })
    .eq("id", userId);

  return new Response(null, {
    status: 303,
    headers: { Location: "/profiel" },
  });
}