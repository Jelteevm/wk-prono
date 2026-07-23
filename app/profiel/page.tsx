import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import Menu from "../components/menu";

export default async function ProfielPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  let username = "Speler";
  let points = 0;
  let isAdmin = false;
  let avatarUrl = "";

  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, points, is_admin, avatar_url")
      .eq("id", userId)
      .single();

    username = profile?.username || "Speler";
    points = profile?.points || 0;
    isAdmin = profile?.is_admin ?? false;
    avatarUrl = profile?.avatar_url || "";
  }

  return (
    <main
  className="min-h-screen text-white"
  style={{ backgroundColor: "#03162E" }}
>
  <Menu
    username={username}
    isAdmin={isAdmin}
    avatarUrl={avatarUrl}
  />

  <div
    className="mx-auto max-w-md px-6 pb-8"
    style={{ paddingTop: 92 }}
  >
    <h1 className="mb-6 text-center text-3xl font-black">
      Mijn profiel
    </h1>

        <div className="rounded-2xl bg-white p-6 text-center text-black">
          <div style={{ width: 120, height: 120, borderRadius: "50%", backgroundColor: "#eee", margin: "0 auto 18px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, fontWeight: 900 }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              username.charAt(0).toUpperCase()
            )}
          </div>

          <div className="mb-4 text-xl font-black">{username}</div>

          <div className="mb-6 font-bold">
            Punten: {points}
          </div>

          <form action="/api/profile/avatar" method="POST" encType="multipart/form-data" className="mb-6">
            <input
              name="avatar"
              type="file"
              accept="image/*"
              className="mb-4 w-full rounded-xl border p-3 text-black"
            />

            <button
              type="submit"
              className="w-full rounded-xl py-4 text-xl font-bold text-black"
              style={{ backgroundColor: "#FCEA10" }}
            >
              Foto uploaden
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}