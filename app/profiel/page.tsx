import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export default async function ProfielPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  let username = "Speler";

  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", userId)
      .single();

    if (profile?.username) {
      username = profile.username;
    }
  }

  return (
    <main
      className="min-h-screen px-6 py-8 text-white"
      style={{ backgroundColor: "#A30000" }}
    >
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-3xl font-black">
          👤 Mijn profiel
        </h1>

        <div className="rounded-2xl bg-white p-6 text-black">
          <div className="mb-4">
            <strong>Naam:</strong> {username}
          </div>

          <div className="mb-4">
            <strong>Punten:</strong> 0
          </div>

          <div className="mb-6">
            <strong>Positie:</strong> #1
          </div>

          <form action="/api/logout" method="POST">
            <button
              type="submit"
              className="w-full rounded-xl py-4 text-xl font-bold text-black"
              style={{ backgroundColor: "#FCEA10" }}
            >
              🚪 Uitloggen
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}