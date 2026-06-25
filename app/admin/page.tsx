import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import Menu from "../components/menu";

type Match = {
  id: number;
  speeldag: string | null;
  match_date: string;
  match_time: string | null;
  home_team: string;
  away_team: string;
  fixture_id: number | null;
};

type Result = {
  match_id: number;
  home_score: number | null;
  away_score: number | null;
};

type TriondaResult = {
  match_id: number;
  first_scorer: string | null;
  yellow_card_players: string[] | null;
};

type Team = {
  id: number;
  name: string;
  api_name: string | null;
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

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    fixtures_synced?: string;
    results_synced?: string;
  }>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  let username = "Speler";

  if (!userId) {
    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#A30000",
          color: "white",
          padding: 32,
        }}
      >
        <h1>Geen toegang</h1>
        <p>Je moet eerst aanmelden.</p>
      </main>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, is_admin")
    .eq("id", userId)
    .single();

  username = profile?.username || "Speler";

  if (!profile?.is_admin) {
    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#A30000",
          color: "white",
          padding: 32,
        }}
      >
        <h1>Geen toegang</h1>
        <p>Alleen de beheerder kan deze pagina bekijken.</p>
      </main>
    );
  }

  const { data: matchesData } = await supabase
    .from("matches")
    .select(
      "id, speeldag, match_date, match_time, home_team, away_team, fixture_id"
    )
    .order("id", { ascending: true });

  const { data: resultsData } = await supabase
    .from("match_results")
    .select("*");

    const { data: triondaResultsData } = await supabase
  .from("trionda_results")
  .select("match_id, first_scorer, yellow_card_players");

  const { data: teamsData } = await supabase
    .from("teams")
    .select("id, name, api_name")
    .order("name", { ascending: true });

    const playersData = await fetchAllPlayers(supabase);

  const { data: settingsData } = await supabase.from("app_settings").select("*");

  const matches: Match[] = matchesData || [];
  const results: Result[] = resultsData || [];
  const triondaResults: TriondaResult[] = triondaResultsData || [];
  const teams: Team[] = teamsData || [];
  const players: Player[] = playersData || [];

  const syncedCount = matches.filter((match) => match.fixture_id).length;

  const actualWinner =
    settingsData?.find((setting) => setting.key === "actual_world_cup_winner")
      ?.value || "";

  const actualTopScorer =
    settingsData?.find((setting) => setting.key === "actual_top_scorer")
      ?.value || "";

  function getResult(matchId: number) {
    return results.find((result) => result.match_id === matchId);
  }

  function getTriondaResult(matchId: number) {
  return triondaResults.find((result) => result.match_id === matchId);
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
    (player: Player) =>
      player.team_name &&
      player.team_name.toLowerCase().trim() === apiName
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

  return (
    <main
      className="min-h-screen px-6 py-8 text-white"
      style={{ backgroundColor: "#A30000" }}
    >
      <div className="mx-auto max-w-md">
        <div style={{ marginBottom: 20 }}>
          <Menu username={username} isAdmin={true} />
        </div>

        <h1 className="mb-8 text-center text-3xl font-black">👑 Admin</h1>

        <form action="/api/admin/sync-results" method="POST">
          <button
            type="submit"
            className="mb-6 w-full rounded-xl py-4 text-xl font-bold text-black"
            style={{ backgroundColor: "#4ADE80" }}
          >
            ⚽ Uitslagen synchroniseren
          </button>
        </form>
        <form action="/api/admin/sync-players" method="POST">
  <button
    type="submit"
    className="mb-6 w-full rounded-xl py-4 text-xl font-bold text-black"
    style={{ backgroundColor: "#38BDF8" }}
  >
    👥 Spelers synchroniseren
  </button>
</form>

        {params.saved && (
          <p className="mb-4 rounded-xl bg-green-100 p-3 text-center font-bold text-green-800">
            Opgeslagen en punten herberekend!
          </p>
        )}

        {params.fixtures_synced !== undefined && (
          <p className="mb-4 rounded-xl bg-green-100 p-3 text-center font-bold text-green-800">
            Fixture IDs gesynchroniseerd: {params.fixtures_synced}
          </p>
        )}

        {params.results_synced !== undefined && (
          <p className="mb-4 rounded-xl bg-green-100 p-3 text-center font-bold text-green-800">
            Uitslagen gesynchroniseerd: {params.results_synced}
          </p>
        )}

        <div className="mb-6 rounded-2xl bg-white p-5 text-center text-black">
          <div className="text-sm font-black text-gray-500">
            Fixture koppeling
          </div>
          <div className="mt-1 text-2xl font-black">
            {syncedCount} / {matches.length}
          </div>
          <div className="text-sm font-bold text-gray-500">
            wedstrijden gekoppeld aan API-Football
          </div>
        </div>

        <form action="/api/admin/sync-fixtures" method="POST">
          <button
            type="submit"
            className="mb-6 w-full rounded-xl py-4 text-xl font-bold text-black"
            style={{ backgroundColor: "#FCEA10" }}
          >
            🔄 Fixture IDs synchroniseren
          </button>
        </form>

        <form action="/api/admin/results" method="POST">
          <div className="mb-6 rounded-2xl bg-white p-6 text-black">
            <h2 className="mb-5 text-center text-2xl font-black">
              🏆 Eindbonussen
            </h2>

            <label className="mb-2 block text-sm font-black text-gray-500">
              Echte WK winnaar
            </label>

            <select
              name="actual_world_cup_winner"
              defaultValue={actualWinner}
              className="mb-5 w-full rounded-xl border p-3 text-center text-lg font-bold"
            >
              <option value="">Nog niet ingevuld</option>
              {teams.map((team) => (
                <option key={team.id} value={team.name}>
                  {team.name}
                </option>
              ))}
            </select>

            <label className="mb-2 block text-sm font-black text-gray-500">
              Echte topschutter
            </label>

            <input
              name="actual_top_scorer"
              type="text"
              defaultValue={actualTopScorer}
              placeholder="Bijvoorbeeld Mbappé"
              className="w-full rounded-xl border p-3 text-center text-lg font-bold"
            />
          </div>

          <div className="flex flex-col gap-5">
            {matches.map((match) => {
              const result = getResult(match.id);

              return (
                <div
                  key={match.id}
                  className="rounded-2xl bg-white p-6 text-black"
                >
                  <div className="mb-3 text-center text-sm font-black text-gray-500">
                    {match.speeldag} — {match.match_date}{" "}
                    {match.match_time || ""}
                  </div>

                  <div className="mb-2 text-center text-xs font-black text-gray-400">
                    API fixture: {match.fixture_id || "nog niet gekoppeld"}
                  </div>

                  <h2 className="mb-5 text-center text-2xl font-black">
                    {match.home_team} - {match.away_team}
                  </h2>

                  <div className="flex items-center justify-center gap-4">
                    <input
                      name={`home_${match.id}`}
                      type="number"
                      min="0"
                      defaultValue={result?.home_score ?? ""}
                      className="w-20 rounded-xl border p-3 text-center text-xl"
                    />

                    <span className="text-2xl font-bold">-</span>

                    <input
                      name={`away_${match.id}`}
                      type="number"
                      min="0"
                      defaultValue={result?.away_score ?? ""}
                      className="w-20 rounded-xl border p-3 text-center text-xl"
                    />
                  </div>
                  {isTriondaMatch(match.speeldag) && (
  <div
    style={{
      marginTop: 22,
      paddingTop: 18,
      borderTop: "1px solid rgba(0,0,0,0.15)",
    }}
  >
    <h3 className="mb-4 text-center text-xl font-black">
      🎁 Trionda resultaat
    </h3>

    <label className="mb-2 block text-sm font-black text-gray-500">
      ⚽ Eerste doelpuntenmaker
    </label>

    <select
  name={`trionda_first_scorer_${match.id}`}
  defaultValue={getTriondaResult(match.id)?.first_scorer || ""}
  className="mb-5 w-full rounded-xl border p-3 text-center text-lg font-bold"
>
  <option value="">Nog niet ingevuld</option>

  <optgroup label={match.home_team}>
    {getPlayersForTeam(match.home_team).map((player) => (
      <option key={`admin-scorer-home-${match.id}-${player.name}`} value={player.name}>
        {player.name}
      </option>
    ))}
  </optgroup>

  <optgroup label={match.away_team}>
    {getPlayersForTeam(match.away_team).map((player) => (
      <option key={`admin-scorer-away-${match.id}-${player.name}`} value={player.name}>
        {player.name}
      </option>
    ))}
  </optgroup>
</select>

    <label className="mb-2 block text-sm font-black text-gray-500">
  🟨 Spelers met gele kaart
</label>

<div
  className="rounded-xl border p-4"
  style={{
    maxHeight: 260,
    overflowY: "auto",
    backgroundColor: "#fffdf0",
  }}
>
  <div className="mb-3 font-black">{match.home_team}</div>

  {getPlayersForTeam(match.home_team).map((player) => (
    <label
      key={`yellow-home-${match.id}-${player.name}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 8,
        fontWeight: 800,
      }}
    >
      <input
        type="checkbox"
        name={`trionda_yellow_cards_${match.id}`}
        value={player.name}
        defaultChecked={
          getTriondaResult(match.id)?.yellow_card_players?.includes(
            player.name
          ) || false
        }
      />
      {player.name}
    </label>
  ))}

  <div className="mb-3 mt-5 font-black">{match.away_team}</div>

  {getPlayersForTeam(match.away_team).map((player) => (
    <label
      key={`yellow-away-${match.id}-${player.name}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 8,
        fontWeight: 800,
      }}
    >
      <input
        type="checkbox"
        name={`trionda_yellow_cards_${match.id}`}
        value={player.name}
        defaultChecked={
          getTriondaResult(match.id)?.yellow_card_players?.includes(
            player.name
          ) || false
        }
      />
      {player.name}
    </label>
  ))}
</div>
  </div>
)}
                </div>
              );
            })}
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-xl py-4 text-xl font-bold text-black"
            style={{ backgroundColor: "#FCEA10" }}
          >
            Alles opslaan en punten herberekenen
          </button>
        </form>
      </div>
    </main>
  );
}