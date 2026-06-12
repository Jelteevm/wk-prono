import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import Menu from "../components/menu";

type Prediction = {
  match_id: number;
  home_score: number;
  away_score: number;
};

type PublicPrediction = {
  match_id: number;
  home_score: number;
  away_score: number;
  result_pick: string | null;
  username: string;
};

type Match = {
  id: number;
  speeldag: string | null;
  match_date: string;
  match_time: string | null;
  home_team: string;
  away_team: string;
  group_name: string | null;
  stadium: string | null;
  city: string | null;
  home_flag: string | null;
  away_flag: string | null;
};

type Deadline = {
  speeldag: string;
  deadline: string;
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  let username = "Speler";
  let isAdmin = false;
  let avatarUrl = "";
  let predictions: Prediction[] = [];

  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, is_admin, avatar_url")
      .eq("id", userId)
      .single();

    if (profile?.username) username = profile.username;
    isAdmin = profile?.is_admin ?? false;
    avatarUrl = profile?.avatar_url || "";

    const { data: predictionData } = await supabase
      .from("predictions")
      .select("*")
      .eq("user_id", userId);

    predictions = predictionData || [];
  }

  const { data: deadlineRows } = await supabase
    .from("speeldag_deadlines")
    .select("speeldag, deadline");

  const deadlines: Deadline[] = deadlineRows || [];

  const { data: dateRows } = await supabase
    .from("matches")
    .select("match_date")
    .order("match_date", { ascending: true });

  const dates = Array.from(
    new Set((dateRows || []).map((row) => row.match_date))
  );

  const todayBelgium = new Date().toLocaleDateString("sv-SE", {
  timeZone: "Europe/Brussels",
});

const selectedDate =
  params.date || (dates.includes(todayBelgium) ? todayBelgium : dates[0]) || "";

  const { data: matchData } = await supabase
    .from("matches")
    .select("*")
    .eq("match_date", selectedDate)
    .order("match_time", { ascending: true });

  const matches: Match[] = matchData || [];
  const matchIds = matches.map((match) => match.id);
  const { data: resultRows } =
  matchIds.length > 0
    ? await supabase
        .from("match_results")
        .select("match_id, home_score, away_score")
        .in("match_id", matchIds)
    : { data: [] };

  const { data: allPredictionRows } =
    matchIds.length > 0
      ? await supabase
          .from("predictions")
          .select("user_id, match_id, home_score, away_score, result_pick")
          .in("match_id", matchIds)
      : { data: [] };

  const { data: profileRows } = await supabase
    .from("profiles")
    .select("id, username");

  const usernameByUserId = new Map(
    (profileRows || []).map((profile) => [profile.id, profile.username])
  );

  const allPredictions: PublicPrediction[] =
    allPredictionRows?.map((prediction) => ({
      match_id: prediction.match_id,
      home_score: prediction.home_score,
      away_score: prediction.away_score,
      result_pick: prediction.result_pick,
      username: usernameByUserId.get(prediction.user_id) || "Speler",
    })) || [];

  function getPrediction(matchId: number) {
    return predictions.find((prediction) => prediction.match_id === matchId);
  }

  function getPublicPredictions(matchId: number) {
    return allPredictions.filter(
      (prediction) => prediction.match_id === matchId
    );
  }
  function getResult(matchId: number) {
  return resultRows?.find(
    (result) => result.match_id === matchId
  );
}

  function isDeadlinePassed(speeldag: string | null) {
    if (!speeldag) return false;

    const deadline = deadlines.find((item) => item.speeldag === speeldag);

    if (!deadline?.deadline) return false;

    return new Date() > new Date(deadline.deadline);
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("nl-BE", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }

  function renderFlag(flag: string | null, alt: string) {
    if (!flag) {
      return (
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            backgroundColor: "#eee",
            margin: "0 auto 8px auto",
          }}
        />
      );
    }

    return (
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          backgroundColor: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 8px auto",
          overflow: "hidden",
        }}
      >
        <img
          src={`/${flag}`}
          alt={alt}
          style={{
            width: 64,
            height: 64,
            objectFit: "cover",
            borderRadius: "50%",
            display: "block",
          }}
        />
      </div>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#A30000",
        color: "white",
        padding: "32px 20px",
      }}
    >
      <div style={{ maxWidth: 430, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Menu username={username} isAdmin={isAdmin} avatarUrl={avatarUrl} />
        </div>

        <details style={{ marginBottom: 20 }}>
          <summary
            style={{
              listStyle: "none",
              width: "100%",
              backgroundColor: "#FCEA10",
              color: "black",
              borderRadius: 16,
              padding: "14px 20px",
              textAlign: "center",
              fontSize: 22,
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            📅 {selectedDate ? formatDate(selectedDate) : "Kies datum"} ▼
          </summary>

          <div
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              padding: 10,
              marginTop: 10,
              maxHeight: 260,
              overflowY: "auto",
            }}
          >
            {dates.map((date) => (
              <Link
                key={date}
                href={`/dashboard?date=${date}`}
                style={{
                  display: "block",
                  width: "100%",
                  padding: 12,
                  marginBottom: 8,
                  borderRadius: 12,
                  backgroundColor:
                    selectedDate === date ? "#FCEA10" : "#f1f1f1",
                  color: "black",
                  fontWeight: 900,
                  textAlign: "center",
                  textDecoration: "none",
                  fontSize: 16,
                }}
              >
                {formatDate(date)}
              </Link>
            ))}
          </div>
        </details>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {matches.length === 0 && (
            <div
              style={{
                backgroundColor: "white",
                color: "black",
                borderRadius: 18,
                padding: 20,
                textAlign: "center",
                fontWeight: 900,
              }}
            >
              Geen matchen op deze datum.
            </div>
          )}

          {matches.map((match) => {
            const prediction = getPrediction(match.id);
            const publicPredictions = getPublicPredictions(match.id);
            const canViewPredictions = isDeadlinePassed(match.speeldag);
            const result = getResult(match.id);

            return (
              <div
                key={match.id}
                style={{
                  overflow: "hidden",
                  borderRadius: 18,
                  boxShadow: "0 8px 20px rgba(0,0,0,0.22)",
                  backgroundColor: "white",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#FCEA10",
                    color: "black",
                    padding: "10px 14px",
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    alignItems: "center",
                    gap: 10,
                    fontWeight: 900,
                  }}
                >
                  <div style={{ fontSize: 14, lineHeight: 1.25 }}>
                    🏟️ {match.stadium || "Stadion nog niet gekend"},{" "}
                    {match.city || "stad nog niet gekend"}
                  </div>

                  <div style={{ fontSize: 15, whiteSpace: "nowrap" }}>
                    {match.group_name || ""}
                  </div>
                </div>

                <div
                  style={{
                    color: "black",
                    padding: 16,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    alignItems: "center",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    {renderFlag(match.home_flag, match.home_team)}
                    <div style={{ fontWeight: 900 }}>{match.home_team}</div>
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 900,
                        marginBottom: 6,
                      }}
                    >
                      {match.match_time || ""}
                    </div>

                    <div
                      style={{
                        fontSize: prediction ? 32 : 14,
                        fontWeight: 900,
                        lineHeight: 1.2,
                      }}
                    >
                      {prediction
                        ? `${prediction.home_score} - ${prediction.away_score}`
                        : "Nog niet ingevuld"}
                    </div>

                    <div style={{ color: "#777", fontSize: 13 }}>
                      Jouw prono
                    </div>
                  </div>
                  

                  <div style={{ textAlign: "center" }}>
                    {renderFlag(match.away_flag, match.away_team)}
                    <div style={{ fontWeight: 900 }}>{match.away_team}</div>
                  </div>
                </div>

                <details>
                  <summary
                    style={{
                      listStyle: "none",
                      backgroundColor: "#FCEA10",
                      color: "black",
                      padding: "12px 16px",
                      textAlign: "center",
                      fontWeight: 900,
                      cursor: "pointer",
                      borderTop: "1px solid rgba(0,0,0,0.08)",
                    }}
                  >
                    Bekijk de pronostiek van anderen ▼
                  </summary>

                  <div
                    style={{
                      color: "black",
                      backgroundColor: "#fff8b8",
                      padding: 14,
                    }}
                  >
                    {!canViewPredictions && (
                      <div
                        style={{
                          textAlign: "center",
                          fontWeight: 900,
                          color: "#555",
                        }}
                      >
                        🔒 Pronostieken zichtbaar na de deadline.
                      </div>
                    )}

                    {canViewPredictions && publicPredictions.length === 0 && (
                      <div
                        style={{
                          textAlign: "center",
                          fontWeight: 900,
                          color: "#555",
                        }}
                      >
                        Nog geen pronostieken.
                      </div>
                    )}

                    {canViewPredictions &&
                      publicPredictions.map((item, index) => (
                        <div
                          key={`${item.match_id}-${index}`}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 10,
                            padding: "10px 0",
                            borderBottom:
                              index === publicPredictions.length - 1
                                ? "none"
                                : "1px solid rgba(0,0,0,0.15)",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 900,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.username}
                          </div>

                          <div
                            style={{
                              fontWeight: 900,
                              whiteSpace: "nowrap",
                            }}
                          >
                           <span
                            style={{
                             color:
                              result &&
                              item.home_score === result.home_score &&
                              item.away_score === result.away_score
                                ? "#16a34a"
                                : "black",
                          }}
>
  {item.home_score} - {item.away_score}
</span>
{"  "}
<span
                             style={{
                              color:
                                result &&
                               item.result_pick ===
                                 (result.home_score > result.away_score
                                  ? "1"
                                  : result.home_score < result.away_score
                                  ? "2"
                                  : "X")
                                  ? "#16a34a"
                                  : "#777",
  }}
>
  ({item.result_pick || "?"})
</span>

                          </div>
                        </div>
                      ))}
                  </div>
                </details>
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginTop: 24,
          }}
        >
          <Link
            href="/voorspellingen"
            style={{
              backgroundColor: "#FCEA10",
              color: "black",
              borderRadius: 16,
              padding: 18,
              textAlign: "center",
              fontSize: 22,
              fontWeight: 900,
              textDecoration: "none",
            }}
          >
            ⚽ Mijn pronostiek invullen
          </Link>

          <Link
            href="/ranking"
            style={{
              backgroundColor: "#FCEA10",
              color: "black",
              borderRadius: 16,
              padding: 18,
              textAlign: "center",
              fontSize: 22,
              fontWeight: 900,
              textDecoration: "none",
            }}
          >
            🏆 Ranking bekijken
          </Link>
        </div>
      </div>
    </main>
  );
}