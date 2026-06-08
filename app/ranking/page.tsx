import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import Menu from "../components/menu";

type Profile = {
  id: string;
  username: string;
  points: number;
  avatar_url: string | null;
};

export default async function RankingPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  let username = "Speler";
  let isAdmin = false;
  let avatarUrl = "";

  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, is_admin, avatar_url")
      .eq("id", userId)
      .single();

    username = profile?.username || "Speler";
    isAdmin = profile?.is_admin ?? false;
    avatarUrl = profile?.avatar_url || "";
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, points, avatar_url")
    .order("points", { ascending: false });

  const ranking: Profile[] = profiles || [];

  return (
    <main
      className="min-h-screen px-6 py-8 text-white"
      style={{ backgroundColor: "#A30000" }}
    >
      <div className="mx-auto max-w-md">
        <div style={{ marginBottom: 20 }}>
          <Menu
            username={username}
            isAdmin={isAdmin}
            avatarUrl={avatarUrl}
          />
        </div>

        <h1 className="mb-6 text-center text-3xl font-black">
          🏆 Ranking
        </h1>

        <div className="flex flex-col gap-4">
          {ranking.map((player, index) => (
            <div
              key={player.id}
              className="flex items-center justify-between rounded-2xl bg-white p-5 text-black shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl font-black"
                >
                  #{index + 1}
                </div>

                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    backgroundColor: "#eee",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    flexShrink: 0,
                  }}
                >
                  {player.avatar_url ? (
                    <img
                      src={player.avatar_url}
                      alt={player.username}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    player.username.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="text-xl font-black">
                  {player.username}
                </div>
              </div>

              <div className="text-lg font-black">
                {player.points || 0} pt
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}