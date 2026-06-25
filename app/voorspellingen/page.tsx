import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import Menu from "../components/menu";
import PlayerSearch from "../components/player-search";

type Match = {
  id: number;
  speeldag: string | null;
  match_time: string | null;
  group_name: string | null;
  stadium: string | null;
  city: string | null;
  home_team: string;
  away_team: string;
  home_flag: string | null;
  away_flag: string | null;
};

type Team = {
  id: number;
  name: string;
  api_name: string | null;
  flag: string | null;
};

type Deadline = {
  speeldag: string;
  deadline: string;
};

type TriondaPrediction = {
  match_id: number;
  first_scorer: string | null;
  yellow_card_player: string | null;
};

type Player = {
  name: string;
  team_name: string | null;
};

async function fetchAllPlayers(supabase: any) {
  let all: Player[] = [];
  let from = 0;
  const size = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("players")
      .select("name, team_name")
      .order("name", { ascending: true })
      .range(from, from + size - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    all = all.concat(data as Player[]);

    if (data.length < size) break;
    from += size;
  }

  return all;
}

export default async function VoorspellingenPage({
  searchParams,
}: {
  searchParams: Promise<{
    speeldag?: string;
    saved?: string;
    error?: string;
  }>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: allMatchesData } = await supabase
    .from("matches")
    .select(
      "id, speeldag, match_time, group_name, stadium, city, home_team, away_team, home_flag, away_flag"
    )
    .order("id", { ascending: true });

  const { data: teamsData } = await supabase
  .from("teams")
  .select("id, name, api_name, flag")
  .order("name", { ascending: true });


  const playersData = await fetchAllPlayers(supabase);

  const { data: deadlineRows } = await supabase
    .from("speeldag_deadlines")
    .select("speeldag, deadline");
const { data: resultRows } = await supabase
  .from("match_results")
  .select("match_id, home_score, away_score");
  const allMatches: Match[] = allMatchesData || [];
  const teams: Team[] = teamsData || [];
  const players = playersData || [];
  const deadlines: Deadline[] = deadlineRows || [];

  const now = new Date();

  const allSpeeldagen = Array.from(
    new Set(allMatches.map((match) => match.speeldag || "Zonder speeldag"))
  );

  function getDeadlineForSpeeldag(speeldag: string) {
    return deadlines.find((deadline) => deadline.speeldag === speeldag);
  }

  function isSpeeldagLocked(speeldag: string) {
    const deadline = getDeadlineForSpeeldag(speeldag);

    if (!deadline?.deadline) {
      return false;
    }

    return now > new Date(deadline.deadline);
  }

  const openSpeeldagen = allSpeeldagen.filter(
    (speeldag) => !isSpeeldagLocked(speeldag)
  );

  const selectedSpeeldag =
    params.speeldag && openSpeeldagen.includes(params.speeldag)
      ? params.speeldag
      : openSpeeldagen[0] || "";

  const matches = allMatches.filter(
    (match) => (match.speeldag || "Zonder speeldag") === selectedSpeeldag
  );

  const selectedDeadlineRow = getDeadlineForSpeeldag(selectedSpeeldag);
  const deadline = selectedDeadlineRow?.deadline || "";

  let username = "Speler";
  let isAdmin = false;
  let avatarUrl = "";
  let existingPredictions: any[] = [];
  let existingTriondaPredictions: TriondaPrediction[] = [];
  let worldCupWinner = "";
  let topScorer = "";

  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, is_admin, avatar_url, world_cup_winner, top_scorer")
      .eq("id", userId)
      .single();

    username = profile?.username || "Speler";
    isAdmin = profile?.is_admin ?? false;
    avatarUrl = profile?.avatar_url || "";
    worldCupWinner = profile?.world_cup_winner || "";
    topScorer = profile?.top_scorer || "";

    const { data } = await supabase
      .from("predictions")
      .select("*")
      .eq("user_id", userId);

    existingPredictions = data || [];
  }

  const { data: triondaData } = await supabase
  .from("trionda_predictions")
  .select("match_id, first_scorer, yellow_card_player")
  .eq("user_id", userId);

existingTriondaPredictions = triondaData || [];

  function getPrediction(matchId: number) {
    return existingPredictions.find(
      (prediction) => prediction.match_id === matchId
    );
  }

  function getApiTeamName(teamName: string) {
  const team = teams.find(
    (team) => team.name.toLowerCase().trim() === teamName.toLowerCase().trim()
  );

  return team?.api_name || teamName;
}

function getPlayersForTeam(teamName: string) {
  const apiName = getApiTeamName(teamName).toLowerCase().trim();

  return players.filter(
    (player) =>
      player.team_name &&
      player.team_name.toLowerCase().trim() === apiName
  );
}

  function getTriondaPrediction(matchId: number) {
  return existingTriondaPredictions.find(
    (prediction) => prediction.match_id === matchId
  );
}

function isTriondaMatch(speeldag: string | null) {
  if (!speeldag) return false;

  const value = speeldag.toLowerCase();

  return (
    value.includes("16e finale") ||
    value.includes("8e finale") ||
    value.includes("kwartfinale") ||
    value.includes("halve finale") ||
    value.includes("verliezersfinale") ||
    value.includes("finale")
  );
}

  function renderFlag(flag: string | null, alt: string) {
    if (!flag) {
      return (
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            backgroundColor: "#eee",
            margin: "0 auto 8px auto",
          }}
        />
      );
    }

    return (
      <img
        src={`/${flag}`}
        alt={alt}
        style={{
          width: 60,
          height: 60,
          borderRadius: "50%",
          objectFit: "cover",
          margin: "0 auto 8px auto",
          display: "block",
        }}
      />
    );
  }

  function getGroupResults(groupName: string | null) {
  if (!groupName) return [];

  return allMatches
    .filter((m) => m.group_name === groupName)
    .map((m) => {
      const result = resultRows?.find(
        (r) => r.match_id === m.id
      );

      return {
        home_team: m.home_team,
        away_team: m.away_team,
        result,
      };
    })
    .filter((m) => m.result);
}

  function formatDeadline(deadlineValue: string) {
    const date = new Date(deadlineValue);

    return (
      date.toLocaleDateString("nl-BE", {
        timeZone: "Europe/Brussels",
        weekday: "long",
        day: "numeric",
        month: "long",
      }) +
      " om " +
      date.toLocaleTimeString("nl-BE", {
        timeZone: "Europe/Brussels",
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }

  if (openSpeeldagen.length === 0) {
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

          <h1 className="mb-8 text-center text-3xl font-black">
            Voorspellingen
          </h1>

          <div className="rounded-2xl bg-white p-6 text-center text-black">
            <h2 className="mb-3 text-2xl font-black">
              🔒 Alles is afgesloten
            </h2>
            <p className="font-bold">
              Er zijn momenteel geen open speeldagen meer om voorspellingen aan
              te passen.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="mt-6 block w-full rounded-xl py-4 text-center text-xl font-bold text-black"
            style={{ backgroundColor: "#FCEA10" }}
          >
            Naar dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen px-6 py-8 text-white"
      style={{ backgroundColor: "#A30000" }}
    >
      <div className="mx-auto max-w-md">
        <div style={{ marginBottom: 20 }}>
          <Menu username={username} isAdmin={isAdmin} avatarUrl={avatarUrl} />
        </div>

        <form action="/api/predictions" method="POST">
          <h1 className="mb-8 text-center text-3xl font-black">
            Voorspellingen
          </h1>

          <input type="hidden" name="speeldag" value={selectedSpeeldag} />

          <details className="mb-5">
            <summary
              style={{
                listStyle: "none",
                width: "100%",
                backgroundColor: "#FCEA10",
                color: "black",
                borderRadius: 16,
                padding: "14px 20px",
                textAlign: "center",
                fontSize: 24,
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              {selectedSpeeldag || "Kies speeldag"} ▼
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
              {openSpeeldagen.map((speeldag) => (
                <Link
                  key={speeldag}
                  href={`/voorspellingen?speeldag=${encodeURIComponent(
                    speeldag
                  )}`}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: 12,
                    marginBottom: 8,
                    borderRadius: 12,
                    backgroundColor:
                      selectedSpeeldag === speeldag ? "#FCEA10" : "#f1f1f1",
                    color: "black",
                    fontWeight: 900,
                    textAlign: "center",
                    textDecoration: "none",
                    fontSize: 16,
                  }}
                >
                  {speeldag}
                </Link>
              ))}
            </div>
          </details>

          {deadline && (
            <div
              className="mb-5 rounded-2xl font-black"
              style={{
                backgroundColor: "#FCEA10",
                color: "black",
                minHeight: "80px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                whiteSpace: "nowrap",
              }}
            >
              ⏳ Deadline: {formatDeadline(deadline)}
            </div>
          )}

          {selectedSpeeldag === "Speeldag 1" && (
            <div className="mb-5 rounded-2xl bg-white p-6 text-black">
              <h2 className="mb-5 text-center text-2xl font-black">
                🏆 Bonusvragen
              </h2>

              <label className="mb-2 block text-sm font-black text-gray-500">
                WK winnaar — 6 punten
              </label>

              <select
                name="world_cup_winner"
                defaultValue={worldCupWinner}
                className="mb-5 w-full rounded-xl border p-3 text-center text-lg font-bold"
              >
                <option value="">Kies WK winnaar</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.name}>
                    {team.name}
                  </option>
                ))}
              </select>

              <label className="mb-2 block text-sm font-black text-gray-500">
                Topschutter — 4 punten
              </label>

              <PlayerSearch players={players} defaultValue={topScorer} />
            </div>
          )}

          {params.saved && (
            <p className="mb-4 rounded-xl bg-green-100 p-3 text-center font-bold text-green-800">
              Voorspellingen opgeslagen!
            </p>
          )}

          {params.error && (
            <p className="mb-4 rounded-xl bg-red-100 p-3 text-center font-bold text-red-800">
              {params.error}
            </p>
          )}

          <div className="flex flex-col gap-5">
            {matches.map((match) => {
              const prediction = getPrediction(match.id);
              const selectedPick = prediction?.result_pick || "X";

              return (
                <div
                  key={match.id}
                  style={{
                    overflow: "hidden",
                    borderRadius: 18,
                    backgroundColor: "white",
                    color: "black",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.22)",
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

  <details style={{ position: "relative" }}>
  <summary
    style={{
      listStyle: "none",
      cursor: "pointer",
      fontSize: 15,
      whiteSpace: "nowrap",
    }}
  >
    {match.group_name || ""} ▼
  </summary>

  <div
    style={{
      position: "absolute",
      right: 0,
      top: 30,
      width: 290,
      backgroundColor: "#fff8b8",
      color: "black",
      border: "2px solid #FCEA10",
      borderRadius: 16,
      padding: 14,
      zIndex: 999,
      boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
    }}
  >
    <div
      style={{
        fontSize: 18,
        fontWeight: 900,
        marginBottom: 10,
        textAlign: "center",
      }}
    >
      Uitslagen {match.group_name}
    </div>

    {getGroupResults(match.group_name).length === 0 ? (
      <div style={{ textAlign: "center", fontWeight: 800 }}>
        Nog geen uitslagen.
      </div>
    ) : (
      getGroupResults(match.group_name).map((item, index) => (
        <div
          key={index}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: 8,
            alignItems: "center",
            padding: "8px 0",
            borderBottom:
              index === getGroupResults(match.group_name).length - 1
                ? "none"
                : "1px solid rgba(0,0,0,0.15)",
            fontSize: 13,
            fontWeight: 900,
          }}
        >
          <div style={{ textAlign: "right" }}>{item.home_team}</div>
          <div
  style={{
    fontSize: 18,
    textAlign: "center",
    fontWeight: 900,
  }}
>
  {item.result?.home_score} - {item.result?.away_score}
</div>
          <div>{item.away_team}</div>
        </div>
      ))
    )}
  </div>
</details>
</div>

                  <div className="p-6">
                    <div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 80px 1fr",
    alignItems: "start",
    gap: 12,
    marginBottom: 12,
  }}
>
  <div style={{ textAlign: "center", minWidth: 0 }}>
    {renderFlag(match.home_flag, match.home_team)}
    <div
      style={{
        fontWeight: 900,
        lineHeight: 1.15,
        wordBreak: "normal",
      }}
    >
      {match.home_team}
    </div>
  </div>

  <div
    style={{
      fontSize: 26,
      fontWeight: 900,
      textAlign: "center",
      paddingTop: 28,
    }}
  >
    VS
  </div>

  <div style={{ textAlign: "center", minWidth: 0 }}>
    {renderFlag(match.away_flag, match.away_team)}
    <div
      style={{
        fontWeight: 900,
        lineHeight: 1.15,
        wordBreak: "normal",
      }}
    >
      {match.away_team}
    </div>
  </div>
</div>

                    {match.match_time && (
                      <p className="mb-5 text-center text-sm font-black text-gray-500">
                        🕒 {match.match_time?.slice(0, 5)}
                      </p>
                    )}

                    <p className="mb-3 text-center text-sm font-black text-gray-500">
                      1X2
                    </p>

                    <div className="mb-6 grid grid-cols-3 gap-3">
                      {["1", "X", "2"].map((value) => (
                        <label key={value} className="cursor-pointer">
                          <input
                            type="radio"
                            name={`result_${match.id}`}
                            value={value}
                            defaultChecked={selectedPick === value}
                            className="peer sr-only"
                          />

                          <span className="block rounded-xl border-2 border-black bg-white py-3 text-center text-xl font-black peer-checked:bg-yellow-300">
                            {value}
                          </span>
                        </label>
                      ))}
                    </div>

                    <p className="mb-3 text-center text-sm font-black text-gray-500">
                      Exacte score
                    </p>

                    <div className="flex items-center justify-center gap-4">
                      <input
                        name={`home_${match.id}`}
                        type="number"
                        min="0"
                        defaultValue={prediction?.home_score ?? ""}
                        className="w-20 rounded-xl border p-3 text-center text-xl"
                      />

                      <span className="text-2xl font-bold">-</span>

                      <input
                        name={`away_${match.id}`}
                        type="number"
                        min="0"
                        defaultValue={prediction?.away_score ?? ""}
                        className="w-20 rounded-xl border p-3 text-center text-xl"
                      />
                    </div>
                    {isTriondaMatch(match.speeldag) && (
  <div
    style={{
      marginTop: 24,
      borderTop: "1px solid rgba(0,0,0,0.12)",
      paddingTop: 20,
    }}
  >
    
<div
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  }}
>
  <img
    src="/trionda.svg"
    alt="Trionda"
    style={{
      width: 32,
      height: 32,
    }}
  />

  <h3
    style={{
      fontSize: 22,
      fontWeight: 900,
      margin: 0,
    }}
  >
    Trionda Challenge
  </h3>
</div>
    <label className="mb-2 block text-sm font-black text-gray-500">
      {"\u26BD\uFE0E"} Eerste doelpuntenmaker — 2 punten
    </label>

    <select
      name={`trionda_first_scorer_${match.id}`}
      defaultValue={getTriondaPrediction(match.id)?.first_scorer || ""}
      className="mb-5 w-full rounded-xl border p-3 text-center text-lg font-bold"
    >
      <option value="">Kies speler</option>
      <optgroup label={match.home_team}>
  {getPlayersForTeam(match.home_team).map((player) => (
    <option key={`scorer-home-${match.id}-${player.name}`} value={player.name}>
      {player.name}
    </option>
  ))}
</optgroup>

<optgroup label={match.away_team}>
  {getPlayersForTeam(match.away_team).map((player) => (
    <option key={`scorer-away-${match.id}-${player.name}`} value={player.name}>
      {player.name}
    </option>
  ))}
</optgroup>
    </select>

    <label className="mb-2 block text-sm font-black text-gray-500">
      🟨 Speler met gele kaart — 2 punten
    </label>

    <select
      name={`trionda_yellow_card_${match.id}`}
      defaultValue={getTriondaPrediction(match.id)?.yellow_card_player || ""}
      className="w-full rounded-xl border p-3 text-center text-lg font-bold"
    >
      <option value="">Kies speler</option>
      <optgroup label={match.home_team}>
  {getPlayersForTeam(match.home_team).map((player) => (
    <option key={`yellow-home-${match.id}-${player.name}`} value={player.name}>
      {player.name}
    </option>
  ))}
</optgroup>

<optgroup label={match.away_team}>
  {getPlayersForTeam(match.away_team).map((player) => (
    <option key={`yellow-away-${match.id}-${player.name}`} value={player.name}>
      {player.name}
    </option>
  ))}
</optgroup>
    </select>

    <p
      style={{
        marginTop: 12,
        textAlign: "center",
        fontSize: 13,
        fontWeight: 900,
        color: "#666",
      }}
    >
      🎯 Beide juist in dezelfde match = +1 bonuspunt
    </p>
  </div>
)}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="submit"
            className="mt-8 w-full rounded-xl py-4 text-xl font-bold text-black"
            style={{ backgroundColor: "#FCEA10" }}
          >
            Mijn voorspellingen opslaan
          </button>
        </form>
      </div>
    </main>
  );
}
