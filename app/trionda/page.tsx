import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import Menu from "../components/menu";

type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  is_admin?: boolean;
};

type TriondaPrediction = {
  user_id: string;
  match_id: number;
  first_scorer: string | null;
  yellow_card_player: string | null;
};

type TriondaResult = {
  match_id: number;
  first_scorer: string | null;
  yellow_card_players: string[] | null;
};

async function fetchAll(supabase: any, table: string, columns: string) {
  let all: any[] = [];
  let from = 0;
  const size = 1000;

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .range(from, from + size - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    all = all.concat(data);

    if (data.length < size) break;
    from += size;
  }

  return all;
}

function clean(value: string | null | undefined) {
  return String(value || "").toLowerCase().trim();
}

function calculateTriondaPoints(
  prediction: TriondaPrediction,
  result: TriondaResult | undefined
) {
  if (!result) return 0;

  const scorerCorrect =
    clean(prediction.first_scorer) &&
    clean(prediction.first_scorer) === clean(result.first_scorer);

  const yellowCorrect =
    clean(prediction.yellow_card_player) &&
    (result.yellow_card_players || []).some(
      (player) => clean(player) === clean(prediction.yellow_card_player)
    );

  let points = 0;

  if (scorerCorrect) points += 2;
  if (yellowCorrect) points += 2;
  if (scorerCorrect && yellowCorrect) points += 1;

  return points;
}

export default async function TriondaPage() {
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

  const profiles = (await fetchAll(
    supabase,
    "profiles",
    "id, username, avatar_url"
  )) as Profile[];

  const predictions = (await fetchAll(
    supabase,
    "trionda_predictions",
    "user_id, match_id, first_scorer, yellow_card_player"
  )) as TriondaPrediction[];

  const results = (await fetchAll(
    supabase,
    "trionda_results",
    "match_id, first_scorer, yellow_card_players"
  )) as TriondaResult[];

  const ranking = profiles
    .map((profile) => {
      const userPredictions = predictions.filter(
        (prediction) => prediction.user_id === profile.id
      );

      const points = userPredictions.reduce((total, prediction) => {
        const result = results.find(
          (result) => result.match_id === prediction.match_id
        );

        return total + calculateTriondaPoints(prediction, result);
      }, 0);

      return {
        ...profile,
        points,
      };
    })
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return a.username.localeCompare(b.username);
    });

  return (
    <main
      className="min-h-screen px-6 py-8 text-white"
      style={{ backgroundColor: "#A30000" }}
    >
      <div className="mx-auto max-w-md">
        <div style={{ marginBottom: 20 }}>
          <Menu username={username} isAdmin={isAdmin} avatarUrl={avatarUrl} />
        </div>

        <h1 className="mb-4 text-center text-3xl font-black">
        Trionda Matchball Challenge
        </h1>
<div
  style={{
    display: "flex",
    justifyContent: "center",
    marginBottom: 20,
  }}
>
  <img
    src="/trionda.svg"
    alt="Trionda"
    style={{
      width: 70,
      height: 70,
    }}
  />
</div>
    
<div
  className="mb-6 rounded-2xl p-5 text-black"
  style={{
    backgroundColor: "#FCEA10",
  }}
>
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr auto",
      rowGap: 12,
      columnGap: 20,
      fontWeight: 900,
      fontSize: 17,
    }}
  >
    <div>⚽ Eerste doelpuntenmaker</div>
    <div>2 pt</div>

    <div>🟨 Gele kaart</div>
    <div>2 pt</div>

    <div>🎯 Beide juist</div>
    <div>+1 bonus</div>
  </div>
</div>

        <div className="flex flex-col gap-4">
          {ranking.map((player, index) => (
            <div
              key={player.id}
              className="rounded-2xl bg-white p-5 text-black shadow-lg"
              style={{
                display: "grid",
                gridTemplateColumns: "42px 52px minmax(0, 1fr) auto",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  backgroundColor: "#FCEA10",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                }}
              >
                #{index + 1}
              </div>

              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  backgroundColor: "#eee",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
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

              <div
                className="text-lg font-black"
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {player.username}
              </div>

              <div className="text-lg font-black">{player.points} pt</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}