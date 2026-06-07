import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import Menu from "../components/menu";

type Prediction = {
  match_id: number;
  home_score: number;
  away_score: number;
};

type Match = {
  id: number;
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
  let predictions: Prediction[] = [];

  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, is_admin")
      .eq("id", userId)
      .single();

    if (profile?.username) username = profile.username;
    isAdmin = profile?.is_admin ?? false;

    const { data: predictionData } = await supabase
      .from("predictions")
      .select("*")
      .eq("user_id", userId);

    predictions = predictionData || [];
  }

  const { data: dateRows } = await supabase
    .from("matches")
    .select("match_date")
    .order("match_date", { ascending: true });

  const dates = Array.from(
    new Set((dateRows || []).map((row) => row.match_date))
  );

  const selectedDate = params.date || dates[0] || "";

  const { data: matchData } = await supabase
    .from("matches")
    .select("*")
    .eq("match_date", selectedDate)
    .order("match_time", { ascending: true });

  const matches: Match[] = matchData || [];

  function getPrediction(matchId: number) {
    return predictions.find((prediction) => prediction.match_id === matchId);
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
          <Menu username={username} isAdmin={isAdmin} />
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
            ⚽ Voorspellingen aanpassen
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