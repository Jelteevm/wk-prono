import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import Menu from "../components/menu";

type Profile = {
  id: string;
  username: string;
  points: number;
  avatar_url: string | null;
  world_cup_winner: string | null;
  top_scorer: string | null;
};

type Team = {
  name: string;
  flag: string | null;
};

type Player = {
  name: string;
  photo: string | null;
};
async function fetchAllPredictions(supabase: any) {
  let all: any[] = [];
  let from = 0;
  const size = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("predictions")
      .select("user_id, home_score, away_score")
      .range(from, from + size - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    all = all.concat(data);

    if (data.length < size) break;
    from += size;
  }

  return all;
}

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
    .select("id, username, points, avatar_url, world_cup_winner, top_scorer")
    .order("points", { ascending: false })
    .order("username", { ascending: true });

  const { data: teamsData } = await supabase.from("teams").select("name, flag");

  const { data: playersData } = await supabase
    .from("players")
    .select("name, photo");

    const predictionsData = await fetchAllPredictions(supabase);

  const { data: resultsData } = await supabase
  .from("match_results")
  .select("home_score, away_score");

const realGoals =
  resultsData?.reduce(
    (sum, match) =>
      sum +
      Number(match.home_score || 0) +
      Number(match.away_score || 0),
    0
  ) || 0;

  const { data: speeldag1Deadline } = await supabase
    .from("speeldag_deadlines")
    .select("deadline")
    .eq("speeldag", "Speeldag 1")
    .single();

  const canViewBonusChoices = speeldag1Deadline?.deadline
    ? new Date() > new Date(speeldag1Deadline.deadline)
    : false;

  const teams: Team[] = teamsData || [];
const players: Player[] = playersData || [];
const predictions = predictionsData || [];

function getPredictedGoals(userId: string) {
  return predictions
    .filter((prediction) => prediction.user_id === userId)
    .reduce(
      (sum, prediction) =>
        sum +
        Number(prediction.home_score || 0) +
        Number(prediction.away_score || 0),
      0
    );
}

function getGoalDifference(userId: string) {
  return Math.abs(getPredictedGoals(userId) - realGoals);
}

const ranking: Profile[] = [...(profiles || [])].sort((a, b) => {
  if ((b.points || 0) !== (a.points || 0)) {
    return (b.points || 0) - (a.points || 0);
  }

  return getGoalDifference(a.id) - getGoalDifference(b.id);
});

  function getTeamFlag(teamName: string | null) {
    if (!teamName) return null;

    const team = teams.find(
      (team) =>
        team.name.toLowerCase().trim() === teamName.toLowerCase().trim()
    );

    return team?.flag || null;
  }

  function getPlayerPhoto(playerName: string | null) {
    if (!playerName) return null;

    const player = players.find(
      (player) =>
        player.name.toLowerCase().trim() === playerName.toLowerCase().trim()
    );

    return player?.photo || null;
  }


  const prizeMoney = ["250", "180", "130", "90", "70"];

  return (
    <main
      className="min-h-screen px-6 py-8 text-white"
      style={{ backgroundColor: "#A30000" }}
    >
      <div className="mx-auto max-w-md">
        <div style={{ marginBottom: 20 }}>
          <Menu username={username} isAdmin={isAdmin} avatarUrl={avatarUrl} />
        </div>

        <h1 className="mb-6 text-center text-3xl font-black">🏆 Ranking</h1>

        <div className="flex flex-col gap-4">
          {ranking.map((player, index) => {
            const winnerFlag = getTeamFlag(player.world_cup_winner);
            const scorerPhoto = getPlayerPhoto(player.top_scorer);

            return (
              <div
                key={player.id}
                className="rounded-2xl bg-white text-black shadow-lg"
                style={{
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
  style={{
    position: "absolute",
    top: 12,
    left: 12,
    width: 46,
    height: 46,
    borderRadius: "50%",
    backgroundColor: "#FCEA10",
    color: "black",
    fontWeight: 900,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
    border: "2px solid white",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    lineHeight: 1,
  }}
>
  <div style={{ fontSize: 16 }}>#{index + 1}</div>

  {index < 5 && (
    <div style={{ fontSize: 10, marginTop: 3 }}>
      €{prizeMoney[index]}
    </div>
  )}
</div>

                <div
                  className="grid items-center p-5"
                  style={{
                    gridTemplateColumns: "52px minmax(0, 1fr) auto",
                    columnGap: 14,
                    paddingLeft: 62,
                  }}
                >
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

                  <div
                    className="text-xl font-black"
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      minWidth: 0,
                    }}
                  >
                    {player.username}
                  </div>

                  <div
                    className="text-lg font-black"
                    style={{
                      whiteSpace: "nowrap",
                    }}
                  >
                    {player.points || 0} pt
                  </div>
                </div>

                <details>
                  <summary
                    style={{
                      listStyle: "none",
                      backgroundColor: "#FCEA10",
                      color: "black",
                      padding: "10px 14px",
                      textAlign: "center",
                      fontWeight: 900,
                      cursor: "pointer",
                      borderTop: "1px solid rgba(0,0,0,0.08)",
                    }}
                  >
                    wereldkampioen en topscorer ▼
                  </summary>

                  <div
                    style={{
                      backgroundColor: "#fff8b8",
                      padding: 14,
                    }}
                  >
                    {!canViewBonusChoices ? (
                      <div
                        style={{
                          textAlign: "center",
                          fontWeight: 900,
                          color: "#555",
                          padding: 10,
                        }}
                      >
                        🔒zichtbaar na deadline Speeldag 1.
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                        }}
                        
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            fontWeight: 900,
                          }}
                        >
                          <div style={{ width: 28, textAlign: "center" }}>
                            🏆
                          </div>

                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: "50%",
                              backgroundColor: "white",
                              overflow: "hidden",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {winnerFlag ? (
                              <img
                                src={`/${winnerFlag}`}
                                alt={player.world_cup_winner || "WK winnaar"}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              "?"
                            )}
                          </div>

                          <div
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {player.world_cup_winner || "Nog geen WK winnaar"}
                          </div>
                        </div>

                        <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontWeight: 900,
  }}
>
  <div style={{ width: 28, textAlign: "center" }}>⚽</div>

  <div
    style={{
      width: 38,
      height: 38,
      borderRadius: "50%",
      backgroundColor: "white",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    {scorerPhoto ? (
      <img
        src={scorerPhoto}
        alt={player.top_scorer || "Topschutter"}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    ) : (
      "?"
    )}
  </div>

  <div
    style={{
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    }}
  >
    {player.top_scorer || "Nog geen topschutter"}
  </div>
</div>

<div
  style={{
    marginTop: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.65)",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontWeight: 900,
  }}
>
  <div>Voorspelde goals: {getPredictedGoals(player.id)}</div>
  <div>Aantal goals: {realGoals}</div>
  <div>Verschil: {getGoalDifference(player.id)}</div>
</div>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
